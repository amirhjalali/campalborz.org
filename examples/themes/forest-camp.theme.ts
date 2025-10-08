/**
 * Forest Camp Theme Configuration
 *
 * A nature-inspired theme featuring forest greens, earth tones,
 * and natural wood accents. Perfect for eco/nature-themed camps.
 */

import type { BrandConfig } from '../../config/types';

export const forestCampTheme: BrandConfig = {
  // Primary: Deep Forest Green
  colors: {
    primary: 'rgb(27, 94, 32)',       // Deep forest green
    secondary: 'rgb(121, 85, 72)',    // Warm brown/wood
    accent: 'rgb(205, 220, 57)',      // Fresh lime/leaf green
  },

  fonts: {
    display: 'Playfair Display',
    body: 'Crimson Text',
    ui: 'Montserrat',
  },

  theme: {
    style: 'forest-natural',
    patterns: ['tree-rings', 'leaf-pattern'],

    colors: {
      // Primary: Deep Forest Green
      primary: {
        DEFAULT: 'rgb(27, 94, 32)',
        light: 'rgb(76, 175, 80)',
        dark: 'rgb(1, 87, 155)',
        50: 'rgb(232, 245, 233)',
        100: 'rgb(200, 230, 201)',
        200: 'rgb(165, 214, 167)',
        300: 'rgb(129, 199, 132)',
        400: 'rgb(102, 187, 106)',
        500: 'rgb(76, 175, 80)',
        600: 'rgb(67, 160, 71)',
        700: 'rgb(56, 142, 60)',
        800: 'rgb(46, 125, 50)',
        900: 'rgb(27, 94, 32)',
      },

      // Secondary: Warm Brown/Wood
      secondary: {
        DEFAULT: 'rgb(121, 85, 72)',
        light: 'rgb(161, 136, 127)',
        dark: 'rgb(93, 64, 55)',
        50: 'rgb(239, 235, 233)',
        100: 'rgb(215, 204, 200)',
        200: 'rgb(188, 170, 164)',
        300: 'rgb(161, 136, 127)',
        400: 'rgb(141, 110, 99)',
        500: 'rgb(121, 85, 72)',
        600: 'rgb(109, 76, 65)',
        700: 'rgb(93, 64, 55)',
        800: 'rgb(78, 52, 46)',
        900: 'rgb(62, 39, 35)',
      },

      // Accent: Fresh Lime/Leaf Green
      accent: {
        DEFAULT: 'rgb(205, 220, 57)',
        light: 'rgb(220, 231, 117)',
        dark: 'rgb(192, 202, 51)',
        50: 'rgb(249, 251, 231)',
        100: 'rgb(240, 244, 195)',
        200: 'rgb(230, 238, 156)',
        300: 'rgb(220, 231, 117)',
        400: 'rgb(212, 225, 87)',
        500: 'rgb(205, 220, 57)',
        600: 'rgb(192, 202, 51)',
        700: 'rgb(175, 180, 43)',
        800: 'rgb(158, 157, 36)',
        900: 'rgb(130, 119, 23)',
      },

      // Neutral: Natural stone/earth
      neutral: {
        50: '#FAFAF9',
        100: '#F5F5F4',
        200: '#E7E5E4',
        300: '#D6D3D1',
        400: '#A8A29E',
        500: '#78716C',
        600: '#57534E',
        700: '#44403C',
        800: '#292524',
        900: '#1C1917',
      },

      // Semantic colors
      semantic: {
        success: 'rgb(56, 142, 60)',
        warning: 'rgb(251, 192, 45)',
        error: 'rgb(211, 47, 47)',
        info: 'rgb(2, 136, 209)',
      },

      // Background colors
      background: {
        primary: 'rgb(250, 250, 249)',
        secondary: 'rgb(232, 245, 233)',
        tertiary: 'rgb(239, 235, 233)',
      },

      // Text colors
      text: {
        primary: 'rgb(28, 25, 23)',
        secondary: 'rgb(68, 64, 60)',
        tertiary: 'rgb(120, 113, 108)',
        inverse: 'rgb(255, 255, 255)',
      },

      // Border colors
      border: {
        light: 'rgb(231, 229, 228)',
        DEFAULT: 'rgb(214, 211, 209)',
        dark: 'rgb(168, 162, 158)',
      },
    },

    gradients: {
      hero: 'linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(27, 94, 32) 50%, rgb(121, 85, 72) 100%)',
      card: 'linear-gradient(135deg, rgb(27, 94, 32) 0%, rgb(56, 142, 60) 100%)',
      button: 'linear-gradient(135deg, rgb(56, 142, 60) 0%, rgb(76, 175, 80) 100%)',
      overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(27, 94, 32, 0.8) 100%)',
      border: 'linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(205, 220, 57) 100%)',
      text: 'linear-gradient(135deg, rgb(56, 142, 60) 0%, rgb(121, 85, 72) 100%)',
      decorative: 'linear-gradient(135deg, rgb(27, 94, 32) 0%, rgb(76, 175, 80) 50%, rgb(205, 220, 57) 100%)',
    },

    shadows: {
      sm: '0 1px 2px 0 rgba(27, 94, 32, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(27, 94, 32, 0.1), 0 1px 2px 0 rgba(27, 94, 32, 0.06)',
      md: '0 4px 6px -1px rgba(27, 94, 32, 0.1), 0 2px 4px -1px rgba(27, 94, 32, 0.06)',
      lg: '0 10px 15px -3px rgba(27, 94, 32, 0.1), 0 4px 6px -2px rgba(27, 94, 32, 0.05)',
      xl: '0 20px 25px -5px rgba(27, 94, 32, 0.1), 0 10px 10px -5px rgba(27, 94, 32, 0.04)',
      '2xl': '0 25px 50px -12px rgba(27, 94, 32, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(27, 94, 32, 0.06)',
      none: 'none',
    },

    radius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },

    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
  },

  assets: {
    logo: '/assets/forest-camp-logo.svg',
    favicon: '/assets/forest-camp-favicon.ico',
    ogImage: '/assets/forest-camp-og.jpg',
    heroImage: '/assets/forest-camp-hero.jpg',
  },
};

/**
 * Usage:
 *
 * 1. Copy the theme colors to config/brand.config.ts
 * 2. Or import and use directly:
 *    import { forestCampTheme } from './examples/themes/forest-camp.theme';
 *    export const brandConfig = forestCampTheme;
 */
