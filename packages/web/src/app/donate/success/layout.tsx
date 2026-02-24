import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.donateSuccess;

export default function DonateSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
