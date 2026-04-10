import { MetadataRoute } from 'next';

/**
 * Web App Manifest
 *
 * Provides metadata for when the site is installed as a PWA
 * or added to a home screen. Also helps with discoverability.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Camp Alborz — Persian Culture at Burning Man',
    short_name: 'Camp Alborz',
    description:
      'Camp Alborz is a 501(c)(3) nonprofit Burning Man theme camp celebrating Persian culture through art cars, music, and radical hospitality.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#4A5D5A',
    icons: [
      {
        src: '/images/playa_camp.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
    categories: ['arts', 'culture', 'community', 'nonprofit'],
  };
}
