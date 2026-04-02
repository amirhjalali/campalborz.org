import { MetadataRoute } from 'next';

/**
 * Robots.txt Generation
 *
 * Controls search engine crawling behavior.
 * - Public content pages are fully crawlable.
 * - Admin, auth, API, and member-only pages are blocked.
 * - Major bots (Google, Bing) get explicit allow rules.
 * - AI crawlers are blocked to protect content.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://campalborz.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/portal/',
          '/members/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/invite/',
          '/donate/success',
          '/*?preview=*',
          '/_next/',
        ],
      },
      // Google — explicit allow for priority pages
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/art/',
          '/events',
          '/culture',
          '/donate',
          '/apply',
        ],
        disallow: ['/admin/', '/api/', '/portal/', '/members/'],
      },
      // Bing
      {
        userAgent: 'bingbot',
        allow: [
          '/',
          '/about',
          '/art/',
          '/events',
          '/culture',
          '/donate',
          '/apply',
        ],
        disallow: ['/admin/', '/api/', '/portal/', '/members/'],
      },
      // Block common AI scrapers from copying content wholesale
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
