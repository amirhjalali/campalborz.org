import { BrandConfig } from './types';

/**
 * Camp Alborz Brand Configuration
 *
 * This file contains all branding and design system configuration.
 * Customize colors, fonts, and assets to match your camp's identity.
 */
export const brandConfig: BrandConfig = {
  // Colors - Based on Burning Man 2025 Style Guide
  colors: {
    primary: "rgb(74, 93, 90)",       // Sage Green
    secondary: "rgb(212, 196, 168)",  // Desert Tan
    accent: "rgb(212, 175, 55)",      // Antique Gold
    background: "rgb(250, 247, 242)", // Cream
    text: {
      primary: "rgb(44, 36, 22)",     // Desert Night
      secondary: "rgb(138, 157, 154)", // Light Sage
    },
  },

  // Typography - Based on Style Guide
  fonts: {
    display: "Cinzel",            // Elegant serif for headings
    accent: "Cormorant",          // Italic serif for subheadings
    body: "Inter",                // Clean sans-serif for body
    ui: "Inter",                  // UI elements
  },

  // Theme - Extended configuration
  theme: {
    style: "desert-mystical",
    patterns: ["persian-geometric", "desert-waves"],

    // Complete color system with variants - Style Guide Colors
    colors: {
      // Sage Green (Primary)
      primary: {
        DEFAULT: "rgb(74, 93, 90)",    // Sage Green
        light: "rgb(138, 157, 154)",   // Light Sage
        dark: "rgb(47, 66, 67)",       // Deep Teal
        50: "rgb(245, 247, 247)",
        100: "rgb(235, 239, 238)",
        200: "rgb(214, 221, 220)",
        300: "rgb(176, 189, 187)",
        400: "rgb(125, 141, 138)",
        500: "rgb(74, 93, 90)",        // Base
        600: "rgb(59, 74, 72)",
        700: "rgb(47, 66, 67)",
        800: "rgb(35, 50, 51)",
        900: "rgb(24, 34, 35)",
      },
      // Desert Tan (Secondary)
      secondary: {
        DEFAULT: "rgb(212, 196, 168)",  // Desert Tan
        light: "rgb(245, 239, 230)",    // Warm Beige
        dark: "rgb(169, 153, 128)",
        50: "rgb(252, 250, 247)",
        100: "rgb(250, 247, 242)",
        200: "rgb(245, 239, 230)",
        300: "rgb(235, 225, 210)",
        400: "rgb(224, 208, 185)",
        500: "rgb(212, 196, 168)",     // Base
        600: "rgb(190, 174, 146)",
        700: "rgb(169, 153, 128)",
        800: "rgb(135, 122, 102)",
        900: "rgb(108, 98, 82)",
      },
      accent: {
        DEFAULT: "rgb(255, 215, 0)",   // Royal Gold
        light: "rgb(255, 235, 100)",
        dark: "rgb(212, 175, 0)",
        50: "rgb(255, 254, 240)",
        100: "rgb(255, 252, 220)",
        200: "rgb(255, 245, 180)",
        300: "rgb(255, 235, 120)",
        400: "rgb(255, 225, 60)",
        500: "rgb(255, 215, 0)",       // Base
        600: "rgb(212, 175, 0)",
        700: "rgb(175, 145, 0)",
        800: "rgb(140, 115, 0)",
        900: "rgb(105, 85, 0)",
      },
      neutral: {
        50: "rgb(250, 250, 250)",      // Lightest
        100: "rgb(244, 244, 245)",
        200: "rgb(228, 228, 231)",
        300: "rgb(212, 212, 216)",
        400: "rgb(161, 161, 170)",
        500: "rgb(113, 113, 122)",     // Mid
        600: "rgb(82, 82, 91)",
        700: "rgb(63, 63, 70)",
        800: "rgb(39, 39, 42)",
        900: "rgb(24, 24, 27)",        // Darkest
      },
      semantic: {
        success: "rgb(34, 197, 94)",   // Green
        warning: "rgb(234, 179, 8)",   // Yellow
        error: "rgb(239, 68, 68)",     // Red
        info: "rgb(59, 130, 246)",     // Blue
      },
      background: {
        primary: "rgb(250, 247, 242)",   // Cream
        secondary: "rgb(245, 239, 230)", // Warm Beige
        tertiary: "rgb(252, 250, 247)",  // Lightest Cream
        sage: "rgb(74, 93, 90)",         // Sage Green (for dark sections)
        tan: "rgb(212, 196, 168)",       // Desert Tan (for alternating sections)
      },
      text: {
        primary: "rgb(44, 36, 22)",      // Desert Night
        secondary: "rgb(113, 113, 122)", // Neutral gray
        tertiary: "rgb(161, 161, 170)",  // Light gray
        inverse: "rgb(255, 255, 255)",   // White for dark backgrounds
      },
      border: {
        light: "rgb(228, 228, 231)",
        DEFAULT: "rgb(212, 212, 216)",
        dark: "rgb(161, 161, 170)",
      },
    },

    // Gradient presets - Style Guide Inspired
    gradients: {
      hero: "linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(47, 66, 67) 50%, rgb(212, 196, 168) 100%)",
      card: "linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(212, 196, 168) 100%)",
      button: "linear-gradient(90deg, rgb(212, 175, 55) 0%, rgb(232, 195, 75) 100%)",
      decorative: "linear-gradient(135deg, rgb(212, 196, 168) 0%, rgb(245, 239, 230) 50%, rgb(212, 175, 55) 100%)",
      primary: "linear-gradient(135deg, rgb(74, 93, 90) 0%, rgb(138, 157, 154) 100%)",
      secondary: "linear-gradient(135deg, rgb(212, 196, 168) 0%, rgb(245, 239, 230) 100%)",
      accent: "linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(232, 195, 75) 100%)",
      sage: "linear-gradient(180deg, rgb(74, 93, 90) 0%, rgb(59, 74, 72) 100%)",
      tan: "linear-gradient(180deg, rgb(245, 239, 230) 0%, rgb(212, 196, 168) 100%)",
    },

    // Shadow presets
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      none: "0 0 #0000",
    },

    // Border radius presets
    radius: {
      none: "0px",
      sm: "0.125rem",    // 2px
      DEFAULT: "0.25rem", // 4px
      md: "0.375rem",    // 6px
      lg: "0.5rem",      // 8px
      xl: "0.75rem",     // 12px
      "2xl": "1rem",     // 16px
      "3xl": "1.5rem",   // 24px
      full: "9999px",
    },

    // Spacing presets
    spacing: {
      xs: "0.5rem",    // 8px
      sm: "0.75rem",   // 12px
      md: "1rem",      // 16px
      lg: "1.5rem",    // 24px
      xl: "2rem",      // 32px
      "2xl": "3rem",   // 48px
      "3xl": "4rem",   // 64px
      "4xl": "6rem",   // 96px
    },
  },

  // Assets
  assets: {
    logo: "/images/logo.svg",
    logoLight: "/images/logo-light.svg",
    logoDark: "/images/logo-dark.svg",
    favicon: "/favicon.ico",
    ogImage: "/og-image.jpg",
    heroBackground: undefined, // Optional: custom hero background image
  },
};
