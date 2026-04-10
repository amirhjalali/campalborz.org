import { Metadata } from 'next';

/**
 * Centralized SEO Metadata Configuration
 *
 * Provides reusable metadata for all pages, structured data generators,
 * and breadcrumb schema helpers. Each page's layout.tsx imports from here.
 */

export const siteConfig = {
  name: 'Camp Alborz',
  legalName: 'Camp Alborz Inc.',
  description:
    'Camp Alborz is a 501(c)(3) nonprofit Burning Man theme camp celebrating Persian culture through art cars, live music, tea service, and radical hospitality since 2008.',
  shortDescription:
    'A Burning Man theme camp celebrating Persian culture, art, and community.',
  url: 'https://campalborz.org',
  ogImage: 'https://campalborz.org/images/playa_camp.webp',
  foundingYear: 2008,
  email: 'info@campalborz.org',
  locale: 'en_US',
  links: {
    instagram: 'https://www.instagram.com/campalborz/',
    youtube: 'https://www.youtube.com/@campalborz',
    soundcloud: 'https://soundcloud.com/camp_alborz',
  },
  keywords: [
    'Camp Alborz',
    'Burning Man',
    'Burning Man theme camp',
    'Persian culture',
    'Persian music',
    'Persian arts',
    'Black Rock City',
    'art camp',
    'art car',
    'HOMA',
    'DAMAVAND',
    'community',
    'nonprofit',
    '501(c)(3)',
    'radical hospitality',
    'playa',
  ],
};

/**
 * Generate fully-qualified metadata for any page.
 */
export function generateMetadata({
  title,
  description,
  image,
  keywords,
  path = '',
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;
  const pageKeywords = keywords
    ? Array.from(new Set([...siteConfig.keywords, ...keywords]))
    : siteConfig.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{ name: 'Camp Alborz', url: siteConfig.url }],
    creator: 'Camp Alborz',
    publisher: 'Camp Alborz',
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: `${title} - Camp Alborz`,
          type: 'image/webp',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: pageImage,
          alt: `${title} - Camp Alborz`,
        },
      ],
      creator: '@campalborz',
      site: '@campalborz',
    },
    category: 'arts',
  };
}

/* ─────────────────────────────────────────────────────────
   Pre-configured metadata for every public page
   ───────────────────────────────────────────────────────── */

