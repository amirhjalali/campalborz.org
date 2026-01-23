'use client';

import { motion, useInView } from 'framer-motion';
import { useContentConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';
import { useRef, useEffect, useState } from 'react';

function AnimatedNumber({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part and suffix
    const match = value.match(/^([0-9.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const numericPart = parseFloat(match[1]);
    const suffix = match[2] || '';
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      const current = numericPart * easeProgress;
      const formatted = numericPart >= 100 ? Math.floor(current) : current.toFixed(numericPart % 1 !== 0 ? 1 : 0);

      setDisplayValue(`${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animate();
  }, [isInView, value, duration]);

  return <div ref={ref}>{displayValue}</div>;
}

export function Stats() {
  const { stats } = useContentConfig();
  return (
    <section className="section-alt">
      <div className="section-contained space-y-14">
        <motion.div
          initial={{ y: 16 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
            LEGACY & IMPACT
          </p>
          <h2 className="text-display-thin text-3xl md:text-4xl">In Numbers</h2>
          <p className="text-body-relaxed text-base md:text-lg text-ink-soft mx-auto max-w-2xl">
            Each metric reflects our commitment to building community through art, culture, and hospitality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = getIcon(stat.icon);

            return (
              <motion.article
                key={stat.label}
                initial={{ y: 20, scale: 0.97 }}
                whileInView={{ y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="luxury-card group cursor-default"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/10 to-gold/5 text-gold group-hover:border-gold/50 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <div className="text-display-thin text-4xl text-gold">
                    <AnimatedNumber value={stat.value} />
                  </div>
                </div>

                <h3 className="mt-6 text-display-wide text-xs tracking-[0.4em] text-ink-soft">
                  {stat.label}
                </h3>

                {stat.description && (
                  <p className="mt-3 text-body-relaxed text-sm text-ink-soft/90">
                    {stat.description}
                  </p>
                )}
              </motion.article>
            );
          })}
        </div>

        <div className="text-center">
          <a href="/donate" className="cta-primary inline-flex">
            Support Our Mission
          </a>
        </div>
      </div>
    </section>
  );
}