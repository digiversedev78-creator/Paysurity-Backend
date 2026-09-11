export type EliteTierTheme = 'VIBRANT_SPICE' | 'MINIMALIST_ARTISANAL' | 'CORE_DARK';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  gradient: string;
}

export const THEMES: Record<EliteTierTheme, ThemeColors> = {
  VIBRANT_SPICE: {
    primary: '#f97316', // Orange 500
    secondary: '#ea580c', // Orange 600
    accent: '#fde047', // Yellow 300
    background: '#0c0a09', // Stone 950
    card: '#1c1917', // Stone 900
    textPrimary: '#fafaf9', // Stone 50
    textSecondary: '#d6d3d1', // Stone 300
    textMuted: '#78716c', // Stone 500
    border: '#292524', // Stone 800
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  MINIMALIST_ARTISANAL: {
    primary: '#18181b', // Zinc 900
    secondary: '#27272a', // Zinc 800
    accent: '#a1a1aa', // Zinc 400
    background: '#ffffff', // White
    card: '#fafafa', // Zinc 50
    textPrimary: '#09090b', // Zinc 950
    textSecondary: '#3f3f46', // Zinc 700
    textMuted: '#71717a', // Zinc 500
    border: '#e4e4e7', // Zinc 200
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  },
  CORE_DARK: {
    primary: '#6366f1', // Indigo 500
    secondary: '#8b5cf6', // Violet 500
    accent: '#c084fc', // Purple 400
    background: '#020617', // Slate 950
    card: '#0f172a', // Slate 900
    textPrimary: '#f8fafc', // Slate 50
    textSecondary: '#cbd5e1', // Slate 300
    textMuted: '#64748b', // Slate 500
    border: '#1e293b', // Slate 800
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
};

export function applyTheme(theme: EliteTierTheme) {
  if (typeof document === 'undefined') return;
  const colors = THEMES[theme];
  const root = document.documentElement;
  
  root.style.setProperty('--ps-primary', colors.primary);
  root.style.setProperty('--ps-secondary', colors.secondary);
  root.style.setProperty('--ps-accent', colors.accent);
  root.style.setProperty('--ps-bg', colors.background);
  root.style.setProperty('--ps-bg-card', colors.card);
  root.style.setProperty('--ps-text-primary', colors.textPrimary);
  root.style.setProperty('--ps-text-secondary', colors.textSecondary);
  root.style.setProperty('--ps-text-muted', colors.textMuted);
  root.style.setProperty('--ps-border', colors.border);
  root.style.setProperty('--ps-gradient', colors.gradient);
}