export const pageMetadata = {
  home: generateMetadata({
    title: 'Camp Alborz — Persian Culture, Art Cars & Music at Burning Man | 501(c)(3)',
    description:
      'Camp Alborz is a 501(c)(3) nonprofit Burning Man theme camp celebrating Persian culture through HOMA and DAMAVAND art cars, live music, traditional tea service, and radical hospitality since 2008. Join our community from Brooklyn to Black Rock City.',
    path: '/',
    keywords: [
      'home',
      'Persian hospitality',
      'tea service',
      'hookah lounge',
      'Brooklyn',
      'Black Rock City',
      'Burning Man camp',
    ],
  }),

  about: generateMetadata({
    title: 'About Camp Alborz — Our Story, Mission & Leadership Since 2008',
    description:
      'Camp Alborz has brought Persian culture to Burning Man since 2008. Learn about our 501(c)(3) nonprofit mission, founding story, leadership team, and core values of radical hospitality and creative expression.',
    path: '/about',
    keywords: [
      'about',
      'history',
      'mission',
      'values',
      'leadership',
      'founding story',
      'Black Rock City history',
    ],
  }),

  art: generateMetadata({
    title: 'Art & Installations — HOMA, DAMAVAND & Persian-Inspired Creations',
    description:
      'Explore Camp Alborz art projects: the HOMA phoenix art car, DAMAVAND mountain installation, and Persian-inspired sculptures blending ancient motifs with contemporary design at Burning Man.',
    path: '/art',
    keywords: [
      'art installations',
      'gallery',
      'exhibits',
      'Persian art',
      'interactive art',
      'Burning Man art',
      'public art',
      'sculpture',
    ],
  }),

  artHoma: generateMetadata({
    title: 'HOMA Art Car — Persian Mythical Phoenix Mobile Stage',
    description:
      'HOMA is Camp Alborz\'s flagship art car — a 40-foot Persian mythical phoenix brought to life as an illuminated mobile sound stage at Burning Man. Hand-built by community volunteers with a custom sound system.',
    path: '/art/homa',
    keywords: [
      'HOMA',
      'art car',
      'mobile stage',
      'sound system',
      'Persian mythology',
      'phoenix',
      'mutant vehicle',
      'Burning Man art car',
      'illuminated sculpture',
    ],
  }),

  artDamavand: generateMetadata({
    title: 'DAMAVAND Art Car — Mountain-Inspired Mobile Installation',
    description:
      'DAMAVAND is Camp Alborz\'s mountain-inspired art car, named after Iran\'s tallest peak Mount Damavand. A volunteer-built mobile installation and sound stage featuring LED illumination and Persian design elements.',
    path: '/art/damavand',
    keywords: [
      'DAMAVAND',
      'art car',
      'Mount Damavand',
      'mobile installation',
      'sound stage',
      'mutant vehicle',
      'Burning Man art car',
      'LED art',
      'mountain art',
    ],
  }),

  events: generateMetadata({
    title: 'Events — Persian Music Nights, Fundraisers & Cultural Gatherings',
    description:
      'Join Camp Alborz at Persian music nights, DJ sets, cultural workshops, fundraiser dinners, and Burning Man gatherings. Year-round events in Brooklyn and at Black Rock City, open to everyone.',
    path: '/events',
    keywords: [
      'events',
      'calendar',
      'workshops',
      'performances',
      'DJ sets',
      'Persian music night',
      'fundraiser',
      'gathering',
      'Brooklyn events',
    ],
  }),

  culture: generateMetadata({
    title: 'Persian Culture — Heritage, Poetry, Music & Living Traditions',
    description:
      'Discover Persian culture through Camp Alborz: Rumi and Hafez poetry, Persian calligraphy, traditional cuisine, tar and setar music, Nowruz celebrations, and the living heritage that inspires our Burning Man community.',
    path: '/culture',
    keywords: [
      'Persian culture',
      'traditions',
      'heritage',
      'poetry',
      'calligraphy',
      'cuisine',
      'Rumi',
      'Hafez',
      'Nowruz',
      'Iranian culture',
      'tar',
      'setar',
    ],
  }),

  donate: generateMetadata({
    title: 'Donate — Support Persian Arts & Culture at Burning Man',
    description:
      'Support Camp Alborz, a 501(c)(3) nonprofit. Your tax-deductible donation funds HOMA and DAMAVAND art cars, cultural programming, music events, and Persian arts education at Burning Man and beyond.',
    path: '/donate',
    keywords: [
      'donate',
      'support',
      'fundraising',
      'contribution',
      'tax-deductible',
      'nonprofit donation',
      'arts funding',
      'sponsor',
    ],
  }),

  donateSuccess: generateMetadata({
    title: 'Thank You for Your Donation',
    description:
      'Thank you for supporting Camp Alborz! Your tax-deductible donation helps fund Persian art cars, cultural events, and community programming.',
    path: '/donate/success',
    keywords: ['thank you', 'donation receipt'],
    noIndex: true,
  }),

  apply: generateMetadata({
    title: 'Join Camp Alborz — Apply for Membership at Burning Man',
    description:
      'Apply to join Camp Alborz at Burning Man. We welcome people of all backgrounds who share our passion for Persian culture, collaborative art, music, and radical hospitality. No prior Burn experience required.',
    path: '/apply',
    keywords: [
      'apply',
      'join',
      'membership',
      'application',
      'Burning Man camp application',
      'become a member',
      'campmate',
    ],
  }),

  members: generateMetadata({
    title: 'Member Portal',
    description:
      'Camp Alborz member portal. Access camp resources, connect with fellow members, and manage your membership.',
    path: '/members',
    keywords: ['members', 'portal', 'login', 'resources'],
    noIndex: true,
  }),

  search: generateMetadata({
    title: 'Search Camp Alborz',
    description:
      'Search Camp Alborz for events, art installations, cultural content, membership information, and community resources.',
    path: '/search',
    keywords: ['search', 'find', 'explore'],
    noIndex: true,
  }),

  login: generateMetadata({
    title: 'Log In',
    description: 'Log in to your Camp Alborz member account.',
    path: '/login',
    noIndex: true,
  }),

  forgotPassword: generateMetadata({
    title: 'Reset Password',
    description: 'Reset your Camp Alborz account password.',
    path: '/forgot-password',
    noIndex: true,
  }),

  resetPassword: generateMetadata({
    title: 'Set New Password',
    description: 'Set a new password for your Camp Alborz account.',
    path: '/reset-password',
    noIndex: true,
  }),

  invite: generateMetadata({
    title: 'Accept Invitation',
    description: 'Accept your invitation to join Camp Alborz.',
    path: '/invite',
    noIndex: true,
  }),

  admin: generateMetadata({
    title: 'Admin Dashboard',
    description:
      'Camp Alborz admin dashboard for managing content, members, and operations.',
    path: '/admin',
    noIndex: true,
  }),

  portal: generateMetadata({
    title: 'Member Portal',
    description:
      'Access your Camp Alborz member dashboard, season details, payments, and profile.',
    path: '/portal',
    noIndex: true,
  }),

  register: generateMetadata({
    title: 'Register',
    description: 'Registration for Camp Alborz is invite-only.',
    path: '/register',
    noIndex: true,
  }),
};

