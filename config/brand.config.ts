import { BrandConfig } from './types';

/**
 * Camp Alborz Brand Configuration
 *
 * This file contains all branding and design system configuration.
 * Customize colors, fonts, and assets to match your camp's identity.
 */
export const brandConfig: BrandConfig = {
  // Colors - Desert/Persian Theme
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

  // Theme
  theme: {
    style: "desert-mystical",
    patterns: ["persian-geometric", "desert-waves"],
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
