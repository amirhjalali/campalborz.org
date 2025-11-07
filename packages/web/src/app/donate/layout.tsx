import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.donate;

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
