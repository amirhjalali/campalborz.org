import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateDonateActionSchema,
  generateWebPageSchema,
  generateCollectionPageSchema,
} from '@/lib/metadata';

/**
 * Root-level JSON-LD Structured Data
 *
 * Renders Organization, WebSite, and DonateAction schema markup.
 * Included in the root layout so every page carries the org data.
 */
export function StructuredData() {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const donateActionSchema = generateDonateActionSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donateActionSchema) }}
      />
    </>
  );
}

/**
 * Breadcrumb JSON-LD for individual pages.
 * Use in page-level layouts to add BreadcrumbList schema.
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  const schema = generateBreadcrumbSchema(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebPage JSON-LD for standard content pages.
 */
export function WebPageStructuredData({
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
  const schema = generateWebPageSchema({ name, description, path, dateModified });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * CollectionPage JSON-LD for listing pages (art, events).
 */
export function CollectionPageStructuredData({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  const schema = generateCollectionPageSchema({ name, description, path });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
