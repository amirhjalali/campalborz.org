import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.artHoma;

export default function HomaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Art & Installations', path: '/art' },
          { name: 'HOMA Art Car', path: '/art/homa' },
        ]}
      />
      <WebPageStructuredData
        name="HOMA Art Car"
        description="Camp Alborz's flagship art car — a Persian mythical phoenix mobile sound stage at Burning Man."
        path="/art/homa"
      />
      {children}
    </>
  );
}
