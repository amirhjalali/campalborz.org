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
          <p className="text-lg text-desert-night/70 max-w-2xl mx-auto font-body">
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={feature.link}>
                  <div className="group relative bg-warm-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(160,82,45,0.08),0_8px_40px_rgba(212,175,55,0.06)] border border-dust-khaki/20 backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(160,82,45,0.12),0_12px_50px_rgba(212,175,55,0.08)] hover:border-antique-gold/40 transition-all duration-500 h-full">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />

                    {/* Card content */}
                    <div className="relative p-8">
                      {/* Icon */}
                      <motion.div
                        className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-6`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-desert-night mb-3 group-hover:text-burnt-sienna transition-colors">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-desert-night/70 mb-4 font-body">
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