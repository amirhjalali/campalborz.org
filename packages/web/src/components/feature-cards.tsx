'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';

export function FeatureCards() {
  const { features } = useContentConfig();
  const campConfig = useCampConfig();
  return (
    <section className="py-24 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-burnt-sienna mb-4">
            Discover {campConfig.name}
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Explore the many facets of our community and find your place in our story
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon);
            const gradient = feature.gradient || 'from-burnt-sienna to-antique-gold';

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={feature.link}>
                  <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    {/* Card content */}
                    <div className="relative p-8">
                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-desert-night mb-3 group-hover:text-burnt-sienna transition-colors">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        {feature.description}
                      </p>

                      {/* Link with arrow */}
                      <div className="flex items-center text-burnt-sienna font-semibold">
                        <span>Learn More</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                      </div>
                    </div>

                    {/* Bottom border gradient */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}