import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.about;

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'About', path: '/about' }]} />
      <WebPageStructuredData
        name="About Camp Alborz"
        description="Learn about Camp Alborz, a 501(c)(3) nonprofit celebrating Persian culture at Burning Man since 2008."
        path="/about"
      />
      {children}
    </>
  );
}
