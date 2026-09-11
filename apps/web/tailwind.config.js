/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Platform-wide canonical font — applies via font-sans utility class
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          primary:   '#2d6a4f',    // HOB deep green (menu page primary)
          darkgreen: '#1b4332',    // HOB dark green (headings, hover states)
          secondary: '#F0A500',    // HOB gold/amber (secondary accent)
          accent:    '#c77700',    // HOB price/badge accent
        },
      },
    },
  },
  plugins: [],
};
