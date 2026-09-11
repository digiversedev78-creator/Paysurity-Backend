/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Admin Portal — utilitarian red-black command center palette
        admin: {
          bg:          '#080809',
          sidebar:     '#0d0d0f',
          card:        '#111114',
          border:      '#1e1e22',
          muted:       '#2a2a30',
          accent:      '#dc2626',   // red-600 — authority/danger
          'accent-hover': '#b91c1c',
          gold:        '#f59e0b',   // amber — warnings
          success:     '#10b981',   // emerald — approvals
          // ── Sub-Super Admin brand tokens (approved spec §1) ──────────────
          corporate:   '#0A74DA',   // corporate headers — royal blue
          ledger:      '#00C9A7',   // ledger data assets — teal
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-up': 'fadeUp 0.2s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
