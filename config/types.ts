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

  // About Page
  about?: {
    title: string;
    subtitle: string;
    mission: {
      title: string;
      paragraphs: string[];
    };
    values: AboutValue[];
    timeline: TimelineEvent[];
    team: TeamMember[];
    nonprofit: {
      title: string;
      description: string;
      cta: {
        donate: string;
        join: string;
      };
    };
  };

  // Art Page
  art?: {
    title: string;
    subtitle: string;
    categories: ArtCategory[];
    installations: ArtInstallation[];
  };

  // Events Page
  events?: {
    title: string;
    subtitle: string;
    eventTypes: EventType[];
    upcomingEvents: Event[];
    burningManSchedule?: BurningManDay[];
    guidelines?: EventGuidelines;
    cta?: {
      title: string;
      description: string;
      buttons: {
        primary: { text: string; link: string; };
        secondary: { text: string; link: string; };
      };
    };
  };

  // Donate Page
  donate?: {
    title: string;
    subtitle: string;
    impactStats: ImpactStat[];
    donationTiers: DonationTier[];
    fundingPriorities: FundingPriority[];
    transparencyItems: TransparencyItem[];
    otherWaysToHelp: OtherWayToHelp[];
    donorRecognition?: {
      title: string;
      description: string;
      tiers: DonorRecognitionTier[];
    };
    taxInfo?: {
      title: string;
      description: string;
      ein?: string;
    };
    donationForm?: {
      title: string;
      description: string;
      campaigns: string[];
    };
    cta?: {
      title: string;
      description: string;
      buttons: {
        primary: { text: string; link: string; };
        secondary: { text: string; link: string; };
      };
    };
  };

  // Culture Page
  culture?: {
    title: string;
    subtitle: string;
    culturalElements: CulturalElement[];
    culturalValues: CulturalValue[];
    workshops: CulturalWorkshop[];
    celebrations: PersianCelebration[];
    learningResources: LearningResourceSection[];
    culturalBridge?: {
      missionTitle: string;
      mission: string[];
      howWeDoItTitle: string;
      howWeDoIt: BridgeAction[];
    };
    cta?: {
      title: string;
      description: string;
      buttons: {
        primary: { text: string; link: string; };
        secondary: { text: string; link: string; };
      };
    };
  };

  // Members Page
  members?: {
    title: string;
    subtitle: string;
    loginSection: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      submitButton: string;
      notMemberText: string;
      applyLinkText: string;
    };
    benefits: {
      title: string;
      subtitle: string;
      items: MemberBenefit[];
    };
    spotlight: {
      title: string;
      subtitle: string;
      members: MemberSpotlight[];
    };
    communityStats: CommunityStats[];
    cta?: {
      title: string;
      description: string;
      buttons: {
        primary: { text: string; link: string; };
        secondary: { text: string; link: string; };
      };
    };
  };

  // Apply Page
  apply?: {
    title: string;
    subtitle: string;
    form: {
      title: string;
      fields: {
        personalInfo: {
          title: string;
          nameLabel: string;
          emailLabel: string;
          phoneLabel: string;
          emergencyContactLabel: string;
          emergencyContactPlaceholder: string;
        };
        experienceLabel: string;
        experienceOptions: ExperienceOption[];
        interestsLabel: string;
        interestsPlaceholder: string;
        contributionLabel: string;
        contributionPlaceholder: string;
        dietaryLabel: string;
        dietaryPlaceholder: string;
      };
      beforeYouApply: {
        title: string;
        items: string[];
      };
      submitButton: string;
      successMessage: string;
      reviewMessage: string;
    };
    process: {
      title: string;
      steps: ApplicationStep[];
    };
  };

  // Search Page
  search?: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categories: {
      title: string;
      subtitle: string;
      items: SearchCategory[];
    };
    results: {
      title: string;
      mockResults: SearchResult[];
    };
    popularSearches: {
      title: string;
      terms: string[];
    };
  };
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

export interface AboutValue {
  icon: string;
  title: string;
  description: string;
  gradient?: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export interface ArtCategory {
  name: string;
  count: number;
  icon: string;
  gradient?: string;
}

export interface ArtInstallation {
  id: number;
  title: string;
  year: string;
  artist: string;
  description: string;
  location: string;
  participants: string;
  impact: string;
  gradient?: string;
}

export interface EventType {
  name: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  attendees: number;
  maxAttendees: number;
  icon: string;
  color: string;
}

export interface BurningManDay {
  day: string;
  events: BurningManEvent[];
}

export interface BurningManEvent {
  time: string;
  title: string;
  description: string;
}

export interface EventGuidelines {
  beforeAttending: string[];
  communityValues: string[];
}

export interface ImpactStat {
  number: string;
  label: string;
  icon: string;
}

export interface DonationTier {
  amount: number;
  title: string;
  description: string;
  perks: string[];
  popular: boolean;
}

export interface FundingPriority {
  title: string;
  percentage: number;
  amount: number;
  goal: number;
  description: string;
  icon: string;
  color: string;
}

export interface TransparencyItem {
  category: string;
  percentage: number;
  amount: string;
  description: string;
}

export interface OtherWayToHelp {
  title: string;
  description: string;
  icon: string;
  amount: string;
}

export interface DonorRecognitionTier {
  title: string;
  description: string;
}

export interface CulturalElement {
  title: string;
  description: string;
  icon: string;
  activities: string[];
  color: string;
}

export interface CulturalValue {
  title: string;
  description: string;
  example: string;
  icon: string;
}

export interface CulturalWorkshop {
  title: string;
  instructor: string;
  level: string;
  duration: string;
  description: string;
  materials: string;
  frequency: string;
}

export interface PersianCelebration {
  name: string;
  date: string;
  description: string;
  traditions: string[];
}

export interface LearningResourceSection {
  category: string;
  resources: string[];
}

export interface BridgeAction {
  icon: string;
  text: string;
}

export interface MemberBenefit {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export interface MemberSpotlight {
  name: string;
  role: string;
  years: string;
  contribution: string;
  gradient: string;
}

export interface CommunityStats {
  value: string;
  label: string;
  icon: string;
}

export interface ExperienceOption {
  value: string;
  label: string;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface SearchCategory {
  id: string;
  label: string;
  icon: string;
  count: string;
}

export interface SearchResult {
  title: string;
  type: string;
  excerpt: string;
  date: string;
}
