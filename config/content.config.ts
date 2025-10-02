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
      label: "Years of Magic",
      value: "15+",
      icon: "flame",
      description: "Creating unforgettable experiences",
      color: "from-persian-purple to-persian-violet",
    },
    {
      label: "Members Worldwide",
      value: "500+",
      icon: "users",
      description: "A global community united",
      color: "from-desert-gold to-saffron",
    },
    {
      label: "Raised for Charity",
      value: "$50K",
      icon: "dollar-sign",
      description: "Supporting arts and education",
      color: "from-persian-violet to-pink-500",
    },
    {
      label: "Events Per Year",
      value: "20+",
      icon: "calendar",
      description: "Year-round gatherings",
      color: "from-saffron to-desert-orange",
    },
    {
      label: "Art Projects Funded",
      value: "5",
      icon: "heart",
      description: "Major installations created",
      color: "from-persian-purple to-desert-gold",
    },
    {
      label: "Countries Reached",
      value: "12",
      icon: "globe",
      description: "International community",
      color: "from-desert-orange to-persian-violet",
    },
  ],

  // Feature Cards - Highlight your camp's unique offerings
  features: [
    {
      title: "Experience Burning Man",
      description: "Join us in Black Rock City for an unforgettable week of art, community, and radical self-expression.",
      icon: "tent",
      link: "/experience/burning-man",
      gradient: "from-burnt-sienna to-antique-gold",
      image: "/images/burning-man-camp.jpg",
    },
    {
      title: "Discover Persian Art",
      description: "Explore our rich cultural heritage through traditional crafts, music, poetry, and contemporary art.",
      icon: "palette",
      link: "/art",
      gradient: "from-desert-gold to-saffron",
      image: "/images/persian-art.jpg",
    },
    {
      title: "Build Community",
      description: "Connect with amazing people from around the world who share our values of hospitality and creativity.",
      icon: "users",
      link: "/community",
      gradient: "from-antique-gold to-sunrise-coral",
      image: "/images/community.jpg",
    },
    {
      title: "Year-Round Events",
      description: "From fundraisers to cultural celebrations, we gather throughout the year to strengthen our bonds.",
      icon: "calendar",
      link: "/events",
      gradient: "from-saffron to-desert-orange",
      image: "/images/events.jpg",
    },
    {
      title: "Support Our Mission",
      description: "Help us create transformative experiences and support arts education in underserved communities.",
      icon: "heart",
      link: "/donate",
      gradient: "from-sunrise-coral to-burnt-sienna",
      image: "/images/support.jpg",
    },
    {
      title: "Global Network",
      description: "Be part of an international community that spans continents and cultures.",
      icon: "globe",
      link: "/about/global",
      gradient: "from-desert-orange to-antique-gold",
      image: "/images/global.jpg",
    },
  ],
};
