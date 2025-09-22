import { Navigation } from '@/components/navigation';
import { Hero } from '@/components/hero';
import { Stats } from '@/components/stats';
import { FeatureCards } from '@/components/feature-cards';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Stats />
        <FeatureCards />
      </main>
    </>
  );
}