import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, WebPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.donate;

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'Donate', path: '/donate' }]} />
      <WebPageStructuredData
        name="Donate to Camp Alborz"
        description="Support Camp Alborz, a 501(c)(3) nonprofit. Tax-deductible donations fund art cars, events, and Persian arts programming."
        path="/donate"
      />
      {children}
    </>
  );
}
