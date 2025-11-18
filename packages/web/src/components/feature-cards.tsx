'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';
import { LuxuryCard } from './home/LuxuryCard';

export function FeatureCards() {
  const { features } = useContentConfig();
  const campConfig = useCampConfig();

  return (
    <section className="section-base section-contained">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-14"
      >
        <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
          CAMP OFFERINGS
        </p>
        <h2 className="text-display-thin text-3xl md:text-4xl">
          Discover {campConfig.name}
        </h2>
        <p className="text-body-relaxed text-base md:text-lg text-ink-soft mx-auto max-w-2xl">
          Explore the pillars of hospitality, art, and culture that define our oasis on
          playa.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = getIcon(feature.icon);
          const accent = index % 2 === 0 ? 'gold' : 'sage';

          return (
            <LuxuryCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={<Icon className="h-6 w-6 text-ink" />}
              accent={accent}
              href={feature.link}
            >
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase text-ink-soft">
                Learn More
                <ArrowRight size={16} />
              </div>
            </LuxuryCard>
          );
        })}
      </div>
    </section>
  );
}