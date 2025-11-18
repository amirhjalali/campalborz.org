'use client';

import { motion } from 'framer-motion';
import { useContentConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';

export function Stats() {
  const { stats } = useContentConfig();
  return (
    <section className="section-alt">
      <div className="section-contained space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
            LEGACY & IMPACT
          </p>
          <h2 className="text-display-thin text-3xl md:text-4xl">In Numbers</h2>
          <p className="text-body-relaxed text-base md:text-lg text-ink-soft mx-auto max-w-2xl">
            Each metric is a promise kept to our community—evidence of the bridges we are
            building.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = getIcon(stat.icon);

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="luxury-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-ink">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-display-thin text-3xl">{stat.value}</div>
                </div>

                <h3 className="mt-6 text-display-wide text-xs tracking-[0.4em] text-ink-soft">
                  {stat.label}
                </h3>

                {stat.description && (
                  <p className="mt-3 text-body-relaxed text-sm text-ink-soft/80">
                    {stat.description}
                  </p>
                )}
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <a href="/join" className="cta-primary inline-flex">
            Join Our Community
          </a>
        </motion.div>
      </div>
    </section>
  );
}