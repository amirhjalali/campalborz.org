/**
 * Ocean Camp Theme Configuration
 *
 * A marine-inspired theme featuring ocean blues, coral accents,
 * and aqua highlights. Perfect for beach or ocean-themed camps.
 */

import type { BrandConfig } from '../../config/types';

export const oceanCampTheme: BrandConfig = {
  // Primary: Deep Ocean Blue
  colors: {
    primary: 'rgb(13, 71, 161)',      // Deep blue
    secondary: 'rgb(0, 150, 136)',    // Teal/aqua
    accent: 'rgb(255, 138, 101)',     // Coral
    background: 'rgb(250, 250, 250)',
    text: {
      primary: 'rgb(33, 33, 33)',
      secondary: 'rgb(97, 97, 97)',
    },
  },

  fonts: {
    display: 'Playfair Display',
    body: 'Crimson Text',
    ui: 'Montserrat',
  },

  theme: {
    style: 'ocean-waves',
    patterns: ['wave-pattern', 'coral-reef'],

    colors: {
      // Primary: Deep Ocean Blue
      primary: {
        DEFAULT: 'rgb(13, 71, 161)',
        light: 'rgb(33, 150, 243)',
        dark: 'rgb(1, 87, 155)',
        50: 'rgb(227, 242, 253)',
        100: 'rgb(187, 222, 251)',
        200: 'rgb(144, 202, 249)',
        300: 'rgb(100, 181, 246)',
        400: 'rgb(66, 165, 245)',
        500: 'rgb(33, 150, 243)',
        600: 'rgb(30, 136, 229)',
        700: 'rgb(25, 118, 210)',
        800: 'rgb(21, 101, 192)',
        900: 'rgb(13, 71, 161)',
      },

      // Secondary: Teal/Aqua
      secondary: {
        DEFAULT: 'rgb(0, 150, 136)',
        light: 'rgb(38, 166, 154)',
        dark: 'rgb(0, 121, 107)',
        50: 'rgb(224, 242, 241)',
        100: 'rgb(178, 223, 219)',
        200: 'rgb(128, 203, 196)',
        300: 'rgb(77, 182, 172)',
        400: 'rgb(38, 166, 154)',
        500: 'rgb(0, 150, 136)',
        600: 'rgb(0, 137, 123)',
        700: 'rgb(0, 121, 107)',
        800: 'rgb(0, 105, 92)',
        900: 'rgb(0, 77, 64)',
      },

      // Accent: Coral
      accent: {
        DEFAULT: 'rgb(255, 138, 101)',
        light: 'rgb(255, 171, 145)',
        dark: 'rgb(244, 81, 30)',
        50: 'rgb(255, 243, 224)',
        100: 'rgb(255, 224, 178)',
        200: 'rgb(255, 204, 128)',
        300: 'rgb(255, 183, 77)',
        400: 'rgb(255, 167, 38)',
        500: 'rgb(255, 152, 0)',
        600: 'rgb(251, 140, 0)',
        700: 'rgb(245, 124, 0)',
        800: 'rgb(239, 108, 0)',
        900: 'rgb(230, 81, 0)',
      },

      // Neutral: Light sand/white
      neutral: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },

      // Semantic colors
      semantic: {
        success: 'rgb(76, 175, 80)',
        warning: 'rgb(255, 193, 7)',
        error: 'rgb(244, 67, 54)',
        info: 'rgb(33, 150, 243)',
      },

      // Background colors
      background: {
        primary: 'rgb(250, 250, 250)',
        secondary: 'rgb(227, 242, 253)',
        tertiary: 'rgb(224, 247, 250)',
      },

      // Text colors
      text: {
        primary: 'rgb(33, 33, 33)',
        secondary: 'rgb(97, 97, 97)',
        tertiary: 'rgb(158, 158, 158)',
        inverse: 'rgb(255, 255, 255)',
      },

      // Border colors
      border: {
        light: 'rgb(224, 224, 224)',
        DEFAULT: 'rgb(189, 189, 189)',
        dark: 'rgb(117, 117, 117)',
      },
    },

    gradients: {
      hero: 'linear-gradient(135deg, rgb(33, 150, 243) 0%, rgb(0, 150, 136) 50%, rgb(255, 138, 101) 100%)',
      card: 'linear-gradient(135deg, rgb(13, 71, 161) 0%, rgb(0, 150, 136) 100%)',
      button: 'linear-gradient(135deg, rgb(0, 150, 136) 0%, rgb(38, 166, 154) 100%)',
      primary: 'linear-gradient(135deg, rgb(13, 71, 161) 0%, rgb(33, 150, 243) 100%)',
      secondary: 'linear-gradient(135deg, rgb(0, 150, 136) 0%, rgb(38, 166, 154) 100%)',
      accent: 'linear-gradient(135deg, rgb(255, 138, 101) 0%, rgb(255, 171, 145) 100%)',
      decorative: 'linear-gradient(135deg, rgb(13, 71, 161) 0%, rgb(0, 150, 136) 50%, rgb(255, 138, 101) 100%)',
    },

    shadows: {
      sm: '0 1px 2px 0 rgba(13, 71, 161, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(13, 71, 161, 0.1), 0 1px 2px 0 rgba(13, 71, 161, 0.06)',
      md: '0 4px 6px -1px rgba(13, 71, 161, 0.1), 0 2px 4px -1px rgba(13, 71, 161, 0.06)',
      lg: '0 10px 15px -3px rgba(13, 71, 161, 0.1), 0 4px 6px -2px rgba(13, 71, 161, 0.05)',
      xl: '0 20px 25px -5px rgba(13, 71, 161, 0.1), 0 10px 10px -5px rgba(13, 71, 161, 0.04)',
      '2xl': '0 25px 50px -12px rgba(13, 71, 161, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(13, 71, 161, 0.06)',
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
    logo: '/assets/ocean-camp-logo.svg',
    logoLight: '/assets/ocean-camp-logo-light.svg',
    logoDark: '/assets/ocean-camp-logo-dark.svg',
    favicon: '/assets/ocean-camp-favicon.ico',
    ogImage: '/assets/ocean-camp-og.jpg',
    heroBackground: '/assets/ocean-camp-hero.jpg',
  },
};

/**
 * Usage:
 *
 * 1. Copy the theme colors to config/brand.config.ts
 * 2. Or import and use directly:
 *    import { oceanCampTheme } from './examples/themes/ocean-camp.theme';
 *    export const brandConfig = oceanCampTheme;
 */
