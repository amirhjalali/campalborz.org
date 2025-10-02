/**
 * Type definitions for camp configuration system
 */

export interface CampConfig {
  // Basic Info
  name: string;
  tagline: string;
  description: string;

  // Organization
  legalName: string;
  taxStatus: string;
  ein?: string;

  // Contact
  email: string;
  phone?: string;
  location: string;

  // URLs
  website: string;
  domain: string;
  subdomain: string;

  // Social Media
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };

  // Features
  features: {
    events: boolean;
    donations: boolean;
    membership: boolean;
    forum: boolean;
    gallery: boolean;
    newsletter: boolean;
  };

  // Cultural Identity
  cultural: {
    heritage: string;
    artStyle: string;
    values: string[];
  };
}

export interface BrandConfig {
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: {
      primary: string;
      secondary: string;
    };
  };

  // Typography
  fonts: {
    display: string;
    body: string;
    ui: string;
  };

  // Theme
  theme: {
    style: string;
    patterns: string[];
  };

  // Assets
  assets: {
    logo: string;
    logoLight: string;
    logoDark: string;
    favicon: string;
    ogImage: string;
    heroBackground?: string;
  };
}

export interface ContentConfig {
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta: {
      primary: {
        text: string;
        icon: string;
        link: string;
      };
      secondary: {
        text: string;
        icon: string;
        link: string;
      };
    };
  };

  // Navigation
  navigation: {
    enabled: boolean;
    customItems: NavigationItem[];
  };

  // Footer
  footer: {
    tagline: string;
    copyright: string;
  };

  // Stats
  stats: Stat[];

  // Feature Cards
  features: FeatureCard[];
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
  description?: string;
  color?: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  gradient?: string;
  image?: string;
}
