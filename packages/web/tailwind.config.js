/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Playa Dust Earth Tones
        dust: {
          khaki: 'rgb(196, 165, 123)',
          grey: 'rgb(155, 155, 155)',
        },
        burnt: {
          sienna: 'rgb(160, 82, 45)',
        },
        sage: {
          green: 'rgb(135, 169, 107)',
        },
        desert: {
          sand: 'rgb(237, 201, 175)',
          night: 'rgb(44, 36, 22)',
          gold: 'rgb(212, 175, 55)', // antique gold
          orange: 'rgb(255, 107, 107)', // sunrise coral
        },
        saffron: {
          DEFAULT: 'rgb(255, 215, 0)', // royal gold
          light: 'rgb(255, 248, 240)', // warm white
          dark: 'rgb(212, 175, 55)', // antique gold
        },
        
        // Persian Luxury Accents (keeping old names for compatibility)
        persian: {
          emerald: 'rgb(80, 200, 120)',
          purple: 'rgb(160, 82, 45)', // Now maps to burnt sienna
          violet: 'rgb(212, 175, 55)', // Now maps to antique gold
          light: 'rgb(237, 201, 175)', // Now maps to desert sand
        },
        royal: {
          gold: 'rgb(255, 215, 0)',
        },
        antique: {
          gold: 'rgb(212, 175, 55)',
        },
        
        // Mystical Colors
        twilight: {
          purple: 'rgb(93, 78, 96)',
        },
        sunrise: {
          coral: 'rgb(255, 107, 107)',
        },
        moonlight: {
          silver: 'rgb(192, 192, 192)',
        },
        
        // Base Colors
        warm: {
          white: 'rgb(255, 248, 240)',
        },
        
        // Ethereum.org inspired neutrals (keep for compatibility)
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Crimson Text', 'serif'],
        ui: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mystical': 'linear-gradient(135deg, rgb(93, 78, 96) 0%, rgb(80, 200, 120) 50%, rgb(255, 215, 0) 100%)',
        'gradient-desert': 'linear-gradient(135deg, rgb(196, 165, 123) 0%, rgb(237, 201, 175) 50%, rgb(160, 82, 45) 100%)',
        'gradient-gold': 'linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(255, 215, 0) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'dust-float': 'dustFloat 15s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        dustFloat: {
          '0%, 100%': { 
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '0',
          },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { 
            transform: 'translateY(-100vh) translateX(50px) rotate(360deg)',
            opacity: '0',
          },
        },
        glow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'luxury': '0 20px 40px rgba(196, 165, 123, 0.2)',
        'luxury-hover': '0 25px 50px rgba(196, 165, 123, 0.3)',
        'night-glow': '0 0 30px rgba(80, 200, 120, 0.4)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};