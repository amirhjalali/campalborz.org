'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';

export function PageHero() {
  const { hero } = useContentConfig();

  return (
    <section className="relative min-h-hero overflow-hidden flex items-center justify-center">
      {/* Background Image - Full bleed hero with optimized loading */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.jpg"
          alt="Camp Alborz at sunset in Black Rock City"
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgICAQMFAAAAAAAAAAAAAQIDEQQFBgAhMRITQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwA/ALOp1+J2Z3t8dOZQGWNR6QD3/c8TxxyMDBw9llLJkIqxyEfqpB8n78cdlB//2Q=="
        />
        {/* Cinematic gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-85" />
        {/* Warm color grade overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-sage-900/10 mix-blend-overlay" />
      </div>

      {/* Mountain Silhouette */}
      <div className="mountain-silhouette z-[1]" />

      {/* Persian Pattern Overlay - subtle geometric texture */}
      <div className="absolute inset-0 pattern-persian opacity-10 z-[2]" />

      <div className="relative z-[5] section-contained flex flex-col items-center text-center gap-12 py-32 animate-fade-in">
        {/* Title + Subtitle - refined typography */}
        <div className="space-y-6">
          <h1
            className="text-display-thin text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] text-white leading-[0.9] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
          >
            {hero.title}
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-white/80 tracking-[0.3em] uppercase font-light font-body">
            {hero.subtitle}
          </p>
        </div>

        {/* CTA Buttons - refined spacing and hover states */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center mt-2">
          <Link
            href={hero.cta.primary.link}
            className="cta-primary cta-shimmer shadow-2xl text-base tracking-[0.15em]"
          >
            {hero.cta.primary.text}
            <ArrowRight size={18} className="ml-1" />
          </Link>
          <Link
            href={hero.cta.secondary.link}
            className="cta-secondary bg-white/20 backdrop-blur-md border-white/40 text-white hover:bg-white/30 hover:border-white/60 transition-all duration-300 text-base shadow-lg"
          >
            {hero.cta.secondary.text}
          </Link>
        </div>
      </div>
    </section>
  );
}
