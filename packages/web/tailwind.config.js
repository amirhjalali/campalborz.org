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
        // Persian/Burning Man inspired colors
        persian: {
          purple: '#6B46C1',
          violet: '#8B5CF6',
          light: '#A78BFA',
        },
        desert: {
          gold: '#F59E0B',
          orange: '#FB923C',
          sand: '#FEF3C7',
        },
        midnight: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
          light: '#334155',
        },
        saffron: {
          DEFAULT: '#FCD34D',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
        dust: '#92400E',
        charcoal: '#18181B',
        smoke: '#71717A',
        // Ethereum.org inspired neutrals
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        persian: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #6B46C1 0%, #F59E0B 100%)',
        'card-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'accent-gradient': 'linear-gradient(135deg, #FCD34D 0%, #FB923C 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pattern-drift': 'patternDrift 20s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
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
        glow: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1 },
        },
        patternDrift: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(10px) translateY(-10px)' },
          '50%': { transform: 'translateX(-10px) translateY(10px)' },
          '75%': { transform: 'translateX(5px) translateY(-5px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'ethereum': '0 4px 6px -1px rgba(107, 70, 193, 0.1), 0 2px 4px -1px rgba(107, 70, 193, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(107, 70, 193, 0.1), 0 10px 10px -5px rgba(107, 70, 193, 0.04)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};