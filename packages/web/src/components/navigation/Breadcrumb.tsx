'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  /**
   * Custom breadcrumb items (if not provided, auto-generated from URL)
   */
  items?: BreadcrumbItem[];

  /**
   * Show home icon instead of "Home" text
   */
  homeIcon?: boolean;

  /**
   * Separator character or element
   */
  separator?: React.ReactNode;
}

/**
 * Breadcrumb Navigation Component
 *
 * Automatically generates breadcrumbs from the current path or uses provided items
 */
export function Breadcrumb({
  items,
  homeIcon = false,
  separator,
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no items provided
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  // Always include home
  const allItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...breadcrumbItems.filter(item => item.href !== '/'),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">
                  {separator || <ChevronRightIcon className="h-4 w-4" />}
                </span>
              )}

              {isLast ? (
                <span
                  className="text-gray-700 font-medium"
                  aria-current="page"
                >
                  {isHome && homeIcon ? (
                    <HomeIcon className="h-4 w-4" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {isHome && homeIcon ? (
                    <HomeIcon className="h-4 w-4" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove leading/trailing slashes and split
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    // Build href up to this segment
    const href = '/' + segments.slice(0, index + 1).join('/');

    // Convert segment to label (capitalize and replace hyphens)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { label, href };
  });
}

/**
 * Breadcrumb with background
 */
export function BreadcrumbBanner({
  title,
  items,
}: {
  title: string;
  items?: BreadcrumbItem[];
}) {
  return (
    <div className="bg-gradient-to-r from-desert-sand/20 to-desert-sand/10 border-b border-dust-khaki/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={items} homeIcon />
        <h1 className="text-3xl font-display font-bold text-desert-night mt-4">{title}</h1>
      </div>
    </div>
  );
}

/**
 * Structured data for breadcrumbs (SEO)
 */
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.campalborz.org/',
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: `https://www.campalborz.org${item.href}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
