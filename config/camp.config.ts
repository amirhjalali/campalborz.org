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
  tagline: "Legendary Persian hospitality, without the baggage.",
  description:
    "Camp Alborz is a 501c3 music and arts organization celebrating Persian culture through radical hospitality, immersive art cars, and inclusive gatherings that stretch from Brooklyn to Black Rock City.",

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
    instagram: "https://www.instagram.com/campalborz/",
    facebook: undefined,
    twitter: undefined,
    youtube: "https://www.youtube.com/@campalborz",
    soundcloud: "https://soundcloud.com/camp_alborz",
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
