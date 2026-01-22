'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef } from 'react';

export default function AboutPage() {
  const { about } = useContentConfig();
  const campConfig = useCampConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!about) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">About page configuration not found</p>
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
              src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.jpg"
              alt="Camp Alborz Community"
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
              OUR STORY
            </motion.p>
            <motion.h1
              className="text-display-thin text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              {about.title}
            </motion.h1>
            <motion.p
              className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {about.subtitle}
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

        {/* Mission Statement */}
        <section className="section-base section-contained">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="frame-panel text-center space-y-8"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
              WHY WE EXIST
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              {about.mission.title}
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {about.mission.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-body-relaxed text-base md:text-lg text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Values Section */}
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
                WHAT WE BELIEVE
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Our Core Values
              </h2>
              <p className="text-body-relaxed text-base text-tan-light/80 max-w-2xl mx-auto">
                The principles that guide everything we create and share
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about.values.map((value, index) => {
                const ValueIcon = getIcon(value.icon);

                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm text-center"
                  >
                    <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
                      <ValueIcon className="h-8 w-8 text-gold-400" />
                    </div>
                    <h3 className="text-display-thin text-xl text-tan-light mb-4">
                      {value.title}
                    </h3>
                    <p className="text-body-relaxed text-sm text-tan-light/80">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
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
                15+ YEARS OF MAGIC
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Our Journey
              </h2>
            </motion.div>

            <div className="relative max-w-3xl mx-auto">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500/50 via-gold-500 to-gold-500/50" />

              <div className="space-y-12">
                {about.timeline.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-gold-500 border-4 border-cream z-10" />

                    {/* Content Card */}
                    <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                      <div className="luxury-card">
                        <p className="text-display-wide text-xs tracking-[0.3em] text-gold-600 mb-2">
                          {milestone.year}
                        </p>
                        <p className="text-body-relaxed text-ink-soft">
                          {milestone.event}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
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
                THE PEOPLE
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Our Leadership
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                The passionate people who make {campConfig.name} possible
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {about.team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-sage-600 flex items-center justify-center">
                    <span className="text-2xl font-display text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-display-thin text-lg mb-1">{member.name}</h3>
                  <p className="text-xs text-gold-600 tracking-[0.2em] uppercase mb-3">
                    {member.role}
                  </p>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 501(c)(3) CTA Section */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel text-center space-y-8"
            >
              <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                {(() => {
                  const AwardIcon = getIcon('award');
                  return <AwardIcon className="h-10 w-10 text-gold-500" />;
                })()}
              </div>

              <div className="space-y-4">
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {about.nonprofit.title}
                </h2>
                <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                  {about.nonprofit.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/donate" className="cta-primary">
                  {about.nonprofit.cta.donate}
                  <ArrowRight size={18} />
                </Link>
                <Link href="/apply" className="cta-secondary">
                  {about.nonprofit.cta.join}
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
