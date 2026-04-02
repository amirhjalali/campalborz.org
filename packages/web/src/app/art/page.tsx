'use client';

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, MapPin, Users, Eye, ExternalLink, Calendar, Flame, Layers, Palette, UsersRound } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef, useState } from 'react';

const artCarData = {
  homa: {
    label: 'ART CAR 001',
    tagline: 'Risen from the Ashes',
    image: '/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg',
    accent: 'var(--color-terracotta)',
    accentRgb: 'var(--color-terracotta-rgb)',
    year: '2023',
    myth: 'The mythological Homa Bird',
  },
  damavand: {
    label: 'ART CAR 002',
    tagline: 'Our Home on the Move',
    image: '/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg',
    accent: 'var(--color-gold)',
    accentRgb: 'var(--color-gold-rgb)',
    year: '2022',
    myth: 'The highest peak in the Alborz range',
  },
};

export default function ArtPage() {
  const { art } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!art) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Art page configuration not found</p>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero Section -- Dramatic full-bleed with parallax */}
      <section ref={heroRef} className="relative min-h-hero overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY, scale: backgroundScale }}
        >
          <Image
            src="/images/art_hero_pro.webp"
            alt="Persian-inspired art car on the Burning Man playa at golden hour, with Persian rugs, gathering people, and a dramatic sunset sky"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            placeholder="empty"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-cream), transparent 40%, transparent)' }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-15 z-[1]" />

        <motion.div
          className="relative z-10 section-contained text-center py-24"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            OUR CREATIONS
          </motion.p>
          <motion.h1
            className="font-display text-optical-h1 tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {art.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {art.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />

          {/* Scroll indicator */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 mx-auto rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/60"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Art Categories -- Horizontal ribbon */}
      <section className="py-20 md:py-28">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <p className="text-eyebrow">OUR WORK</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-ink)' }}>
                Art Categories
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {art.categories.map((category, index) => {
              const CategoryIcon = getIcon(category.icon);
              return (
                <Reveal key={category.name} delay={index * 0.1}>
                  <div className="luxury-card text-center group">
                    <div
                      className="inline-flex p-4 rounded-full border mb-5 transition-all duration-500 group-hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(var(--color-gold-rgb),0.1)',
                        borderColor: 'rgba(var(--color-gold-rgb),0.2)',
                      }}
                    >
                      <CategoryIcon className="h-6 w-6 transition-colors duration-300" style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <h3 className="font-display text-lg mb-2">{category.name}</h3>
                    <p className="text-3xl font-display mb-1" style={{ color: 'var(--color-gold)' }}>
                      {category.count}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-ink-soft)' }}>
                      Projects
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Featured Art Cars -- Full-width immersive cards */}
      <section className="section-contrast">
        <div className="py-24 md:py-32">
          <div className="section-contained mb-16">
            <Reveal>
              <div className="text-center space-y-6">
                <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                  SIGNATURE MACHINES
                </p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-cream)' }}>
                  Featured Art Cars
                </h2>
                <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'rgba(var(--color-cream-rgb),0.7)' }}>
                  Two beasts born from Persian mythology, built by community, and set free on the playa
                </p>
              </div>
            </Reveal>
          </div>

          {/* HOMA -- Full-width showcase */}
          {art.installations.slice(0, 2).map((installation, index) => {
            const slug = installation.slug || '';
            const data = artCarData[slug as keyof typeof artCarData];
            if (!data) return null;

            const isEven = index % 2 === 0;

            return (
              <Reveal key={installation.id} delay={0.1}>
                <div className={`relative overflow-hidden ${index > 0 ? 'mt-4' : ''}`}>
                  {/* Full-width background image */}
                  <div className="relative aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1]">
                    <Image
                      src={data.image}
                      alt={`${installation.title} art car by ${installation.artist}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isEven
                          ? 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)'
                          : 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)',
                      }}
                    />

                    {/* Content overlay */}
                    <div className={`absolute inset-0 flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                      <div className={`section-contained w-full`}>
                        <div className={`max-w-xl ${isEven ? '' : 'ml-auto'}`}>
                          <p className="text-eyebrow mb-3" style={{ color: data.accent }}>
                            {data.label}
                          </p>
                          <h3
                            className="font-display text-4xl md:text-5xl lg:text-6xl mb-3 tracking-tight"
                            style={{ color: 'var(--color-cream)' }}
                          >
                            {installation.title.split(' ')[0]}
                          </h3>
                          <p
                            className="font-accent text-base md:text-lg italic mb-4"
                            style={{ color: 'rgba(var(--color-cream-rgb),0.8)' }}
                          >
                            {data.tagline}
                          </p>
                          <p
                            className="text-sm md:text-base leading-relaxed mb-6 max-w-md hidden md:block"
                            style={{ color: 'rgba(var(--color-cream-rgb),0.7)' }}
                          >
                            {installation.description.slice(0, 160)}...
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest" style={{ color: 'rgba(var(--color-cream-rgb),0.5)' }}>
                              <Calendar className="h-3.5 w-3.5" style={{ color: data.accent }} aria-hidden="true" />
                              Since {data.year}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest" style={{ color: 'rgba(var(--color-cream-rgb),0.5)' }}>
                              <MapPin className="h-3.5 w-3.5" style={{ color: data.accent }} aria-hidden="true" />
                              {installation.location}
                            </span>
                          </div>

                          <Link
                            href={`/art/${slug}`}
                            className="cta-primary inline-flex items-center gap-2"
                            style={{ backgroundColor: 'transparent', border: '1px solid rgba(var(--color-cream-rgb),0.3)' }}
                          >
                            <span className="flex items-center gap-2">
                              Explore {installation.title.split(' ')[0]}
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}

          {/* Future Project Card */}
          {art.installations.length > 2 && (
            <div className="section-contained mt-12">
              <Reveal delay={0.2}>
                <div
                  className="luxury-card text-center py-12"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>COMING SOON</p>
                  <h3 className="font-display text-2xl md:text-3xl mb-3" style={{ color: 'var(--color-cream)' }}>
                    {art.installations[2].title}
                  </h3>
                  <p className="font-accent text-base italic mb-4" style={{ color: 'rgba(var(--color-cream-rgb),0.6)' }}>
                    {art.installations[2].artist}
                  </p>
                  <p className="text-body-relaxed text-sm max-w-xl mx-auto" style={{ color: 'rgba(var(--color-cream-rgb),0.6)' }}>
                    {art.installations[2].description}
                  </p>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Collaborations */}
      {art.collaborations && art.collaborations.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <Reveal>
              <div className="text-center space-y-4 mb-16">
                <p className="text-eyebrow">PARTNERSHIPS</p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-ink)' }}>
                  Collaborations & Sponsored Projects
                </h2>
                <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  Art we have helped finance, transport, or host through the Camp Alborz network
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {art.collaborations.map((collab, index) => (
                <Reveal key={collab.title} delay={index * 0.12}>
                  <div className="luxury-card group h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-xs flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-gold)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="text-eyebrow">{collab.year || 'Ongoing'}</span>
                      </div>
                    </div>
                    <h3 className="font-display text-xl mb-2">{collab.title}</h3>
                    <p className="text-xs mb-3 font-body" style={{ color: 'var(--color-gold)' }}>
                      {collab.partners}
                    </p>
                    <p className="text-body-relaxed text-sm mb-4 flex-1" style={{ color: 'var(--color-ink-soft)' }}>
                      {collab.description}
                    </p>
                    {collab.link && (
                      <Link
                        href={collab.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm transition-colors group-hover:gap-3"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        Learn more
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Creative Process Timeline -- Vertical stepped layout */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="section-contained">
          <Reveal direction="left">
            <div className="space-y-4 mb-16">
              <p className="text-eyebrow">FROM CONCEPT TO PLAYA</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-ink)' }}>
                Our Creative Process
              </h2>
              <p className="font-accent text-lg max-w-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                How we bring art to life together
              </p>
            </div>
          </Reveal>

          {/* Timeline with connecting line */}
          <div className="relative">
            {/* Vertical line (hidden on mobile) */}
            <div
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ backgroundColor: 'rgba(var(--color-gold-rgb),0.2)' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { phase: 'Ideation', time: 'Nov -- Dec', description: 'Community brainstorming sessions and concept development. Ideas flow from Persian heritage, playa dreams, and collective vision.', icon: '01' },
                { phase: 'Design', time: 'Jan -- Feb', description: 'Detailed engineering plans, 3D modeling, and material sourcing. Every weld, every LED, every curve mapped out.', icon: '02' },
                { phase: 'Fundraising', time: 'Feb -- Mar', description: 'Community events, donor outreach, and grant applications to secure the materials and funding we need.', icon: '03' },
                { phase: 'Build Season', time: 'Apr -- Jul', description: 'The garage doors open. Collaborative construction workshops every weekend, sparks flying, music playing.', icon: '04' },
                { phase: 'Installation', time: 'August', description: 'We caravan to the playa, assemble our vision under the open sky, and bring it to life in the dust.', icon: '05' },
                { phase: 'Legacy', time: 'Sep -- Oct', description: 'Documentation, storytelling, and planning for next year. Every project feeds the next one.', icon: '06' },
              ].map((phase, index) => (
                <Reveal key={phase.phase} delay={index * 0.1}>
                  <div className="luxury-card h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-sm flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-gold)' }}
                      >
                        {phase.icon}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-display text-lg leading-tight">{phase.phase}</h3>
                        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--color-gold)' }}>
                          <Calendar className="h-3 w-3" />
                          {phase.time}
                        </div>
                      </div>
                    </div>
                    <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                      {phase.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* CTA Section */}
      <Reveal>
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <div className="frame-panel text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 pattern-persian opacity-5" />
              <div className="relative z-10">
                <p className="text-eyebrow">JOIN THE MOVEMENT</p>
                <h2 className="font-accent text-2xl md:text-3xl tracking-wide mt-4" style={{ color: 'var(--color-ink)' }}>
                  Create Art With Us
                </h2>
                <p className="text-body-relaxed text-base max-w-2xl mx-auto mt-4" style={{ color: 'var(--color-ink-soft)' }}>
                  Whether you are an experienced artist or just curious about creating, there is a place for you in our artistic community. Every hand that touches the build becomes part of the story.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link href="/donate" className="cta-primary cta-shimmer">
                    <span>Support Our Art</span>
                  </Link>
                  <Link href="/apply" className="cta-secondary">
                    <span>Apply to Join</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
