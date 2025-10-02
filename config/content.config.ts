import { ContentConfig } from './types';

/**
 * Camp Alborz Content Configuration
 *
 * This file contains all text content and copy for the website.
 * Customize these values to change the messaging for your camp.
 */
export const contentConfig: ContentConfig = {
  // Hero Section
  hero: {
    title: "Welcome to Camp Alborz",
    subtitle: "Where Persian hospitality meets the spirit of Burning Man",
    description: "For over 15 years, we've created a home on the playa where ancient Persian culture blends with radical self-expression, building community through art, hospitality, and shared experiences.",
    cta: {
      primary: {
        text: "Explore Our World",
        icon: "tent",
        link: "/experience",
      },
      secondary: {
        text: "Join Our Community",
        icon: "heart",
        link: "/join",
      },
    },
  },

  // Navigation - Custom items can be added here
  navigation: {
    enabled: true,
    customItems: [], // Empty array means use default navigation
  },

  // Footer
  footer: {
    tagline: "Building community through art, culture, and radical hospitality",
    copyright: "Camp Alborz",
  },

  // Stats - Customize these numbers for your camp
  stats: [
    {
      label: "Years on the Playa",
      value: "15+",
      icon: "calendar"
    },
    {
      label: "Community Members",
      value: "500+",
      icon: "users"
    },
    {
      label: "Art Installations",
      value: "25+",
      icon: "palette"
    },
    {
      label: "Events Hosted",
      value: "100+",
      icon: "star"
    },
  ],

  // Feature Cards - Highlight your camp's unique offerings
  features: [
    {
      title: "Persian Hospitality",
      description: "Experience authentic Persian tea service, traditional food, and warm welcomes that make our camp feel like home on the playa.",
      icon: "coffee",
      link: "/culture",
    },
    {
      title: "Fire Art",
      description: "Marvel at our iconic HOMA fire sculpture, a stunning centerpiece that combines ancient symbolism with modern pyrotechnic artistry.",
      icon: "flame",
      link: "/art",
    },
    {
      title: "Community Events",
      description: "Join us for workshops, performances, and gatherings throughout the year that celebrate creativity and connection.",
      icon: "calendar",
      link: "/events",
    },
  ],
};
