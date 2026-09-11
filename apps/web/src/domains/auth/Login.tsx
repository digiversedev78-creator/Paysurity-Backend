'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-44gyeebm6a-uc.a.run.app';

interface LoginResponse {
  accessToken?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  message?: string;
}

export const Login = () => {
  const router = useRouter();
  const { token, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => setApiOnline(r.ok))
      .catch(() => setApiOnline(false));
    if (token) router.push('/admin');
  }, [token, router]);

  const doLogin = async (creds: { email: string; password: string; tenantId?: string }) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: creds.email,
        password: creds.password,
        ...(creds.tenantId ? { tenantId: creds.tenantId } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data: LoginResponse = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid credentials');
    if (data.mfaRequired && data.tempToken) {
      setTempToken(data.tempToken);
      return null;
    }
    return data.accessToken ?? null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tok = await doLogin({ email, password, tenantId });
      if (tok) { setToken(tok); router.push('/admin'); }
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('API server not responding. Start the API server first.');
      } else {
        setError(err.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: mfaCode }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid MFA code');
      if (data.accessToken) { setToken(data.accessToken); router.push('/admin'); }
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%), #050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input { color-scheme: dark; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        .field:focus-within label { color: #a5b4fc; }
        .input-field {
          width: 100%; padding: 12px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 0.9rem; outline: none;
          transition: border-color 200ms, box-shadow 200ms;
          font-family: inherit;
        }
        .input-field:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .btn-primary {
          width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer;
          transition: all 200ms; box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.5);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-demo-tenant {
          width: 100%; padding: 0; border-radius: 14px;
          border: none; cursor: pointer; font-family: inherit;
          transition: all 220ms; text-align: left;
          position: relative; overflow: hidden;
        }
        .btn-demo-tenant:hover { transform: translateY(-2px); }
        .btn-demo-tenant:disabled { opacity: 0.6; cursor: wait; transform: none; }
        .btn-back {
          width: 100%; padding: 11px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5); font-size: 0.85rem; cursor: pointer;
          transition: all 150ms; font-family: inherit;
        }
        .btn-back:hover { background: rgba(255,255,255,0.06); color: #fff; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; animation: spin 0.8s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480, animation: 'slideUp 0.45s ease forwards' }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 0 40px rgba(99,102,241,0.4)', fontSize: 30,
          }}>💳</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            PaySurity
          </h1>
          <p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontWeight: 500 }}>
            Merchant Dashboard
          </p>
        </div>

        {/* ── MFA screen ── */}
        {tempToken ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
            <form onSubmit={handleMfa} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                  Two-Factor Authentication
                </h2>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Enter your 6-digit authenticator code</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>MFA Code</label>
                <input className="input-field" type="text" inputMode="numeric" maxLength={6}
                  value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••" required
                  style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem' }} />
              </div>
              {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.8rem' }}>⚠️ {error}</div>}
              <button type="submit" className="btn-primary" disabled={loading || mfaCode.length !== 6}>
                {loading ? <><span className="spinner" />Verifying...</> : 'Verify Code →'}
              </button>
              <button type="button" className="btn-back" onClick={() => setTempToken(null)}>← Back to login</button>
            </form>
          </div>

        ) : (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 24, backdropFilter: 'blur(20px)',
            }}>
              {/* API status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                padding: '7px 12px', borderRadius: 8,
                background: apiOnline === false ? 'rgba(239,68,68,0.08)' : apiOnline === true ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${apiOnline === false ? 'rgba(239,68,68,0.25)' : apiOnline === true ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: apiOnline === false ? '#ef4444' : apiOnline === true ? '#10b981' : '#f59e0b',
                  animation: apiOnline === null ? 'pulse 1s infinite' : 'none' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600,
                  color: apiOnline === false ? '#fca5a5' : apiOnline === true ? '#6ee7b7' : '#fcd34d' }}>
                  {apiOnline === null ? 'Checking API…' : apiOnline ? 'API Connected' : 'API Unavailable'}
                </span>
              </div>

              {/* Stakeholder Quick-Access Credentials Helper */}
              <div style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.7rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}>
                  Restricted Demo Credentials
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 10, alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Admin</span>
                    <code style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>super-admin@paysurity.com</code>
                    <button type="button" onClick={() => { setEmail('super-admin@paysurity.com'); setPassword('demo123!'); }} style={{ background: '#6366f120', border: '1px solid #6366f140', color: '#a5b4fc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.6rem' }}>Fill</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 10, alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>HOB Owner</span>
                    <code style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>owner@houseofbiryani.com</code>
                    <button type="button" onClick={() => { setEmail('owner@houseofbiryani.com'); setPassword('demo123!'); }} style={{ background: '#6366f120', border: '1px solid #6366f140', color: '#a5b4fc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.6rem' }}>Fill</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 10, alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Merchant</span>
                    <code style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>fatima.khan@1001.paysurity.local</code>
                    <button type="button" onClick={() => { setEmail('fatima.khan@1001.paysurity.local'); setPassword('demo123!'); }} style={{ background: '#6366f120', border: '1px solid #6366f140', color: '#a5b4fc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.6rem' }}>Fill</button>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'center', gap: 12 }}>
                     <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Common Password: <code style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>demo123!</code></span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 7 }}>
                    Email Address
                    <button type="button" onClick={() => {setEmail('super-admin@paysurity.com'); setPassword('demo123!');}} style={{background:'none', border:'none', color:'#a5b4fc', fontSize:'0.65rem', cursor:'pointer', textDecoration:'underline'}}>Use Demo Admin</button>
                  </label>
                  <input id="email" className="input-field" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="admin@yourbusiness.com"
                    autoComplete="email" required />
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 7 }}>
                    Password
                    <button type="button" onClick={() => {setEmail('fatima.khan@1001.paysurity.local'); setPassword('demo123!');}} style={{background:'none', border:'none', color:'#a5b4fc', fontSize:'0.65rem', cursor:'pointer', textDecoration:'underline'}}>Use Demo Merchant</button>
                  </label>
                  <input id="password" className="input-field" type="password" value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    autoComplete="current-password" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 7 }}>
                    Tenant ID <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input id="tenantId" className="input-field" type="text" value={tenantId}
                    onChange={e => setTenantId(e.target.value)} placeholder="your-tenant-slug" />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.8rem' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" />Authenticating...</> : 'Sign In →'}
                </button>
              </form>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.68rem', color: 'rgba(255,255,255,0.15)' }}>
          PaySurity Merchant Platform v5.0 &nbsp;·&nbsp; Confidential Demo Build
        </p>
      </div>
    </div>
  );
}
