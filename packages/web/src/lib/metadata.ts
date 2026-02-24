import { Metadata } from 'next';

/**
 * Default SEO Metadata Configuration
 *
 * This file provides reusable metadata configurations for all pages.
 * Import and customize for each page to improve SEO.
 */

export const siteConfig = {
  name: 'Camp Alborz',
  description: 'Camp Alborz is a 501(c)(3) nonprofit celebrating Persian culture through music, art, and radical hospitality — from Brooklyn to Black Rock City.',
  url: 'https://campalborz.org',
  ogImage: 'https://campalborz.org/og-image.jpg',
  links: {
    instagram: 'https://www.instagram.com/campalborz/',
    youtube: 'https://www.youtube.com/@campalborz',
    soundcloud: 'https://soundcloud.com/camp_alborz',
  },
  keywords: [
    'Camp Alborz',
    'Burning Man',
    'Theme Camp',
    'Persian Culture',
    'Persian Music',
    'Persian Arts',
    'Art Camp',
    'Black Rock City',
    'Community',
    'Music',
    'Culture',
    'Art Installation',
    'Persian Art',
    'Nonprofit',
    '501c3',
    'Art Car',
    'HOMA',
    'DAMAVAND',
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
    title: 'Camp Alborz | Persian Culture, Music & Arts Community | 501(c)(3) Nonprofit',
    description: 'Camp Alborz is a 501(c)(3) nonprofit Burning Man theme camp celebrating Persian culture through art cars, music, tea service, and radical hospitality since 2008.',
    path: '/',
    keywords: ['Home', 'Persian hospitality', 'tea service', 'hookah lounge'],
  }),

  about: generateMetadata({
    title: 'About Camp Alborz | Our Story, Mission & 501(c)(3) Nonprofit Status',
    description: 'Learn about Camp Alborz, a 501(c)(3) nonprofit celebrating Persian culture at Burning Man since 2008. Meet our leadership team and discover our core values.',
    path: '/about',
    keywords: ['About', 'History', 'Mission', 'Values', '501(c)(3)', 'nonprofit'],
  }),

  art: generateMetadata({
    title: 'Art | Camp Alborz — Persian and Contemporary Visual Arts',
    description: 'Explore HOMA and DAMAVAND art cars and Persian-inspired installations by Camp Alborz. Interactive art experiences blending ancient Persian motifs with modern design.',
    path: '/art',
    keywords: ['Art', 'Installations', 'Gallery', 'Exhibits', 'Persian Art', 'art car', 'HOMA', 'DAMAVAND'],
  }),

  artHoma: generateMetadata({
    title: 'HOMA Art Car | Camp Alborz — Persian Mythical Bird Mobile Stage',
    description: 'HOMA is Camp Alborz\'s flagship art car — a Persian mythical bird brought to life as a mobile sound stage and illuminated sculpture at Burning Man.',
    path: '/art/homa',
    keywords: ['HOMA', 'art car', 'mobile stage', 'sound system', 'Persian mythology', 'Burning Man art'],
  }),

  artDamavand: generateMetadata({
    title: 'DAMAVAND Art Car | Camp Alborz — Mountain-Inspired Mobile Installation',
    description: 'DAMAVAND is Camp Alborz\'s mountain-inspired art car, named after Iran\'s tallest peak. A mobile installation and sound stage built by community volunteers.',
    path: '/art/damavand',
    keywords: ['DAMAVAND', 'art car', 'Mount Damavand', 'mobile installation', 'sound stage', 'Burning Man art'],
  }),

  events: generateMetadata({
    title: 'Events | Camp Alborz — Persian Music, Dance & Cultural Gatherings',
    description: 'Join Camp Alborz events: Persian music nights, DJ sets, cultural workshops, fundraisers, and Burning Man gatherings. Open to everyone year-round.',
    path: '/events',
    keywords: ['Events', 'Calendar', 'Workshops', 'Performances', 'DJ Sets', 'Persian music', 'fundraiser'],
  }),

  culture: generateMetadata({
    title: 'Persian Culture | Camp Alborz — Heritage, Traditions & Modern Expression',
    description: 'Discover Persian culture through Camp Alborz: poetry, calligraphy, cuisine, music traditions, and the living heritage that inspires our community.',
    path: '/culture',
    keywords: ['Culture', 'Persian', 'Traditions', 'Heritage', 'History', 'poetry', 'calligraphy', 'cuisine'],
  }),

  donate: generateMetadata({
    title: 'Support Camp Alborz | Donate to Persian Arts & Culture',
    description: 'Support Camp Alborz, a 501(c)(3) nonprofit. Your tax-deductible donation funds art cars, cultural events, and Persian arts programming at Burning Man and beyond.',
    path: '/donate',
    keywords: ['Donate', 'Support', 'Fundraising', 'Contribution', '501c3', 'tax-deductible', 'nonprofit'],
  }),

  donateSuccess: generateMetadata({
    title: 'Thank You for Your Donation | Camp Alborz',
    description: 'Thank you for supporting Camp Alborz! Your tax-deductible donation helps fund Persian arts, culture, and community programming.',
    path: '/donate/success',
    keywords: ['Thank you', 'Donation', 'Receipt'],
    noIndex: true,
  }),

  apply: generateMetadata({
    title: 'Join Camp Alborz | Apply for Membership',
    description: 'Apply to join Camp Alborz at Burning Man. We welcome people of all backgrounds who share our passion for Persian culture, art, and community.',
    path: '/apply',
    keywords: ['Apply', 'Join', 'Membership', 'Application', 'Community', 'Burning Man camp'],
  }),

  members: generateMetadata({
    title: 'Member Portal | Camp Alborz',
    description: 'Camp Alborz member portal. Access resources, connect with fellow members, and manage your camp membership.',
    path: '/members',
    keywords: ['Members', 'Portal', 'Login', 'Resources'],
    noIndex: true,
  }),

  search: generateMetadata({
    title: 'Search | Camp Alborz',
    description: 'Search Camp Alborz for events, art installations, cultural content, and community resources.',
    path: '/search',
    keywords: ['Search', 'Find'],
  }),

  login: generateMetadata({
    title: 'Log In | Camp Alborz',
    description: 'Log in to your Camp Alborz member account.',
    path: '/login',
    noIndex: true,
  }),

  forgotPassword: generateMetadata({
    title: 'Reset Password | Camp Alborz',
    description: 'Reset your Camp Alborz account password.',
    path: '/forgot-password',
    noIndex: true,
  }),

  resetPassword: generateMetadata({
    title: 'Reset Password | Camp Alborz',
    description: 'Set a new password for your Camp Alborz account.',
    path: '/reset-password',
    noIndex: true,
  }),

  invite: generateMetadata({
    title: 'Accept Invitation | Camp Alborz',
    description: 'Accept your invitation to join Camp Alborz.',
    path: '/invite',
    noIndex: true,
  }),

  admin: generateMetadata({
    title: 'Admin Dashboard | Camp Alborz',
    description: 'Camp Alborz admin dashboard for managing content, members, and operations.',
    path: '/admin',
    noIndex: true,
  }),
};

/**
 * JSON-LD Structured Data for SEO
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NonprofitOrganization',
    name: siteConfig.name,
    legalName: 'Camp Alborz Inc.',
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    foundingDate: '2008',
    nonprofitStatus: '501(c)(3)',
    sameAs: Object.values(siteConfig.links),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@campalborz.org',
      contactType: 'General Inquiries',
    },
    keywords: 'Persian culture, Burning Man, art cars, music, community, nonprofit',
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
