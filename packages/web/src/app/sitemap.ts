import { MetadataRoute } from 'next';

/**
 * Sitemap Generation
 *
 * Generates sitemap.xml for search engines
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.campalborz.org';

  // Static pages with their priorities and change frequencies
  const staticPages = [
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'daily' as const,
    },
    {
      url: '/about',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/art',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    {
      url: '/events',
      priority: 0.9,
      changeFrequency: 'daily' as const,
    },
    {
      url: '/culture',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/donate',
      priority: 0.9,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/apply',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/members',
      priority: 0.6,
      changeFrequency: 'weekly' as const,
    },
    {
      url: '/search',
      priority: 0.5,
      changeFrequency: 'daily' as const,
    },
  ];

  return staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // In production, you would also dynamically generate URLs for:
  // - Individual events: /events/[slug]
  // - Blog posts: /blog/[slug]
  // - Art pieces: /art/[slug]
  // - Member profiles: /members/[id]
  //
  // Example:
  // const events = await fetchAllEvents();
  // const eventPages = events.map(event => ({
  //   url: `${baseUrl}/events/${event.slug}`,
  //   lastModified: event.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));
  //
  // return [...staticPages, ...eventPages];
}
