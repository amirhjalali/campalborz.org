/**
 * Ocean Camp - Example Configuration
 *
 * This is an example configuration for a beach/ocean-themed Burning Man camp.
 * To use this configuration:
 * 1. Copy the camp, brand, and content sections
 * 2. Paste into the respective config files in /config
 * 3. Restart your dev server
 */

import type { CampConfig, BrandConfig, ContentConfig } from '../../config/types';

// ============================================================================
// CAMP CONFIGURATION
// ============================================================================
export const oceanCampConfig: CampConfig = {
  // Basic Info
  name: "Ocean Camp",
  tagline: "Where the waves meet the desert",
  description: "For 8 years, we've brought the serenity and power of the ocean to Black Rock City, creating an oasis of aquatic art, flow experiences, and coastal hospitality.",

  // Organization
  legalName: "Ocean Camp Inc.",
  taxStatus: "501(c)(3)",
  ein: undefined,

  // Contact
  email: "info@oceancamp.org",
  phone: undefined,
  location: "Black Rock City, NV",

  // URLs
  website: "https://oceancamp.org",
  domain: "oceancamp.org",
  subdomain: "ocean",

  // Social Media
  social: {
    instagram: "@oceancamp",
    facebook: undefined,
    twitter: undefined,
    youtube: undefined,
  },

  // Features
  features: {
    events: true,
    donations: true,
    membership: true,
    forum: true,
    gallery: true,
    newsletter: true,
  },

  // Cultural Identity
  cultural: {
    heritage: "Coastal",
    artStyle: "Ocean-Inspired Installations",
    values: [
      "Flow",
      "Depth",
      "Community",
      "Exploration",
      "Conservation",
    ],
  },
};

// ============================================================================
// BRAND CONFIGURATION
// ============================================================================
export const oceanBrandConfig: BrandConfig = {
  // Colors - Ocean/Beach Theme
  colors: {
    primary: "rgb(0, 119, 182)",      // Ocean Blue
    secondary: "rgb(0, 180, 216)",    // Turquoise
    accent: "rgb(255, 215, 0)",       // Golden Sand
    background: "rgb(240, 248, 255)", // Alice Blue
    text: {
      primary: "rgb(13, 27, 42)",     // Deep Ocean Navy
      secondary: "rgb(100, 149, 237)", // Cornflower Blue
    },
  },

  // Typography
  fonts: {
    display: "Montserrat",    // Clean, modern
    body: "Open Sans",        // Readable
    ui: "Roboto",             // UI elements
  },

  // Theme
  theme: {
    style: "ocean-modern",
    patterns: ["wave-pattern", "coral-texture"],
  },

  // Assets
  assets: {
    logo: "/images/ocean-logo.svg",
    logoLight: "/images/ocean-logo-light.svg",
    logoDark: "/images/ocean-logo-dark.svg",
    favicon: "/favicon-ocean.ico",
    ogImage: "/og-image-ocean.jpg",
    heroBackground: "/images/ocean-waves.jpg",
  },
};

// ============================================================================
// CONTENT CONFIGURATION
// ============================================================================
export const oceanContentConfig: ContentConfig = {
  // Hero Section
  hero: {
    title: "Welcome to Ocean Camp",
    subtitle: "Where the waves meet the desert",
    description: "For 8 years, we've brought the serenity and energy of the ocean to Black Rock City. Experience aquatic art installations, flow workshops, and coastal hospitality in the heart of the playa.",
    cta: {
      primary: {
        text: "Dive Into Our World",
        icon: "tent",
        link: "/experience",
      },
      secondary: {
        text: "Join the Crew",
        icon: "heart",
        link: "/join",
      },
    },
  },

  // Navigation
  navigation: {
    enabled: true,
    customItems: [],
  },

  // Footer
  footer: {
    tagline: "Bringing ocean waves and coastal community to the playa",
    copyright: "Ocean Camp",
  },

  // Stats
  stats: [
    {
      label: "Years Making Waves",
      value: "8+",
      icon: "flame",
      description: "Bringing ocean energy to the desert",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Crew Members",
      value: "300+",
      icon: "users",
      description: "A global community of ocean lovers",
      color: "from-cyan-500 to-teal-500",
    },
    {
      label: "Ocean Conservation",
      value: "$25K",
      icon: "dollar-sign",
      description: "Supporting marine preservation",
      color: "from-teal-500 to-blue-600",
    },
    {
      label: "Flow Sessions",
      value: "50+",
      icon: "calendar",
      description: "Annual workshops and gatherings",
      color: "from-blue-400 to-indigo-500",
    },
    {
      label: "Aquatic Art Pieces",
      value: "12",
      icon: "palette",
      description: "Interactive ocean installations",
      color: "from-cyan-400 to-blue-500",
    },
    {
      label: "Coastal Cities",
      value: "15",
      icon: "globe",
      description: "Our members call home",
      color: "from-blue-500 to-cyan-400",
    },
  ],

  // Feature Cards
  features: [
    {
      title: "Ocean Art Installations",
      description: "Experience our signature aquatic sculptures, bioluminescent gardens, and interactive wave machines that bring the ocean to life.",
      icon: "palette",
      link: "/art",
      gradient: "from-blue-500 to-cyan-500",
      image: "/images/ocean-art.jpg",
    },
    {
      title: "Flow Workshops",
      description: "Join daily movement sessions inspired by ocean currents - from surfboard yoga to underwater-themed flow arts.",
      icon: "users",
      link: "/workshops",
      gradient: "from-cyan-500 to-teal-500",
      image: "/images/flow-workshops.jpg",
    },
    {
      title: "Coastal Hospitality",
      description: "Relax in our seaside lounge with fresh ocean breezes (fans!), beach vibes, and refreshing beverages.",
      icon: "coffee",
      link: "/hospitality",
      gradient: "from-teal-400 to-blue-500",
      image: "/images/lounge.jpg",
    },
    {
      title: "Beach Parties",
      description: "Dance under the stars at our legendary beach parties featuring aquatic-themed DJs and immersive ocean visuals.",
      icon: "calendar",
      link: "/events",
      gradient: "from-blue-400 to-purple-500",
      image: "/images/beach-party.jpg",
    },
    {
      title: "Conservation Mission",
      description: "Support ocean preservation through our fundraising events and educational programs about marine ecosystems.",
      icon: "heart",
      link: "/conservation",
      gradient: "from-teal-500 to-green-500",
      image: "/images/conservation.jpg",
    },
    {
      title: "Global Ocean Network",
      description: "Connect with ocean lovers from coastal communities worldwide who share our passion for marine life and art.",
      icon: "globe",
      link: "/community",
      gradient: "from-cyan-400 to-blue-600",
      image: "/images/global-ocean.jpg",
    },
  ],
};

/**
 * To use this configuration:
 *
 * 1. Copy oceanCampConfig to config/camp.config.ts
 * 2. Copy oceanBrandConfig to config/brand.config.ts
 * 3. Copy oceanContentConfig to config/content.config.ts
 * 4. Update the export names to match (remove "ocean" prefix)
 * 5. Restart your development server
 */
