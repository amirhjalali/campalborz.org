import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.search;

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
