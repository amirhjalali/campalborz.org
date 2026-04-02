import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, CollectionPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.art;

export default function ArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'Art & Installations', path: '/art' }]} />
      <CollectionPageStructuredData
        name="Art & Installations"
        description="HOMA and DAMAVAND art cars and Persian-inspired installations by Camp Alborz."
        path="/art"
      />
      {children}
    </>
  );
}
