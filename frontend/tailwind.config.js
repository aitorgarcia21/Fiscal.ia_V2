/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c5a572',
          light: '#e8cfa0',
          dark: '#1a2942',
        },
        secondary: {
          DEFAULT: '#234876',
          light: '#223c63',
        },
      },
      ringColor: {
        primary: '#c5a572',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  safelist: [
    {
      pattern: /ring-primary/,
      variants: ['focus'],
    },
    {
      pattern: /hover:shadow-\[0_0_20px_rgba\(197,165,114,0\.4\)\]/,
      variants: ['hover'],
    },
  ],
} 