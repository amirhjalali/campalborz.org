'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight, ChevronDown, MapPin, Users, Eye, ExternalLink, Calendar } from 'lucide-react';
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
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Art page configuration not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="bg-cream">
        {/* Hero Section with Parallax */}
        <section ref={heroRef} className="relative min-h-[70vh] overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: backgroundY }}
          >
            <Image
              src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
              alt="Camp Alborz Art"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
          </motion.div>

          <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

          <motion.div
            className="relative z-10 section-contained text-center py-24"
            style={{ y: textY, opacity }}
          >
            <motion.p
              className="text-display-wide text-xs tracking-[0.5em] text-white/80 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              CREATIVE EXPRESSION
            </motion.p>
            <motion.h1
              className="text-display-thin text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              {art.title}
            </motion.h1>
            <motion.p
              className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {art.subtitle}
            </motion.p>

            <motion.div
              className="ornate-divider mt-8"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ filter: 'brightness(1.5)' }}
            />
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-8 h-8 text-white/60" />
          </motion.div>
        </section>

        {/* Art Categories */}
        <section className="section-base section-contained">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-14"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
              OUR WORK
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              Art Categories
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {art.categories.map((category, index) => {
              const CategoryIcon = getIcon(category.icon);

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card text-center"
                >
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-5">
                    <CategoryIcon className="h-6 w-6 text-gold-500" />
                  </div>
                  <h3 className="text-display-thin text-lg mb-2">{category.name}</h3>
                  <p className="text-3xl font-display text-gold-600 mb-1">
                    {category.count}
                  </p>
                  <p className="text-xs text-ink-soft uppercase tracking-[0.2em]">
                    Projects
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Featured Art Cars */}
        <section className="section-contrast">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                MOBILE ART
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Featured Installations
              </h2>
              <p className="text-body-relaxed text-base text-tan-light/80 max-w-2xl mx-auto">
                Our signature artistic contributions to Black Rock City
              </p>
            </motion.div>

            <div className="space-y-8">
              {art.installations.map((installation, index) => {
                const detailUrl = installation.slug ? `/art/${installation.slug}` : null;

                return (
                  <motion.div
                    key={installation.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Image placeholder for art car */}
                      {installation.slug && (
                        <div className="lg:w-1/3 flex-shrink-0">
                          <div className="relative aspect-video rounded-xl overflow-hidden">
                            <Image
                              src={installation.slug === 'homa'
                                ? '/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg'
                                : '/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg'
                              }
                              alt={installation.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 space-y-5">
                        <div>
                          <span className="text-xs text-gold-400 tracking-[0.2em] uppercase">
                            {installation.year}
                          </span>
                          <h3 className="text-display-thin text-2xl text-tan-light mt-1">
                            {detailUrl ? (
                              <Link href={detailUrl} className="hover:text-gold-400 transition-colors">
                                {installation.title}
                              </Link>
                            ) : (
                              installation.title
                            )}
                          </h3>
                          <p className="text-sm text-gold-400/80 mt-1">
                            {installation.artist}
                          </p>
                        </div>

                        <p className="text-body-relaxed text-tan-light/80">
                          {installation.description}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-tan-light/60">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gold-500/70" />
                            {installation.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gold-500/70" />
                            {installation.participants}
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gold-500/70" />
                            {installation.impact}
                          </div>
                        </div>

                        {detailUrl && (
                          <Link
                            href={detailUrl}
                            className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                          >
                            Learn More
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Collaborations */}
        {art.collaborations && art.collaborations.length > 0 && (
          <section className="section-base">
            <div className="section-contained">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 mb-14"
              >
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
                  COMMUNITY PARTNERSHIPS
                </p>
                <h2 className="text-display-thin text-3xl md:text-4xl">
                  Collaborations & Sponsored Projects
                </h2>
                <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                  Art we've helped finance, transport, or host through the Camp Alborz network
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {art.collaborations.map((collab, index) => (
                  <motion.div
                    key={collab.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="luxury-card"
                  >
                    <span className="text-xs text-gold-600 tracking-[0.2em] uppercase">
                      {collab.year || 'Ongoing'}
                    </span>
                    <h3 className="text-display-thin text-xl mt-2 mb-3">
                      {collab.title}
                    </h3>
                    <p className="text-xs text-gold-600/80 mb-4">
                      {collab.partners}
                    </p>
                    <p className="text-body-relaxed text-sm text-ink-soft mb-4">
                      {collab.description}
                    </p>
                    {collab.link && (
                      <Link
                        href={collab.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-500 transition-colors"
                      >
                        Learn more
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Creative Process Timeline */}
        <section className="section-alt">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
                FROM CONCEPT TO PLAYA
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Our Creative Process
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                How we bring art to life together
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { phase: 'Ideation', time: 'Nov-Dec', description: 'Community brainstorming and concept development' },
                { phase: 'Design', time: 'Jan-Feb', description: 'Detailed planning and 3D modeling' },
                { phase: 'Fundraising', time: 'Feb-Mar', description: 'Securing materials and funding' },
                { phase: 'Build Season', time: 'Apr-Jul', description: 'Collaborative construction workshops' },
                { phase: 'Installation', time: 'August', description: 'Setting up on the playa' },
                { phase: 'Legacy', time: 'Sep-Oct', description: 'Documentation and future planning' },
              ].map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-display text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-display-thin text-lg">{phase.phase}</h3>
                      <div className="flex items-center gap-2 text-xs text-gold-600">
                        <Calendar className="h-3 w-3" />
                        {phase.time}
                      </div>
                    </div>
                  </div>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {phase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel text-center space-y-8"
            >
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Create Art With Us
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Whether you're an experienced artist or just curious about creating, there's a place for you in our artistic community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply" className="cta-primary">
                  Join Our Artists
                  <ArrowRight size={18} />
                </Link>
                <Link href="/events" className="cta-secondary">
                  Attend Art Build
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
