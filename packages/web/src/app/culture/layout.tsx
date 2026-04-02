import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.culture;

export default function CultureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'Persian Culture', path: '/culture' }]} />
      <WebPageStructuredData
        name="Persian Culture"
        description="Discover Persian culture through Camp Alborz: poetry, calligraphy, cuisine, music, and living heritage."
        path="/culture"
      />
      {children}
    </>
  );
}
