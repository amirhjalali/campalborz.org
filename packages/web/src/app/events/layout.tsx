import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbStructuredData, CollectionPageStructuredData } from '@/components/structured-data';

export const metadata = pageMetadata.events;

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: 'Events', path: '/events' }]} />
      <CollectionPageStructuredData
        name="Events"
        description="Persian music nights, DJ sets, cultural workshops, fundraisers, and Burning Man gatherings."
        path="/events"
      />
      {children}
    </>
  );
}
