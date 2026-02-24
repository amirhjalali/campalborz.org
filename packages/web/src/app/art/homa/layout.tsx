import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata.artHoma;

export default function HomaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
