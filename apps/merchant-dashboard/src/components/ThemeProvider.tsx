'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Next.js client-side hook
    const checkTheme = () => {
      // Attempt to crack open the tenant ID from storage or subdomains
      // For staging, we simulate the database dynamic theme configs
      const token = localStorage.getItem('paysurity_auth_token') || '';
      const tenantHost = window.location.host || '';
      
      const isBistroBeest = token.includes('bistrobeest') || tenantHost.includes('bistrobeest');
      const isTawakkul = token.includes('tawakkul') || tenantHost.includes('tawakkul');

      const root = document.documentElement;

      if (isTawakkul) {
        // Tawakkul Franchise: Emerald and Gold styling
        root.style.setProperty('--ps-accent', '#10B981'); 
        root.style.setProperty('--ps-accent-hover', '#059669'); 
        root.style.setProperty('--ps-bg-card', 'rgba(16, 185, 129, 0.05)'); 
      } else if (isBistroBeest) {
        // BistroBeest Signature: Crimson Red
        root.style.setProperty('--ps-accent', '#E11D48'); 
        root.style.setProperty('--ps-accent-hover', '#BE123C'); 
        root.style.setProperty('--ps-bg-card', 'rgba(225, 29, 72, 0.05)');
      } else {
        // Default Core PaySurity Branding (Indigo)
        root.style.setProperty('--ps-accent', '#6366f1'); 
        root.style.setProperty('--ps-accent-hover', '#4f46e5'); 
        root.style.setProperty('--ps-bg-card', 'rgba(255, 255, 255, 0.04)');
      }
    };

    checkTheme();
    // Re-check on push state variations if needed
    window.addEventListener('storage', checkTheme);
    return () => window.removeEventListener('storage', checkTheme);
  }, []);

  return <>{children}</>;
}
