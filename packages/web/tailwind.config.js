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
        // NEW: CSS Variable-based semantic colors (from brand config)
        primary: {
          DEFAULT: 'var(--color-primary, rgb(160, 82, 45))',
          light: 'var(--color-primary-light, rgb(180, 102, 65))',
          dark: 'var(--color-primary-dark, rgb(140, 62, 25))',
          50: 'var(--color-primary-50, rgb(251, 248, 246))',
          100: 'var(--color-primary-100, rgb(245, 235, 229))',
          200: 'var(--color-primary-200, rgb(230, 210, 198))',
          300: 'var(--color-primary-300, rgb(210, 175, 158))',
          400: 'var(--color-primary-400, rgb(185, 129, 102))',
          500: 'var(--color-primary-500, rgb(160, 82, 45))',
          600: 'var(--color-primary-600, rgb(140, 62, 25))',
          700: 'var(--color-primary-700, rgb(115, 47, 15))',
          800: 'var(--color-primary-800, rgb(90, 35, 10))',
          900: 'var(--color-primary-900, rgb(65, 25, 5))',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, rgb(212, 175, 55))',
          light: 'var(--color-secondary-light, rgb(232, 195, 75))',
          dark: 'var(--color-secondary-dark, rgb(192, 155, 35))',
          50: 'var(--color-secondary-50, rgb(254, 252, 245))',
          100: 'var(--color-secondary-100, rgb(252, 248, 230))',
          200: 'var(--color-secondary-200, rgb(248, 238, 200))',
          300: 'var(--color-secondary-300, rgb(242, 220, 155))',
          400: 'var(--color-secondary-400, rgb(227, 198, 105))',
          500: 'var(--color-secondary-500, rgb(212, 175, 55))',
          600: 'var(--color-secondary-600, rgb(192, 155, 35))',
          700: 'var(--color-secondary-700, rgb(165, 130, 25))',
          800: 'var(--color-secondary-800, rgb(135, 105, 20))',
          900: 'var(--color-secondary-900, rgb(105, 80, 15))',
        },
        accent: {
          DEFAULT: 'var(--color-accent, rgb(255, 215, 0))',
          light: 'var(--color-accent-light, rgb(255, 235, 100))',
          dark: 'var(--color-accent-dark, rgb(212, 175, 0))',
        },

        // Style Guide Colors - Sage Green & Tan
        sage: {
          DEFAULT: 'rgb(74, 93, 90)',
          light: 'rgb(138, 157, 154)',
          dark: 'rgb(47, 66, 67)',
          50: 'rgb(245, 247, 247)',
          100: 'rgb(235, 239, 238)',
          200: 'rgb(214, 221, 220)',
          300: 'rgb(176, 189, 187)',
          400: 'rgb(125, 141, 138)',
          500: 'rgb(74, 93, 90)',
          600: 'rgb(59, 74, 72)',
          700: 'rgb(47, 66, 67)',
          800: 'rgb(35, 50, 51)',
          900: 'rgb(24, 34, 35)',
        },
        tan: {
          DEFAULT: 'rgb(212, 196, 168)',
          light: 'rgb(245, 239, 230)',
          dark: 'rgb(169, 153, 128)',
          50: 'rgb(252, 250, 247)',
          100: 'rgb(250, 247, 242)',
          200: 'rgb(245, 239, 230)',
          300: 'rgb(235, 225, 210)',
          400: 'rgb(224, 208, 185)',
          500: 'rgb(212, 196, 168)',
          600: 'rgb(190, 174, 146)',
          700: 'rgb(169, 153, 128)',
          800: 'rgb(135, 122, 102)',
          900: 'rgb(108, 98, 82)',
        },
        gold: {
          DEFAULT: 'rgb(212, 175, 55)',
          light: 'rgb(232, 195, 75)',
          dark: 'rgb(192, 155, 35)',
          metallic: 'rgb(212, 175, 55)',
        },

        // SAFFRON GOLD - Now the DOMINANT primary color (60% usage)
        saffron: {
          DEFAULT: 'rgb(241, 196, 15)',   // #F1C40F - Bold Saffron Gold
          50: 'rgb(254, 252, 234)',
          100: 'rgb(254, 249, 195)',
          200: 'rgb(253, 244, 155)',
          300: 'rgb(252, 236, 116)',
          400: 'rgb(247, 220, 60)',
          500: 'rgb(241, 196, 15)',       // Primary Saffron
          600: 'rgb(212, 168, 10)',
          700: 'rgb(180, 140, 8)',
          800: 'rgb(148, 113, 7)',
          900: 'rgb(121, 93, 6)',
          light: 'rgb(244, 208, 63)',     // F4D03F
          dark: 'rgb(212, 163, 9)',       // D4A309
        },

        // COBALT BLUE - Secondary bold color (25% usage)
        cobalt: {
          DEFAULT: 'rgb(0, 71, 171)',     // Bold Cobalt Blue
          50: 'rgb(239, 246, 255)',
          100: 'rgb(219, 234, 254)',
          200: 'rgb(191, 219, 254)',
          300: 'rgb(147, 197, 253)',
          400: 'rgb(96, 165, 250)',
          500: 'rgb(0, 71, 171)',
          600: 'rgb(0, 60, 145)',
          700: 'rgb(0, 48, 116)',
          800: 'rgb(0, 37, 90)',
          900: 'rgb(0, 28, 68)',
        },

        // VIBRANT Persian accent colors (15% usage for energy!)
        persian: {
          blue: 'rgb(0, 103, 127)',      // Deep teal-blue - vibrant!
          rose: 'rgb(201, 62, 92)',       // Rich rose - bold!
          crimson: 'rgb(220, 20, 60)',    // Crimson for CTAs
          emerald: 'rgb(34, 139, 87)',    // Vibrant green - energetic!
          purple: 'rgb(102, 51, 153)',    // Royal purple - regal!
          sunset: 'rgb(255, 107, 53)',    // Burning Man sunset orange!
        },

        // Legacy color names (backward compatibility)
        dust: {
          khaki: 'rgb(196, 165, 123)',
          grey: 'rgb(155, 155, 155)',
        },
        burnt: {
          sienna: 'var(--color-primary, rgb(74, 93, 90))',
        },
        desert: {
          sand: 'rgb(237, 201, 175)',
          night: 'rgb(44, 36, 22)',
          gold: 'var(--color-secondary, rgb(212, 175, 55))',
          orange: 'rgb(255, 107, 107)',
        },
        royal: {
          gold: 'var(--color-accent, rgb(255, 215, 0))',
        },
        antique: {
          gold: 'var(--color-secondary, rgb(212, 175, 55))',
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

        // Ethereum.org inspired neutrals (now using CSS variables with fallbacks)
        neutral: {
          50: 'var(--color-neutral-50, #FAFAFA)',
          100: 'var(--color-neutral-100, #F4F4F5)',
          200: 'var(--color-neutral-200, #E4E4E7)',
          300: 'var(--color-neutral-300, #D4D4D8)',
          400: 'var(--color-neutral-400, #A1A1AA)',
          500: 'var(--color-neutral-500, #71717A)',
          600: 'var(--color-neutral-600, #52525B)',
          700: 'var(--color-neutral-700, #3F3F46)',
          800: 'var(--color-neutral-800, #27272A)',
          900: 'var(--color-neutral-900, #18181B)',
        },

        // Semantic colors
        success: 'var(--color-success, rgb(34, 197, 94))',
        warning: 'var(--color-warning, rgb(234, 179, 8))',
        error: 'var(--color-error, rgb(239, 68, 68))',
        info: 'var(--color-info, rgb(59, 130, 246))',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],          // Elegant serif for headings (Style Guide)
        accent: ['Cormorant', 'serif'],        // Italic serif for subheadings (Style Guide)
        body: ['Inter', 'sans-serif'],         // Clean sans-serif for body (Style Guide)
        ui: ['Inter', 'sans-serif'],           // UI elements
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // NEW: CSS Variable-based gradients from brand config
        'gradient-hero': 'var(--gradient-hero, linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(47, 66, 67) 50%, rgb(212, 196, 168) 100%))',
        'gradient-card': 'var(--gradient-card, linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(212, 196, 168) 100%))',
        'gradient-button': 'var(--gradient-button, linear-gradient(90deg, rgb(212, 175, 55) 0%, rgb(232, 195, 75) 100%))',
        'gradient-sage': 'linear-gradient(180deg, rgb(74, 93, 90) 0%, rgb(59, 74, 72) 100%)',
        'gradient-tan': 'linear-gradient(180deg, rgb(245, 239, 230) 0%, rgb(212, 196, 168) 100%)',
        'gradient-overlay': 'var(--gradient-overlay, linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%))',
        'gradient-border': 'var(--gradient-border, linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(160, 82, 45) 100%))',
        'gradient-text': 'var(--gradient-text, linear-gradient(135deg, rgb(255, 215, 0) 0%, rgb(212, 175, 55) 100%))',
        'gradient-decorative': 'var(--gradient-decorative, linear-gradient(135deg, rgb(93, 78, 96) 0%, rgb(80, 200, 120) 50%, rgb(255, 215, 0) 100%))',
        // Legacy gradient names (backward compatibility) - map to new variables
        'gradient-mystical': 'var(--gradient-decorative, linear-gradient(135deg, rgb(93, 78, 96) 0%, rgb(80, 200, 120) 50%, rgb(255, 215, 0) 100%))',
        'gradient-desert': 'var(--gradient-card, linear-gradient(135deg, rgb(196, 165, 123) 0%, rgb(237, 201, 175) 50%, rgb(160, 82, 45) 100%))',
        'gradient-gold': 'var(--gradient-button, linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(255, 215, 0) 100%))',
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