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

  // About Page
  about: {
    title: "About Camp Alborz",
    subtitle: "A celebration of Persian culture, community, and creativity in the heart of Black Rock City",
    mission: {
      title: "Our Mission",
      paragraphs: [
        "Camp Alborz brings together the rich traditions of Persian culture with the transformative spirit of Burning Man. We create a space where ancient wisdom meets radical self-expression, fostering community, creativity, and cultural exchange.",
        "Named after Mount Alborz, the highest peak in Iran, our camp stands as a beacon of Persian heritage while embracing the diversity and inclusivity that makes the Burning Man community so special.",
      ],
    },
    values: [
      {
        icon: "heart",
        title: "Radical Hospitality",
        description: "Persian culture meets playa spirit - everyone is welcome at our tea house.",
        gradient: "from-persian-purple to-persian-violet",
      },
      {
        icon: "users",
        title: "Community First",
        description: "Building lasting bonds that extend far beyond Black Rock City.",
        gradient: "from-desert-gold to-saffron",
      },
      {
        icon: "globe",
        title: "Cultural Bridge",
        description: "Connecting East and West through art, food, and shared experiences.",
        gradient: "from-persian-violet to-pink-500",
      },
    ],
    timeline: [
      { year: "2008", event: "Camp Alborz founded by Persian burners" },
      { year: "2012", event: "First major art installation: Persian Garden" },
      { year: "2016", event: "Became official 501(c)(3) non-profit" },
      { year: "2020", event: "Virtual Burns during pandemic" },
      { year: "2023", event: "HOMA Fire Sculpture debut" },
      { year: "2024", event: "500+ members worldwide" },
    ],
    team: [
      {
        name: "Amir Jalali",
        role: "Founder & Camp Lead",
        bio: "Bringing Persian hospitality to the playa since 2008",
      },
      {
        name: "Maryam Hosseini",
        role: "Art Director",
        bio: "Leading our creative vision and art installations",
      },
      {
        name: "David Chen",
        role: "Operations Lead",
        bio: "Making the impossible possible, year after year",
      },
      {
        name: "Sara Mohammadi",
        role: "Community Manager",
        bio: "Fostering connections that last a lifetime",
      },
    ],
    nonprofit: {
      title: "501(c)(3) Non-Profit",
      description: "Camp Alborz is a registered 501(c)(3) non-profit organization dedicated to promoting cultural exchange, artistic expression, and community building. Your donations are tax-deductible and directly support our mission.",
      cta: {
        donate: "Support Our Mission",
        join: "Join Our Camp",
      },
    },
  },
};
