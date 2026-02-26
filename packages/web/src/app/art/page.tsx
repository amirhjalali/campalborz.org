'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, MapPin, Users, Eye, ExternalLink, Calendar } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef } from 'react';

export default function ArtPage() {
  const { art } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
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
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent opacity-90" style={{ background: `linear-gradient(to top, var(--color-cream), transparent, transparent)` }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 section-contained text-center py-24"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            OUR CREATIONS
          </motion.p>
          <motion.h1
            className="text-optical-h1 tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {art.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {art.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>

      </section>

      {/* Art Categories */}
      <section className="py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">
                OUR WORK
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Art Categories
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {art.categories.map((category, index) => {
              const CategoryIcon = getIcon(category.icon);

              return (
                <Reveal key={category.name} delay={index * 0.1}>
                  <div
                    className="luxury-card text-center"
                  >
                    <div className="inline-flex p-4 rounded-full border mb-5" style={{ backgroundColor: 'rgba(var(--color-gold-rgb),0.15)', borderColor: 'rgba(var(--color-gold-rgb),0.25)' }}>
                      <CategoryIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <h3 className="text-display-thin text-lg mb-2">{category.name}</h3>
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

      {/* Featured Art Cars */}
      <section className="section-contrast">
        <div className="section-contained py-24 md:py-32">
          <Reveal>
            <div className="text-center space-y-6 mb-14">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                OUR CREATIONS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Featured Art Cars
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'rgba(var(--color-cream-rgb),0.8)' }}>
                Our signature artistic contributions to Black Rock City
              </p>
            </div>
          </Reveal>

          <div className="space-y-12">
            {art.installations.map((installation, index) => {
              const detailUrl = installation.slug ? `/art/${installation.slug}` : null;
              const artCarLabel = installation.slug === 'homa' ? 'ART CAR 001' : installation.slug === 'damavand' ? 'ART CAR 002' : `ART CAR ${String(index + 1).padStart(3, '0')}`;

              return (
                <Reveal key={installation.id} delay={index * 0.15} direction={index % 2 === 0 ? 'left' : 'right'}>
                  <div className="luxury-card" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex flex-col lg:flex-row gap-8">
                      {installation.slug && (
                        <div className="lg:w-1/2 flex-shrink-0">
                          <Link href={`/art/${installation.slug}`}>
                            <div className="image-frame image-grain image-hover-zoom relative aspect-[4/3]">
                              <Image
                                src={installation.slug === 'homa'
                                  ? '/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg'
                                  : '/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg'
                                }
                                alt={`${installation.title} art car by ${installation.artist}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                              />
                            </div>
                          </Link>
                        </div>
                      )}

                      <div className="flex-1 space-y-5">
                        <div>
                          <p className="text-eyebrow mb-2" style={{ color: 'var(--color-gold-muted)' }}>
                            {artCarLabel}
                          </p>
                          <h3 className="font-display text-3xl md:text-4xl mb-2" style={{ color: 'var(--color-cream)' }}>
                            {detailUrl ? (
                              <Link href={detailUrl} className="transition-colors" style={{ color: 'var(--color-cream)' }}>
                                {installation.title}
                              </Link>
                            ) : (
                              installation.title
                            )}
                          </h3>
                          <p className="font-accent text-base italic" style={{ color: 'var(--color-gold-muted)' }}>
                            {installation.artist}
                          </p>
                        </div>

                        <p className="text-body-relaxed" style={{ color: 'rgba(var(--color-cream-rgb),0.8)' }}>
                          {installation.description}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm" style={{ color: 'rgba(var(--color-cream-rgb),0.6)' }}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                            {installation.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                            {installation.participants}
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                            {installation.impact}
                          </div>
                        </div>

                        {detailUrl && (
                          <Link
                            href={detailUrl}
                            className="cta-primary inline-flex items-center gap-2"
                          >
                            <span className="flex items-center gap-2">
                              Explore {installation.title.split(' ')[0]}
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Collaborations */}
      {art.collaborations && art.collaborations.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <Reveal>
              <div className="text-center space-y-4 mb-14">
                <p className="text-eyebrow">PARTNERSHIPS</p>
                <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                  Collaborations & Sponsored Projects
                </h2>
                <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  Art we've helped finance, transport, or host through the Camp Alborz network
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {art.collaborations.map((collab, index) => (
                <Reveal key={collab.title} delay={index * 0.1} direction={index % 2 === 0 ? 'up' : 'right'}>
                  <div
                    className="luxury-card"
                  >
                    <span className="text-eyebrow">
                      {collab.year || 'Ongoing'}
                    </span>
                    <h3 className="text-display-thin text-xl mt-2 mb-3">
                      {collab.title}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-gold)' }}>
                      {collab.partners}
                    </p>
                    <p className="text-body-relaxed text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                      {collab.description}
                    </p>
                    {collab.link && (
                      <Link
                        href={collab.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm transition-colors"
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

      {/* Creative Process Timeline */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="section-contained">
          <Reveal direction="left">
            <div className="space-y-4 mb-14">
              <p className="text-eyebrow">
                FROM CONCEPT TO PLAYA
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Our Creative Process
              </h2>
              <p className="font-accent text-lg max-w-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                How we bring art to life together
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { phase: 'Ideation', time: 'Nov-Dec', description: 'Community brainstorming and concept development' },
              { phase: 'Design', time: 'Jan-Feb', description: 'Detailed planning and 3D modeling' },
              { phase: 'Fundraising', time: 'Feb-Mar', description: 'Securing materials and funding' },
              { phase: 'Build Season', time: 'Apr-Jul', description: 'Collaborative construction workshops' },
              { phase: 'Installation', time: 'August', description: 'Setting up on the playa' },
              { phase: 'Legacy', time: 'Sep-Oct', description: 'Documentation and future planning' },
            ].map((phase, index) => (
              <Reveal key={phase.phase} delay={index * 0.08}>
                <div className="luxury-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-sm" style={{ backgroundColor: 'var(--color-gold)' }}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-display-thin text-lg">{phase.phase}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold)' }}>
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
      </section>

      <div className="ornate-divider" />

      {/* CTA Section */}
      <Reveal>
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <div className="frame-panel text-center space-y-6">
              <p className="text-eyebrow">JOIN THE MOVEMENT</p>
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Create Art With Us
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Whether you are an experienced artist or just curious about creating, there is a place for you in our artistic community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/apply" className="cta-primary">
                  <span>Apply to Join</span>
                </Link>
                <Link href="/events" className="cta-secondary">
                  <span>See Art Events</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
