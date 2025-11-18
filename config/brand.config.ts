import { BrandConfig } from './types';

/**
 * Camp Alborz Brand Configuration
 *
 * Re-aligned to the refined Alborz_Guides_25.pdf aesthetic.
 */
export const brandConfig: BrandConfig = {
  colors: {
    primary: 'rgb(74, 93, 90)',        // Sage
    secondary: 'rgb(212, 196, 168)',   // Desert Tan
    accent: 'rgb(212, 175, 55)',       // Antique Gold
    background: 'rgb(250, 247, 242)',  // Cream
    text: {
      primary: 'rgb(44, 36, 22)',      // Desert Night
      secondary: 'rgb(138, 157, 154)', // Light Sage
    },
  },
  fonts: {
    display: 'Cinzel',
    // Accent font is used across the app even though it is not part of the BrandConfig type.
    accent: 'Cormorant',
    body: 'Inter',
    ui: 'Inter',
  },
  theme: {
    style: 'alborz-guide',
    patterns: ['persian-geometric', 'sunburst-rings'],
    colors: {
      primary: {
        DEFAULT: 'rgb(74, 93, 90)',
        light: 'rgb(138, 157, 154)',
        dark: 'rgb(47, 66, 67)',
        50: 'rgb(244, 246, 245)',
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
      secondary: {
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
      accent: {
        DEFAULT: 'rgb(212, 175, 55)',
        light: 'rgb(232, 195, 75)',
        dark: 'rgb(172, 138, 33)',
        50: 'rgb(255, 252, 240)',
        100: 'rgb(252, 245, 217)',
        200: 'rgb(245, 229, 178)',
        300: 'rgb(238, 213, 138)',
        400: 'rgb(225, 191, 101)',
        500: 'rgb(212, 175, 55)',
        600: 'rgb(189, 152, 40)',
        700: 'rgb(158, 124, 32)',
        800: 'rgb(124, 97, 28)',
        900: 'rgb(92, 73, 23)',
      },
      neutral: {
        50: 'rgb(250, 248, 244)',
        100: 'rgb(244, 240, 234)',
        200: 'rgb(230, 222, 210)',
        300: 'rgb(214, 200, 184)',
        400: 'rgb(190, 168, 147)',
        500: 'rgb(164, 138, 115)',
        600: 'rgb(132, 108, 88)',
        700: 'rgb(106, 85, 70)',
        800: 'rgb(79, 63, 51)',
        900: 'rgb(54, 43, 34)',
      },
      semantic: {
        success: 'rgb(46, 125, 50)',
        warning: 'rgb(201, 140, 24)',
        error: 'rgb(176, 59, 46)',
        info: 'rgb(47, 84, 112)',
      },
      background: {
        primary: 'rgb(250, 247, 242)',
        secondary: 'rgb(245, 239, 230)',
        tertiary: 'rgb(252, 250, 247)',
      },
      text: {
        primary: 'rgb(44, 36, 22)',
        secondary: 'rgb(90, 79, 60)',
        tertiary: 'rgb(138, 121, 95)',
        inverse: 'rgb(250, 247, 242)',
      },
      border: {
        light: 'rgb(233, 226, 213)',
        DEFAULT: 'rgb(212, 196, 168)',
        dark: 'rgb(169, 153, 128)',
      },
    },
    gradients: {
      hero: 'linear-gradient(180deg, rgba(250,247,242,0.95) 0%, rgba(245,239,230,0.98) 50%, rgba(212,196,168,0.85) 100%)',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,239,230,0.95) 60%, rgba(212,196,168,0.9) 100%)',
      button: 'linear-gradient(90deg, rgb(212, 175, 55) 0%, rgb(232, 195, 75) 100%)',
      decorative: 'linear-gradient(135deg, rgba(212,196,168,0.35) 0%, rgba(212,175,55,0.65) 50%, rgba(74,93,90,0.8) 100%)',
      primary: 'linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(47, 66, 67) 100%)',
      secondary: 'linear-gradient(135deg, rgb(245, 239, 230) 0%, rgb(212, 196, 168) 100%)',
      accent: 'linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(189, 152, 40) 100%)',
    },
    shadows: {
      sm: '0 6px 18px rgba(44, 36, 22, 0.08)',
      DEFAULT: '0 12px 30px rgba(74, 93, 90, 0.12)',
      md: '0 18px 36px rgba(44, 36, 22, 0.14)',
      lg: '0 24px 48px rgba(44, 36, 22, 0.18)',
      xl: '0 30px 60px rgba(44, 36, 22, 0.22)',
      '2xl': '0 36px 72px rgba(33, 28, 18, 0.25)',
      inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      none: '0 0 #0000',
    },
    radius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      '3xl': '2.25rem',
      full: '9999px',
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2.5rem',
      '2xl': '4rem',
      '3xl': '5.5rem',
      '4xl': '7.5rem',
    },
  },
  assets: {
    logo: '/images/logo.svg',
    logoLight: '/images/logo-light.svg',
    logoDark: '/images/logo-dark.svg',
    favicon: '/favicon.ico',
    ogImage: '/og-image.jpg',
    heroBackground: undefined,
  },
};
