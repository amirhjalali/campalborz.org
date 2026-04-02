import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.apply;

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'Apply', path: '/apply' }]} />
      <WebPageStructuredData
        name="Join Camp Alborz"
        description="Apply to join Camp Alborz at Burning Man. Open to all backgrounds."
        path="/apply"
      />
      {children}
    </>
  );
}
