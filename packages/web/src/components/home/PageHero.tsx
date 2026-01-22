'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { useRef } from 'react';

export function PageHero() {
  const { hero } = useContentConfig();
  const campConfig = useCampConfig();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <Image
          src="/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.jpg"
          alt="Camp Alborz"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-80" />
      </motion.div>

      {/* Persian Pattern Overlay */}
      <div className="absolute inset-0 pattern-persian opacity-30 z-[1]" />

      <motion.div
        className="relative z-10 section-contained flex flex-col items-center text-center gap-8 py-24"
        style={{ y: textY, opacity }}
      >
        {/* Badge */}
        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-2.5 text-xs font-semibold tracking-[0.5em] text-white/90 uppercase shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles size={16} className="text-gold" />
          {campConfig.tagline}
        </motion.span>

        {/* Main Title */}
        <div className="space-y-6">
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
          >
            {hero.title}
          </motion.h1>

          <motion.p
            className="text-display-wide text-sm text-white/80 tracking-[0.5em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {hero.subtitle}
          </motion.p>

          <motion.p
            className="mx-auto max-w-3xl text-body-relaxed text-lg text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {hero.description}
          </motion.p>
        </div>

        {/* Ornate Divider */}
        <motion.div
          className="ornate-divider"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ filter: 'brightness(1.5)' }}
        />

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Link href={hero.cta.primary.link} className="cta-primary shadow-2xl">
            {hero.cta.primary.text}
            <ArrowRight size={18} />
          </Link>
          <Link href={hero.cta.secondary.link} className="cta-secondary bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
            {hero.cta.secondary.text}
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  );
}

