import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.artDamavand;

export default function DamavandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
