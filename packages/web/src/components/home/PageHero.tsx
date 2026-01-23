'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';

export function PageHero() {
  const { hero } = useContentConfig();
  const campConfig = useCampConfig();

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

      {/* Persian Pattern Overlay */}
      <div className="absolute inset-0 pattern-persian opacity-30 z-[1]" />

      <div className="relative z-10 section-contained flex flex-col items-center text-center gap-8 py-24 animate-fade-in">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-2.5 text-xs font-semibold tracking-[0.5em] text-white/90 uppercase shadow-lg">
          {campConfig.tagline}
        </span>

        {/* Main Title */}
        <div className="space-y-6">
          <h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
          >
            {hero.title}
          </h1>

          <p className="text-display-wide text-sm text-white/80 tracking-[0.5em]">
            {hero.subtitle}
          </p>

          <p className="mx-auto max-w-3xl text-body-relaxed text-lg text-white/90">
            {hero.description}
          </p>
        </div>

        {/* Ornate Divider */}
        <div className="ornate-divider" style={{ filter: 'brightness(1.5)' }} />

        {/* CTA Buttons */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center">
          <Link href={hero.cta.primary.link} className="cta-primary shadow-2xl">
            {hero.cta.primary.text}
            <ArrowRight size={18} />
          </Link>
          <Link href={hero.cta.secondary.link} className="cta-secondary bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
            {hero.cta.secondary.text}
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  );
}
