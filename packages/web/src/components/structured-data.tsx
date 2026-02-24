import { generateOrganizationSchema } from '@/lib/metadata';

/**
 * JSON-LD Structured Data Component
 *
 * Renders NonprofitOrganization schema markup for search engines.
 * Include in the root layout so every page carries the org data.
 */
export function StructuredData() {
  const orgSchema = generateOrganizationSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}
