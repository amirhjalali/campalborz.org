import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.art;

export default function ArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
