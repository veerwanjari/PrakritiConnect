/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canopy: {
          50: '#f4f8ef',
          100: '#e6f0da',
          200: '#cde2b7',
          300: '#aed489',
          400: '#8fd14f',
          500: '#6fae3d',
          600: '#4c8b36',
          700: '#386428',
          800: '#2b4d22',
          900: '#1f3a20',
          950: '#132513',
        },
        bark: {
          400: '#a98a63',
          500: '#8a6b4a',
          600: '#6b4f36',
          700: '#4f3a28',
        },
        pond: {
          400: '#5fa3b0',
          500: '#3e7c8a',
          600: '#2f616c',
        },
        sun: {
          400: '#eebb55',
          500: '#e3a73a',
          600: '#c98a2c',
        },
        clay: {
          400: '#d97a5f',
          500: '#c1462f',
          600: '#a23a26',
        },
      },
      boxShadow: {
        leaf: '0 20px 45px -20px rgba(31, 58, 32, 0.35)',
      },
      borderRadius: {
        leaf: '2rem 0.5rem 2rem 2rem',
      },
    },
  },
  plugins: [],
}
