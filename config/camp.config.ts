import { CampConfig } from './types';

/**
 * Camp Alborz Configuration
 *
 * This file contains all camp-specific information that can be customized
 * for different camps. Update these values to rebrand the site.
 */
export const campConfig: CampConfig = {
  // Basic Info
  name: "Camp Alborz",
  tagline: "Where Persian hospitality meets the spirit of Burning Man",
  description: "For over 15 years, we've created a home on the playa where ancient Persian culture blends with radical self-expression, building community through art, hospitality, and shared experiences.",

  // Organization
  legalName: "Camp Alborz Inc.",
  taxStatus: "501(c)(3)",
  ein: undefined, // Optional: Add EIN if public

  // Contact
  email: "info@campalborz.org",
  phone: undefined,
  location: "Black Rock City, NV",

  // URLs
  website: "https://campalborz.org",
  domain: "campalborz.org",
  subdomain: "alborz",

  // Social Media
  social: {
    instagram: undefined,
    facebook: undefined,
    twitter: undefined,
    youtube: undefined,
  },

  // Features - Toggle features on/off for your camp
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
    heritage: "Persian",
    artStyle: "Persian-Modern Fusion",
    values: [
      "Hospitality",
      "Art",
      "Community",
      "Self-Expression",
      "Cultural Heritage",
    ],
  },
};
