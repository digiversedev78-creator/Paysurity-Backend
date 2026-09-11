'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MissionControlHub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% -20%, rgba(56, 189, 248, 0.15) 0%, transparent 70%), #000',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      padding: '40px 20px',
      lineHeight: 1.6
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        
        * { box-sizing: border-box; }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 50px; animation: fadeDown 0.6s ease-out forwards; }
        .title { font-size: clamp(1.8rem, 5vw, 2.5rem); font-weight: 900; letter-spacing: -0.04em; margin: 0 0 10px 0; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { font-size: clamp(0.9rem, 3vw, 1.05rem); color: #9ca3af; font-weight: 500; margin: 0; }
        .grid-layout { display: grid; grid-template-columns: 1fr; gap: 30px; animation: fadeUp 0.8s ease-out forwards; }
        @media(min-width: 768px) { .grid-layout { grid-template-columns: 1fr 1fr; } }
        
        .section-title { fontSize: '0.85rem'; color: '#6b7280'; textTransform: 'uppercase'; letterSpacing: '0.1em'; marginBottom: '16px'; fontWeight: 700; borderBottom: '1px solid rgba(255,255,255,0.05)'; paddingBottom: '8px'; }

        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; transition: all 0.3s ease; position: relative; overflow: hidden; text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .card:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(56, 189, 248, 0.4); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1); }
        .card-icon { font-size: 1.8rem; background: rgba(255,255,255,0.05); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .card-content { flex: 1; }
        .card-title { font-size: 1rem; font-weight: 700; margin: 0 0 4px 0; color: #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
        .card-desc { font-size: 0.75rem; color: #9ca3af; margin: 0; line-height: 1.4; }

        .guide-container { background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 20px; padding: 30px; height: 100%; }
        .guide-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .guide-title { font-size: 1.4rem; font-weight: 800; color: #10b981; margin: 0; }
        
        .step-item { display: flex; gap: 16px; margin-bottom: 24px; }
        .step-number { width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; border: 1px solid rgba(16, 185, 129, 0.3); }
        .step-content h4 { margin: 0 0 6px 0; font-size: 1.05rem; color: #f3f4f6; }
        .step-content p { margin: 0; font-size: 0.9rem; color: #9ca3af; }
        
        .badge { display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(56, 189, 248, 0.3); }
        .badge-green { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
        
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="container">
        <header className="header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#d1d5db', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8'}}></span>
            Staging Mission Control
          </div>
          <h1 className="title">PaySurity Ecosystem Hub</h1>
          <p className="subtitle">Unified Stakeholder Access to all Live Infrastructure, Dashboards, and Demos.</p>
        </header>

        <div className="grid-layout">
          
          {/* Column 1: Core Dashboards */}
          <div>
            <h3 className="section-title">Core Dashboards</h3>
            
            <a href="https://paysurity-admin-portal-44gyeebm6a-uc.a.run.app" target="_blank" rel="noreferrer" className="card">
              <div className="card-icon">👑</div>
              <div className="card-content">
                <h3 className="card-title">Platform Super Admin <span className="badge">God Mode</span></h3>
                <p className="card-desc">Global oversight. Approve KYC/KYB, set global fees, manage tenant lifecycle.</p>
              </div>
            </a>

            <a href="https://paysurity-admin-portal-44gyeebm6a-uc.a.run.app/sub-admin" target="_blank" rel="noreferrer" className="card">
              <div className="card-icon">🛡️</div>
              <div className="card-content">
                <h3 className="card-title">Sub Super Admin</h3>
                <p className="card-desc">Restricted oversight view. Handled by customer support and compliance teams.</p>
              </div>
            </a>

            <Link href="/login" className="card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <h3 className="card-title">Tenant Admin Dashboard <span className="badge badge-green">Primary</span></h3>
                <p className="card-desc">Full store oversight. Trigger T+1 settlements, view analytics, process refunds.</p>
              </div>
            </Link>

            <Link href="/login?role=cashier" className="card">
              <div className="card-icon">👤</div>
              <div className="card-content">
                <h3 className="card-title">Tenant Employee (Cashier)</h3>
                <p className="card-desc">Restricted view. Accept payments, view daily tips, no settlement access.</p>
              </div>
            </Link>

            <a href="https://paysurity-public-website-44gyeebm6a-uc.a.run.app" target="_blank" rel="noreferrer" className="card">
              <div className="card-icon">🌐</div>
              <div className="card-content">
                <h3 className="card-title">Public Marketing Site</h3>
                <p className="card-desc">The merchant-facing storefronts and initial onboarding funnel.</p>
              </div>
            </a>
          </div>

          {/* Column 2: Point of Sale Experiences */}
          <div>
            <h3 className="section-title"> Prospective Tenants & POS </h3>
            
            <Link href="/v1-demo?demo=house" className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="card-icon">🍛</div>
              <div className="card-content">
                <h3 className="card-title">POS Restaurant <span className="badge badge-green">House of Biryani</span></h3>
                <p className="card-desc">Kitchen Display System (KDS), table management, tipping mechanics.</p>
              </div>
            </Link>

            <Link href="/v1-demo?demo=chicago" className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="card-icon">👗</div>
              <div className="card-content">
                <h3 className="card-title">POS Retail <span className="badge badge-green">Chicago / Ashiana</span></h3>
                <p className="card-desc">Barcode scanning, inventory sync, and multi-location employee payouts.</p>
              </div>
            </Link>

            <Link href="/v1-demo?demo=tawakkul" className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="card-icon">🛒</div>
              <div className="card-content">
                <h3 className="card-title">POS ECommerce <span className="badge badge-green">Tawakkul</span></h3>
                <p className="card-desc">Online grocery fulfillment, digital wallet bridging, pickup orchestration.</p>
              </div>
            </Link>

            <Link href="/v1-demo?demo=grand" className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="card-icon">🔖</div>
              <div className="card-content">
                <h3 className="card-title">POS Smoke Shop <span className="badge badge-green">Grand Tobacco</span></h3>
                <p className="card-desc">High-risk protocol, age verification gating, and compliance logging.</p>
              </div>
            </Link>

            <Link href="/v1-demo?demo=chicago" className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <div className="card-icon">✨</div>
              <div className="card-content">
                <h3 className="card-title" style={{ color: '#34d399' }}>Original Concept Demo V1</h3>
                <p className="card-desc">The original V1 investor prototype with simulated batch logic.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
