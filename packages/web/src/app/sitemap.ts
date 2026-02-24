import { MetadataRoute } from 'next';

/**
 * Sitemap Generation
 *
 * Generates sitemap.xml for search engines
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://campalborz.org';

  const staticPages = [
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
    },
    {
      url: '/about',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/art',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/art/homa',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/art/damavand',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/events',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
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
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
    {
      url: '/search',
      priority: 0.3,
      changeFrequency: 'monthly' as const,
    },
  ];

  return staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
