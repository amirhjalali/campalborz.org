/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F0',
          warm: '#f3ebe0',
        },
        ink: {
          DEFAULT: '#1a1a18',
          soft: '#4a4a42',
          faint: '#8a8578',
        },
        terracotta: '#a0522d',
        tan: {
          50: '#FAF7F0',
          100: '#f3ebe0',
          200: '#e8ddd0',
          300: '#d4c8b4',
          400: '#c4b89a',
          600: '#a89870',
        },
        gold: {
          DEFAULT: '#b8960c',
          muted: '#c4a94d',
          dark: '#96800a',
          400: '#c4a94d',
          500: '#b8960c',
          600: '#a08000',
        },
        sage: {
          DEFAULT: '#5a6b5a',
          600: '#4a5b4a',
        },
        'warm-border': '#e0d8cc',
        success: '#2e7d32',
        warning: '#c98c18',
        error: '#b03b2e',
        info: '#2f5470',
      },
      fontFamily: {
        accent: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      minHeight: {
        'hero': '100vh',
        'hero-sm': '70vh',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
