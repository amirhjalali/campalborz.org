'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useContentConfig } from '../../hooks/useConfig';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function PageHero() {
  const { hero } = useContentConfig();
  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -40]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-hero overflow-hidden flex items-center justify-center"
    >
      {/* Background Image with parallax scale and movement */}
      <motion.div
        className="absolute inset-0 -top-[12%] -bottom-[12%] z-0"
        style={
          prefersReducedMotion
            ? {}
            : { scale: imageScale, y: imageY }
        }
      >
        <Image
          src="/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.jpg"
          alt="Camp Alborz at sunset in Black Rock City"
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgICAQMFAAAAAAAAAAAAAQIDEQQFBgAhMRITQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQIEAwA/ALOp1+J2Z3t8dOZQGWNR6QD3/c8TxxyMDBw9llLJkIqxyEfqpB8n78cdlB//2Q=="
        />
      </motion.div>

      {/* Layered gradient overlays for depth */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 60%, rgba(250,247,240,0.85) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px rgba(0,0,0,0.15)',
        }}
      />

      {/* Mountain Silhouette */}
      <div className="mountain-silhouette z-[3]" />

      {/* Main content with scroll-linked opacity */}
      <motion.div
        className="relative z-[5] section-contained flex flex-col items-center text-center gap-10 py-32"
        style={
          prefersReducedMotion
            ? {}
            : { opacity: contentOpacity, y: contentY }
        }
      >
        {/* Decorative top accent */}
        <motion.div
          className="ornate-divider"
          initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: easeOutExpo }}
        >
          <span
            className="text-xs tracking-[0.4em] uppercase"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            &#10022;
          </span>
        </motion.div>

        {/* Title + Subtitle */}
        <div className="space-y-6">
          <motion.h1
            className="text-display-thin text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] text-white leading-[0.9] drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: easeOutExpo }}
          >
            {hero.title}
          </motion.h1>

          <motion.p
            className="text-sm md:text-base lg:text-lg text-white/75 tracking-[0.3em] uppercase font-light font-body"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: easeOutExpo }}
          >
            {hero.subtitle}
          </motion.p>
        </div>

        {/* Description line - added for context */}
        <motion.p
          className="text-[15px] md:text-base leading-[1.85] text-white/65 max-w-md"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: easeOutExpo }}
        >
          {hero.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center mt-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1, ease: easeOutExpo }}
        >
          <Link
            href={hero.cta.primary.link}
            className="cta-primary cta-shimmer shadow-2xl text-base tracking-[0.15em]"
            style={{ backgroundColor: 'white', color: '#1a1a18', borderColor: 'white' }}
          >
            <span>{hero.cta.primary.text}</span>
            <ArrowRight size={18} className="ml-1" />
          </Link>
          <Link
            href={hero.cta.secondary.link}
            className="cta-secondary bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 hover:border-white/50 transition-all duration-300 text-base shadow-lg"
          >
            <span>{hero.cta.secondary.text}</span>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/45">
            Scroll
          </span>
          <motion.div
            className="w-px h-8 bg-white/35 origin-top"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
