'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';

export function PageHero() {
  const { hero } = useContentConfig();

  return (
    <section className="relative min-h-hero overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
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
      </div>

      {/* Mountain Silhouette */}
      <div className="mountain-silhouette z-[1]" />

      {/* Persian Pattern Overlay - subtle */}
      <div className="absolute inset-0 pattern-persian opacity-15 z-[2]" />

      <div className="relative z-[5] section-contained flex flex-col items-center text-center gap-10 py-32 animate-fade-in">
        {/* Title + Subtitle */}
        <div className="space-y-4">
          <h1
            className="text-display-thin text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white drop-shadow-lg"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
          >
            {hero.title}
          </h1>

          <p className="text-display-wide text-sm md:text-base text-white/70 tracking-[0.4em]">
            {hero.subtitle}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center mt-4">
          <Link href={hero.cta.primary.link} className="cta-primary shadow-2xl">
            {hero.cta.primary.text}
            <ArrowRight size={18} />
          </Link>
          <Link href={hero.cta.secondary.link} className="cta-secondary bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
            {hero.cta.secondary.text}
          </Link>
        </div>
      </div>
    </section>
  );
}
