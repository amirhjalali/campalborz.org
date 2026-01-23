'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useContentConfig, useCampConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';

export function FeatureCards() {
  const { features } = useContentConfig();
  const campConfig = useCampConfig();

  return (
    <section className="section-base section-contained">
      <motion.div
        initial={{ y: 16 }}
        whileInView={{ y: 0 }}
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
          Explore the pillars of hospitality, art, and culture that define our community.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = getIcon(feature.icon);
          const isExternal = feature.link?.startsWith('http');

          const CardContent = (
            <motion.article
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-2xl bg-white border border-line/40 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              {feature.image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-gold/30 shadow-lg">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-display-thin text-xl text-ink mb-2">{feature.title}</h3>
                <p className="text-body-relaxed text-sm text-ink-soft mb-4">{feature.description}</p>

                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-gold group-hover:gap-3 transition-all duration-300">
                  {isExternal ? 'Listen' : 'Learn More'}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          );

          if (isExternal) {
            return (
              <a key={feature.title} href={feature.link} target="_blank" rel="noopener noreferrer" className="block">
                {CardContent}
              </a>
            );
          }

          return (
            <Link key={feature.title} href={feature.link || '#'} className="block">
              {CardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}