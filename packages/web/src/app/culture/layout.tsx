import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.culture;

export default function CultureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
