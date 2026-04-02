import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.donateSuccess;

export default function DonateSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Donate', path: '/donate' },
          { name: 'Thank You', path: '/donate/success' },
        ]}
      />
      {children}
    </>
  );
}
