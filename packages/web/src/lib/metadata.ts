import { Metadata } from 'next';

/**
 * Default SEO Metadata Configuration
 *
 * This file provides reusable metadata configurations for all pages.
 * Import and customize for each page to improve SEO.
 */

export const siteConfig = {
  name: 'Camp Alborz',
  description: 'A vibrant Burning Man theme camp celebrating Persian culture, art, and radical self-expression. Join our community of artists, musicians, and cultural explorers.',
  url: 'https://www.campalborz.org',
  ogImage: 'https://www.campalborz.org/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/campalborz',
    instagram: 'https://instagram.com/campalborz',
    facebook: 'https://facebook.com/campalborz',
  },
  keywords: [
    'Burning Man',
    'Theme Camp',
    'Persian Culture',
    'Art Camp',
    'Black Rock City',
    'Community',
    'Music',
    'Culture',
    'Art Installation',
    'Persian Art',
    'Alborz',
  ],
};

/**
 * Generate default metadata for a page
 */
export function generateMetadata({
  title,
  description,
  image,
  keywords,
  path = '',
  noIndex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const pageKeywords = keywords ? [...siteConfig.keywords, ...keywords] : siteConfig.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{ name: 'Camp Alborz' }],
    creator: 'Camp Alborz',
    publisher: 'Camp Alborz',
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: '@campalborz',
      site: '@campalborz',
    },
  };
}

/**
 * Pre-configured metadata for common pages
 */
export const pageMetadata = {
  home: generateMetadata({
    title: 'Camp Alborz - Persian Culture Meets Burning Man',
    description: 'Experience the intersection of Persian heritage and radical self-expression at Camp Alborz. A Burning Man theme camp celebrating art, music, and community.',
    path: '/',
    keywords: ['Home', 'Main'],
  }),

  about: generateMetadata({
    title: 'About Us',
    description: 'Learn about Camp Alborz, our mission to celebrate Persian culture on the playa, and the vibrant community that makes it all possible.',
    path: '/about',
    keywords: ['About', 'History', 'Mission', 'Values'],
  }),

  art: generateMetadata({
    title: 'Art & Installations',
    description: 'Explore our stunning Persian-inspired art installations, interactive exhibits, and cultural experiences at Burning Man.',
    path: '/art',
    keywords: ['Art', 'Installations', 'Gallery', 'Exhibits', 'Persian Art'],
  }),

  events: generateMetadata({
    title: 'Events & Calendar',
    description: 'Join us for workshops, performances, DJ sets, and cultural celebrations. Check out our event calendar for what\'s happening at Camp Alborz.',
    path: '/events',
    keywords: ['Events', 'Calendar', 'Workshops', 'Performances', 'DJ Sets'],
  }),

  culture: generateMetadata({
    title: 'Persian Culture',
    description: 'Discover the rich tapestry of Persian culture, from ancient traditions to modern expressions, as celebrated at Camp Alborz.',
    path: '/culture',
    keywords: ['Culture', 'Persian', 'Traditions', 'Heritage', 'History'],
  }),

  donate: generateMetadata({
    title: 'Support Our Camp',
    description: 'Help us create unforgettable experiences and celebrate Persian culture at Burning Man. Your donation supports our art, events, and community.',
    path: '/donate',
    keywords: ['Donate', 'Support', 'Fundraising', 'Contribution', '501c3'],
  }),

  apply: generateMetadata({
    title: 'Join Our Camp',
    description: 'Apply to become a member of Camp Alborz. We welcome passionate individuals who want to contribute to our vibrant community.',
    path: '/apply',
    keywords: ['Apply', 'Join', 'Membership', 'Application', 'Community'],
  }),

  members: generateMetadata({
    title: 'Member Portal',
    description: 'Member area for Camp Alborz participants. Access resources, connect with fellow members, and stay updated.',
    path: '/members',
    keywords: ['Members', 'Portal', 'Login', 'Resources'],
    noIndex: true, // Don't index login-required pages
  }),

  search: generateMetadata({
    title: 'Search',
    description: 'Search Camp Alborz website for events, content, and resources.',
    path: '/search',
    keywords: ['Search', 'Find'],
  }),

  admin: generateMetadata({
    title: 'Admin Dashboard',
    description: 'Camp Alborz admin dashboard for managing content, members, and operations.',
    path: '/admin',
    noIndex: true, // Don't index admin pages
  }),
};

/**
 * JSON-LD Structured Data for SEO
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: Object.values(siteConfig.links),
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@campalborz.org',
      contactType: 'General Inquiries',
    },
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    image: event.image || siteConfig.ogImage,
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
