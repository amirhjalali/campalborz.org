'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useContentConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';
import { useRef, useEffect } from 'react';

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  // Extract numeric part and suffix
  const match = value.match(/^([0-9.]+)(.*)$/);
  const numericPart = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const hasDecimal = numericPart % 1 !== 0;

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 1.5,
  });

  const displayValue = useTransform(springValue, (current) => {
    if (numericPart >= 100) {
      return Math.floor(current);
    }
    return hasDecimal ? current.toFixed(1) : Math.floor(current);
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(numericPart);
    }
  }, [isInView, numericPart, springValue]);

  if (!match) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

export function Stats() {
  const { stats } = useContentConfig();
  return (
    <section className="section-alt">
      <div className="section-contained space-y-14">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="text-display-wide text-xs tracking-[0.3em] text-ink-soft/80">
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
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="luxury-card group cursor-default"
              >
                <div className="flex items-center gap-5">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/10 to-gold/5 text-gold group-hover:border-gold/50 transition-colors duration-300"
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="text-stat-number text-4xl md:text-5xl text-gold tracking-tight">
                    <AnimatedNumber value={stat.value} />
                  </div>
                </div>

                <h3 className="mt-6 text-display-wide text-xs tracking-[0.25em] text-ink-soft">
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
      </div>
    </section>
  );
}