/* ─────────────────────────────────────────────────────────
   JSON-LD Structured Data Generators
   ───────────────────────────────────────────────────────── */

/**
 * Organization + NonprofitOrganization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NonprofitOrganization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: siteConfig.ogImage,
    },
    image: siteConfig.ogImage,
    foundingDate: '2008',
    nonprofitStatus: '501(c)(3)',
    areaServed: [
      {
        '@type': 'Place',
        name: 'Black Rock City, Nevada',
      },
      {
        '@type': 'Place',
        name: 'Brooklyn, New York',
      },
    ],
    sameAs: Object.values(siteConfig.links),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brooklyn',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.email,
      contactType: 'General Inquiries',
      availableLanguage: ['English', 'Persian'],
    },
    knowsAbout: [
      'Persian culture',
      'Burning Man',
      'art cars',
      'music',
      'community building',
      'nonprofit arts organizations',
    ],
    slogan: 'Persian culture, radical hospitality',
  };
}

/**
 * WebSite schema with SearchAction for sitelinks search box
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'en-US',
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList schema generator
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: `${siteConfig.url}${item.path}`,
      })),
    ],
  };
}

/**
 * Event schema for individual events
 */
export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  image?: string;
  url?: string;
  isAccessibleForFree?: boolean;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    eventStatus: `https://schema.org/${event.eventStatus || 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${event.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    image: event.image || siteConfig.ogImage,
    organizer: {
      '@id': `${siteConfig.url}/#organization`,
    },
    ...(event.url && { url: event.url }),
    ...(typeof event.isAccessibleForFree === 'boolean' && {
      isAccessibleForFree: event.isAccessibleForFree,
    }),
  };
}

/**
 * DonateAction schema for the donation page
 */
export function generateDonateActionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    description:
      'Donate to Camp Alborz, a 501(c)(3) nonprofit supporting Persian arts and culture at Burning Man.',
    recipient: {
      '@id': `${siteConfig.url}/#organization`,
    },
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/donate`,
      actionPlatform: [
        'https://schema.org/DesktopWebPlatform',
        'https://schema.org/MobileWebPlatform',
      ],
    },
  };
}

/**
 * WebPage schema for individual pages
 */
export function generateWebPageSchema({
  name,
  description,
  path,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteConfig.url}${path}/#webpage`,
    name,
    description,
    url: `${siteConfig.url}${path}`,
    isPartOf: {
      '@id': `${siteConfig.url}/#website`,
    },
    about: {
      '@id': `${siteConfig.url}/#organization`,
    },
    ...(dateModified && { dateModified }),
    inLanguage: 'en-US',
  };
}

/**
 * CollectionPage schema for art gallery / events listing pages
 */
export function generateCollectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteConfig.url}${path}/#webpage`,
    name,
    description,
    url: `${siteConfig.url}${path}`,
    isPartOf: {
      '@id': `${siteConfig.url}/#website`,
    },
    about: {
      '@id': `${siteConfig.url}/#organization`,
    },
    inLanguage: 'en-US',
  };
}
