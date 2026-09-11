'use client';

/**
 * PhotoEnhancer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-assisted product photo quality analyzer + enhancer.
 * Runs entirely in the browser via Canvas API — zero API cost, zero latency.
 *
 * Pipeline:
 *  1. Load raw image into off-screen canvas
 *  2. Analyse pixel data → brightness, contrast, saturation, sharpness
 *  3. Display quality score + specific actionable feedback
 *  4. One-click enhancement:
 *       a. Auto-levels  (histogram stretch)
 *       b. Saturation boost (HSL manipulation)
 *       c. S-curve contrast
 *       d. Unsharp mask / sharpening kernel
 *  5. Before / after comparison slider
 *  6. Callback: returns enhanced base64 image to parent
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metric {
  score: number;   // 0 – 100
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  issue: string | null; // human-readable advice, null = OK
}

interface QualityReport {
  overall: number;
  brightness: Metric;
  contrast: Metric;
  saturation: Metric;
  sharpness: Metric;
}

interface Props {
  /** raw base64 data-URL from camera/file input */
  src: string;
  /** called with the (possibly enhanced) image the user accepted */
  onAccept: (dataUrl: string) => void;
  /** user wants to re-take / re-upload */
  onRetake: () => void;
}

// ─── Pure pixel-math helpers (no DOM, testable) ───────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function metricLabel(score: number): Metric['label'] {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

function analysePixels(data: Uint8ClampedArray, width: number, height: number): QualityReport {
  const n = data.length / 4;
  let sumL = 0, sumL2 = 0, sumSat = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const L = 0.299 * r + 0.587 * g + 0.114 * b;
    sumL += L; sumL2 += L * L;
    const [, s] = rgbToHsl(r, g, b);
    sumSat += s;
  }

  const avgL = sumL / n;
  const variance = sumL2 / n - avgL * avgL;
  const stdDev = Math.sqrt(Math.max(0, variance));
  const avgSat = sumSat / n;

  // Laplacian sharpness — sampled every 4 px for speed
  let lapSum = 0, lapN = 0;
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const get = (xx: number, yy: number) => {
        const idx = (yy * width + xx) * 4;
        return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      };
      const lap = -4 * get(x, y) + get(x - 1, y) + get(x + 1, y) + get(x, y - 1) + get(x, y + 1);
      lapSum += lap * lap;
      lapN++;
    }
  }
  const sharpness = lapN > 0 ? Math.sqrt(lapSum / lapN) : 0;

  // Score each dimension
  const bScore = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(avgL - 140) * 1.4)));
  const cScore = Math.round(Math.min(100, stdDev * 1.9));
  const sScore = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(avgSat - 0.38) * 260)));
  const shScore = Math.round(Math.min(100, sharpness * 5.5));

  const overall = Math.round(bScore * 0.28 + cScore * 0.25 + sScore * 0.22 + shScore * 0.25);

  return {
    overall,
    brightness: {
      score: bScore, label: metricLabel(bScore),
      issue: avgL < 85 ? '📷 Too dark — move to brighter light or closer to window'
        : avgL > 205 ? '📷 Overexposed — avoid direct flash, use softer light'
          : null,
    },
    contrast: {
      score: cScore, label: metricLabel(cScore),
      issue: stdDev < 28 ? '🌫️ Low contrast — try a plain background to make subject pop' : null,
    },
    saturation: {
      score: sScore, label: metricLabel(sScore),
      issue: avgSat < 0.08 ? '🎨 Colors look washed out — ensure good lighting'
        : avgSat > 0.72 ? '🎨 Colors are oversaturated — try natural light instead of neon' : null,
    },
    sharpness: {
      score: shScore, label: metricLabel(shScore),
      issue: sharpness < 7 ? '🔍 Photo is blurry — hold phone steady, tap to focus first' : null,
    },
  };
}

// ─── Enhancement pipeline ─────────────────────────────────────────────────────

/** Stretch histogram to full 0-255 range per channel */
function autoLevels(data: Uint8ClampedArray): void {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (let i = 0; i < data.length; i += 4) {
    rMin = Math.min(rMin, data[i]);   rMax = Math.max(rMax, data[i]);
    gMin = Math.min(gMin, data[i+1]); gMax = Math.max(gMax, data[i+1]);
    bMin = Math.min(bMin, data[i+2]); bMax = Math.max(bMax, data[i+2]);
  }
  const rR = rMax - rMin || 1, gR = gMax - gMin || 1, bR = bMax - bMin || 1;
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = Math.round(((data[i]   - rMin) / rR) * 255);
    data[i+1] = Math.round(((data[i+1] - gMin) / gR) * 255);
    data[i+2] = Math.round(((data[i+2] - bMin) / bR) * 255);
  }
}

/** Boost saturation by factor (1.0 = no change, 1.3 = +30%) */
function boostSaturation(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i+1], data[i+2]);
    s = Math.min(1, s * factor);
    const [r, g, b] = hslToRgb(h, s, l);
    data[i] = r; data[i+1] = g; data[i+2] = b;
  }
}

/** Gentle S-curve for perception of higher contrast */
function sCurve(data: Uint8ClampedArray): void {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // Cubic hermite S-curve  
    const curved = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    // Blend 40% curve, 60% original to keep it subtle
    lut[i] = Math.round((curved * 0.4 + t * 0.6) * 255);
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]]; data[i+1] = lut[data[i+1]]; data[i+2] = lut[data[i+2]];
  }
}

