import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.artDamavand;

export default function DamavandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Art & Installations', path: '/art' },
          { name: 'DAMAVAND Art Car', path: '/art/damavand' },
        ]}
      />
      <WebPageStructuredData
        name="DAMAVAND Art Car"
        description="Camp Alborz's mountain-inspired art car named after Iran's tallest peak."
        path="/art/damavand"
      />
      {children}
    </>
  );
}
