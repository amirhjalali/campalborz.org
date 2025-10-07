import { BrandConfig } from './types';

/**
 * Camp Alborz Brand Configuration
 *
 * This file contains all branding and design system configuration.
 * Customize colors, fonts, and assets to match your camp's identity.
 */
export const brandConfig: BrandConfig = {
  // Colors - Desert/Persian Theme (Legacy support)
  colors: {
    primary: "rgb(160, 82, 45)",      // Burnt Sienna
    secondary: "rgb(212, 175, 55)",   // Antique Gold
    accent: "rgb(255, 215, 0)",       // Royal Gold
    background: "rgb(255, 248, 240)", // Warm White
    text: {
      primary: "rgb(44, 36, 22)",     // Desert Night
      secondary: "rgb(237, 201, 175)", // Desert Sand
    },
  },

  // Typography
  fonts: {
    display: "Playfair Display",  // Headings
    body: "Crimson Text",         // Body text
    ui: "Montserrat",             // UI elements
  },

  // Theme - Extended configuration
  theme: {
    style: "desert-mystical",
    patterns: ["persian-geometric", "desert-waves"],

    // Complete color system with variants
    colors: {
      primary: {
        DEFAULT: "rgb(160, 82, 45)",   // Burnt Sienna
        light: "rgb(180, 102, 65)",    // Lighter Burnt Sienna
        dark: "rgb(140, 62, 25)",      // Darker Burnt Sienna
        50: "rgb(251, 248, 246)",
        100: "rgb(245, 235, 229)",
        200: "rgb(230, 210, 198)",
        300: "rgb(210, 175, 158)",
        400: "rgb(185, 129, 102)",
        500: "rgb(160, 82, 45)",       // Base
        600: "rgb(140, 62, 25)",
        700: "rgb(115, 47, 15)",
        800: "rgb(90, 35, 10)",
        900: "rgb(65, 25, 5)",
      },
      secondary: {
        DEFAULT: "rgb(212, 175, 55)",  // Antique Gold
        light: "rgb(232, 195, 75)",
        dark: "rgb(192, 155, 35)",
        50: "rgb(254, 252, 245)",
        100: "rgb(252, 248, 230)",
        200: "rgb(248, 238, 200)",
        300: "rgb(242, 220, 155)",
        400: "rgb(227, 198, 105)",
        500: "rgb(212, 175, 55)",      // Base
        600: "rgb(192, 155, 35)",
        700: "rgb(165, 130, 25)",
        800: "rgb(135, 105, 20)",
        900: "rgb(105, 80, 15)",
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
        primary: "rgb(255, 248, 240)",   // Warm White
        secondary: "rgb(250, 245, 238)", // Lighter warm
        tertiary: "rgb(245, 240, 232)",  // Even lighter
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

    // Gradient presets
    gradients: {
      hero: "linear-gradient(135deg, rgb(255, 215, 0) 0%, rgb(212, 175, 55) 50%, rgb(160, 82, 45) 100%)",
      card: "linear-gradient(135deg, rgb(160, 82, 45) 0%, rgb(212, 175, 55) 100%)",
      button: "linear-gradient(90deg, rgb(160, 82, 45) 0%, rgb(180, 102, 65) 100%)",
      decorative: "linear-gradient(135deg, rgb(196, 165, 123) 0%, rgb(237, 201, 175) 50%, rgb(160, 82, 45) 100%)",
      primary: "linear-gradient(135deg, rgb(160, 82, 45) 0%, rgb(180, 102, 65) 100%)",
      secondary: "linear-gradient(135deg, rgb(212, 175, 55) 0%, rgb(232, 195, 75) 100%)",
      accent: "linear-gradient(135deg, rgb(255, 215, 0) 0%, rgb(255, 235, 100) 100%)",
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
