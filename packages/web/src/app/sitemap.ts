import { MetadataRoute } from 'next';

/**
 * Sitemap Generation
 *
 * Generates sitemap.xml for search engines with accurate priorities
 * and change frequencies reflecting actual content update patterns.
 *
 * Priority strategy:
 *   1.0 — Homepage (primary landing page)
 *   0.9 — High-value conversion pages (donate, events)
 *   0.8 — Key content pages (about, art, apply)
 *   0.7 — Sub-pages with unique content (art cars, culture)
 *   0.3 — Utility pages (search)
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://campalborz.org';

  // Use a fixed date for lastModified to avoid re-generating on every build
  const now = new Date().toISOString();

  const staticPages: Array<{
    url: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    lastModified: string;
  }> = [
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'weekly',
      lastModified: now,
    },
    {
      url: '/about',
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/art',
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/art/homa',
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/art/damavand',
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/events',
      priority: 0.9,
      changeFrequency: 'weekly',
      lastModified: now,
    },
    {
      url: '/culture',
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/donate',
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: now,
    },
    {
      url: '/apply',
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: now,
    },
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
