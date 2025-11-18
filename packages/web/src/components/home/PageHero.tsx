'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';

export function PageHero() {
  const { hero } = useContentConfig();
  const campConfig = useCampConfig();

  return (
    <section className="relative overflow-hidden section-base pattern-persian">
      <div
        className="absolute inset-0 opacity-95"
        style={{ backgroundImage: 'var(--gradient-hero)' }}
        aria-hidden="true"
      />

      <motion.div
        className="relative section-contained flex flex-col items-center text-center gap-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-5 py-2 text-xs font-semibold tracking-[0.5em] text-ink-soft uppercase">
          <Sparkles size={16} />
          {campConfig.tagline}
        </span>

        <div className="space-y-6">
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-shadow-soft"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
          >
            {hero.title}
          </motion.h1>

          <p className="text-display-wide text-sm text-ink-soft/80 tracking-[0.6em]">
            {hero.subtitle}
          </p>

          <p className="mx-auto max-w-3xl text-body-relaxed text-lg text-ink-soft">
            {hero.description}
          </p>
        </div>

        <div className="ornate-divider" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center">
          <Link href={hero.cta.primary.link} className="cta-primary">
            {hero.cta.primary.text}
            <ArrowRight size={18} />
          </Link>
          <Link href={hero.cta.secondary.link} className="cta-secondary">
            {hero.cta.secondary.text}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

