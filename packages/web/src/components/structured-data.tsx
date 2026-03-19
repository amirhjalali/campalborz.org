import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/metadata';

/**
 * JSON-LD Structured Data Component
 *
 * Renders NonprofitOrganization and WebSite schema markup for search engines.
 * Include in the root layout so every page carries the org data.
 */
export function StructuredData() {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

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
    </>
  );
}
