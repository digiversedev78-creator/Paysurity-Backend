/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'ps-primary':     '#0F172A',
        'ps-accent':      '#3B82F6',
        'ps-success':     '#10B981',
        'ps-warning':     '#F59E0B',
        'ps-danger':      '#EF4444',
        'ps-info':        '#8B5CF6',
        'ps-bg-page':     '#09090B',
        'ps-bg-card':     '#18181B',
        'ps-bg-input':    '#27272A',
        'ps-border':      '#3F3F46',
        'ps-text':        '#FAFAFA',
        'ps-text-muted':  '#71717A',
      },
      animation: {
        'slide-in':    'slideIn 0.25s ease-out both',
        'fade-up':     'fadeUp 0.35s ease-out both',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
