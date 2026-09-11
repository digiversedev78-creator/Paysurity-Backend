'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { THEMES, EliteTierTheme } from '../theme';

interface Location {
  id: string;
  name: string;
  logoUrl?: string;
}

interface SidebarProps {
  brandName?: string;
  brandLetter?: string;
  theme?: EliteTierTheme;
  locations?: Location[];
}

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',    href: '/dashboard' },
  { icon: '🛒', label: 'Orders',       href: '/dashboard/orders' },
  { icon: '📋', label: 'Menu',         href: '/dashboard/menu' },
  { icon: '📦', label: 'Inventory',    href: '/dashboard/inventory' },
  { icon: '💰', label: 'Payroll',      href: '/dashboard/payroll' },
  { icon: '⚙️', label: 'Settings',     href: '/dashboard/settings' },
];

export default function Sidebar({ 
  brandName = 'House of Biryani', 
  brandLetter = 'H',
  theme = 'CORE_DARK',
  locations = [
    { id: 'loc_main', name: 'HOB Main Street', logoUrl: 'gs://paysurity-assets/HOB/logo_main.png' },
    { id: 'loc_express', name: 'HOB Express', logoUrl: 'gs://paysurity-assets/HOB/logo_express.png' }
  ]
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [currentLocId, setCurrentLocId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentLocId(localStorage.getItem('ps_current_location_id') || '');
    }
  }, []);

  const activeLocation = useMemo(() => 
    locations.find(l => l.id === currentLocId) || null
  , [locations, currentLocId]);

  const colors = useMemo(() => THEMES[theme], [theme]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const width = collapsed ? 64 : 240;

  return (
    <aside style={{
      width,
      background: colors.card,
      borderRight: `1px solid ${colors.border}`,
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      padding: '16px 0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      transition: 'width 200ms ease',
      overflowX: 'hidden',
    }}>
      
      {/* Brand Header */}
      <div style={{ padding: '0 12px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          <div style={{
            minWidth: 36, width: 36, height: 36,
            background: activeLocation?.logoUrl ? `url(${activeLocation.logoUrl.replace('gs://', 'https://storage.googleapis.com/')}) center/cover` : colors.gradient,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{!activeLocation?.logoUrl && brandLetter}</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap' }}>
                {activeLocation ? activeLocation.name : brandName}
              </div>
              <div style={{ fontSize: '0.65rem', color: colors.textMuted, whiteSpace: 'nowrap' }}>PaySurity Hierarchy Active</div>
            </div>
          )}
        </Link>
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textMuted }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Location Switcher */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
          <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>Switch Branch</label>
          <select 
            value={currentLocId}
            onChange={(e) => {
              localStorage.setItem('ps_current_location_id', e.target.value);
              setCurrentLocId(e.target.value);
              window.location.reload();
            }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 8px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <option value="">Global Tenant View</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: active ? 600 : 400, color: active ? '#fff' : colors.textSecondary,
              background: active ? colors.gradient : 'transparent',
            }}>
              <span>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