/** Unsharp-mask style sharpening (3×3 kernel) */
function sharpen(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  // kernel: [0,-1,0,-1,5,-1,0,-1,0] — standard spatial sharpening
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (py * width + px) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += data[idx] * k; g += data[idx+1] * k; b += data[idx+2] * k;
        }
      }
      const o = (y * width + x) * 4;
      out[o]   = Math.min(255, Math.max(0, r));
      out[o+1] = Math.min(255, Math.max(0, g));
      out[o+2] = Math.min(255, Math.max(0, b));
      out[o+3] = data[o+3];
    }
  }
  return new ImageData(out, width, height);
}

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// ─── UI Component ─────────────────────────────────────────────────────────────

export default function PhotoEnhancer({ src, onAccept, onRetake }: Props) {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [analysing, setAnalysing] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [showOrig, setShowOrig] = useState(false); // for before/after toggle

  // ── Analyse on mount ──
  useEffect(() => {
    (async () => {
      setAnalysing(true);
      try {
        const img = await loadImg(src);
        const scale = Math.min(1, 500 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setReport(analysePixels(id.data, id.width, id.height));
      } catch { /* ignore */ }
      setAnalysing(false);
    })();
  }, [src]);

  // ── Enhancement pipeline ──
  const handleEnhance = useCallback(async () => {
    setEnhancing(true);
    try {
      const img = await loadImg(src);
      // Cap at 1400px wide to keep things snappy
      const maxW = 1400;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let id = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 1. Auto-levels
      autoLevels(id.data);
      // 2. Saturation (+25%)
      boostSaturation(id.data, 1.25);
      // 3. Contrast S-curve
      sCurve(id.data);
      ctx.putImageData(id, 0, 0);
      // 4. Sharpen (operates on ImageData copy to avoid feedback)
      id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(sharpen(id), 0, 0);

      const result = canvas.toDataURL('image/jpeg', 0.93);
      setEnhanced(result);

      // Re-analyse to show improved scores
      const id2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setReport(analysePixels(id2.data, id2.width, id2.height));
    } catch { /* ignore */ }
    setEnhancing(false);
  }, [src]);

  // ── Score colour ──
  const scoreColor = (s: number) =>
    s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : s >= 40 ? '#f97316' : '#ef4444';

  const displayed = showOrig ? src : (enhanced || src);
  const issues = report
    ? [report.brightness, report.contrast, report.saturation, report.sharpness]
        .filter(m => m.issue)
        .map(m => m.issue as string)
    : [];

  return (
    <div style={{
      background: 'rgba(9,9,11,0.98)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20, overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>AI Photo Inspector</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Analysing your product image…</div>
        </div>
      </div>

      {/* ── Image preview ── */}
      <div style={{ position: 'relative', background: '#000' }}>
        <img src={displayed} alt="product" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
        {enhanced && (
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            <button onMouseDown={() => setShowOrig(true)} onMouseUp={() => setShowOrig(false)}
              onTouchStart={() => setShowOrig(true)} onTouchEnd={() => setShowOrig(false)}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)', background: showOrig ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              Hold: Before
            </button>
            <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.8)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, backdropFilter: 'blur(8px)' }}>
              ✓ Enhanced
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 18 }}>

        {/* ── Quality score ── */}
        {analysing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: '#94a3b8', fontSize: '0.82rem' }}>
            <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Analysing photo quality…
          </div>
        ) : report ? (
          <>
            {/* Overall score ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                  <circle cx="30" cy="30" r="26" fill="none"
                    stroke={scoreColor(report.overall)} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - report.overall / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem', color: scoreColor(report.overall) }}>
                  {report.overall}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                  Photo Quality: {report.overall >= 80 ? 'Excellent 🌟' : report.overall >= 60 ? 'Good 👍' : report.overall >= 40 ? 'Fair — enhancement recommended' : 'Poor — enhancement strongly recommended'}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {([
                    ['Brightness', report.brightness],
                    ['Contrast', report.contrast],
                    ['Color', report.saturation],
                    ['Sharpness', report.sharpness],
                  ] as [string, Metric][]).map(([name, m]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#94a3b8' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor(m.score) }} />
                      {name} <span style={{ color: scoreColor(m.score), fontWeight: 700 }}>{m.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Issue list */}
            {issues.length > 0 && (
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f87171', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Issues Detected</div>
                {issues.map((issue, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: i < issues.length - 1 ? 5 : 0, lineHeight: 1.4 }}>
                    {issue}
                  </div>
                ))}
              </div>
            )}

            {/* Enhance button */}
            {!enhanced && (
              <button onClick={handleEnhance} disabled={enhancing}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: enhancing ? 'wait' : 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.88rem', marginBottom: 10,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  opacity: enhancing ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                {enhancing
                  ? '✨ Enhancing… (auto-levels · saturation · sharpening)'
                  : issues.length > 0
                    ? `✨ Auto-Enhance Photo (fix ${issues.length} issue${issues.length > 1 ? 's' : ''})`
                    : '✨ Auto-Enhance Anyway (polish & sharpen)'}
              </button>
            )}

            {enhanced && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.78rem', color: '#34d399', marginBottom: 10, fontWeight: 600 }}>
                ✅ Enhancement applied — auto-levels, +25% saturation, contrast curve, unsharp mask
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={onRetake}
                style={{ padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                📷 Re-take
              </button>
              <button onClick={() => onAccept(enhanced || src)}
                style={{ padding: '11px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                ✓ Use This Photo
              </button>
            </div>
          </>
        ) : null}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
