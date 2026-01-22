'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight, ChevronDown, Calendar, Sparkles, BookOpen, Users } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef } from 'react';

export default function CulturePage() {
  const { culture } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!culture) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Culture page configuration not found</p>
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
              src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
              alt="Persian Culture"
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
              HERITAGE & TRADITIONS
            </motion.p>
            <motion.h1
              className="text-display-thin text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              {culture.title}
            </motion.h1>
            <motion.p
              className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {culture.subtitle}
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

        {/* Cultural Elements */}
        <section className="section-base section-contained">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-14"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
              PILLARS OF OUR CAMP
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              Cultural Elements
            </h2>
            <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
              The rich traditions that shape our community experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.culturalElements.map((element, index) => {
              const ElementIcon = getIcon(element.icon);

              return (
                <motion.div
                  key={element.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card"
                >
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-5">
                    <ElementIcon className="h-6 w-6 text-gold-500" />
                  </div>
                  <h3 className="text-display-thin text-lg mb-3">{element.title}</h3>
                  <p className="text-body-relaxed text-sm text-ink-soft mb-4">
                    {element.description}
                  </p>
                  <div className="space-y-2">
                    {element.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gold-600">
                        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Cultural Values */}
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
                GUIDING PRINCIPLES
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Core Persian Values
              </h2>
              <p className="text-body-relaxed text-base text-tan-light/80 max-w-2xl mx-auto">
                How traditional Persian values shape our camp culture and interactions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culture.culturalValues.map((value, index) => {
                const ValueIcon = getIcon(value.icon);

                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                        <ValueIcon className="h-6 w-6 text-gold-400" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-display-thin text-xl text-tan-light">
                          {value.title}
                        </h3>
                        <p className="text-body-relaxed text-sm text-tan-light/80">
                          {value.description}
                        </p>
                        <p className="text-sm text-gold-400 italic">
                          In Practice: {value.example}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cultural Workshops */}
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
                HANDS-ON LEARNING
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Cultural Workshops
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Immersive experiences to deepen your understanding of Persian culture
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culture.workshops.map((workshop, index) => (
                <motion.div
                  key={workshop.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-display-thin text-xl">{workshop.title}</h3>
                    <span className="px-3 py-1 bg-gold-500/20 text-gold-600 rounded-full text-xs tracking-[0.1em] uppercase">
                      {workshop.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-gold-600 mb-4">Led by {workshop.instructor}</p>
                  <p className="text-body-relaxed text-sm text-ink-soft mb-6">
                    {workshop.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-xs text-ink-soft/70 uppercase tracking-[0.1em]">Level</span>
                      <p className="text-ink">{workshop.level}</p>
                    </div>
                    <div>
                      <span className="text-xs text-ink-soft/70 uppercase tracking-[0.1em]">Duration</span>
                      <p className="text-ink">{workshop.duration}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-xs text-ink-soft/70 uppercase tracking-[0.1em]">Materials</span>
                    <p className="text-sm text-ink">{workshop.materials}</p>
                  </div>

                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-500 transition-colors"
                  >
                    View Schedule
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Persian Celebrations */}
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
                FESTIVALS & HOLIDAYS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Persian Celebrations We Honor
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Traditional festivals that bring our community together year-round
              </p>
            </motion.div>

            <div className="space-y-8">
              {culture.celebrations.map((celebration, index) => (
                <motion.div
                  key={celebration.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="luxury-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                        <Sparkles className="h-5 w-5 text-gold-500" />
                      </div>
                      <h3 className="text-display-thin text-xl">{celebration.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-gold-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{celebration.date}</span>
                    </div>
                  </div>

                  <p className="text-body-relaxed text-ink-soft mb-6 pl-0 md:pl-16">
                    {celebration.description}
                  </p>

                  <div className="pl-0 md:pl-16">
                    <p className="text-xs text-ink-soft/70 uppercase tracking-[0.1em] mb-3">Traditions</p>
                    <div className="flex flex-wrap gap-2">
                      {celebration.traditions.map((tradition, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-tan-100 text-ink-soft rounded-full text-sm"
                        >
                          {tradition}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Resources */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel"
            >
              <div className="text-center space-y-4 mb-10">
                <div className="inline-flex p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                  <BookOpen className="h-6 w-6 text-gold-500" />
                </div>
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
                  EDUCATIONAL RESOURCES
                </p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  Cultural Learning Topics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {culture.learningResources.map((section, index) => (
                  <motion.div
                    key={section.category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 className="text-display-thin text-lg mb-4 pb-3 border-b border-line/30">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.resources.map((resource, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-ink-soft">
                          <span className="text-gold-500 mt-1">◆</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cultural Bridge */}
        {culture.culturalBridge && (
          <section className="section-contrast">
            <div className="section-contained">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 mb-14"
              >
                <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                  <Users className="h-8 w-8 text-gold-400" />
                </div>
                <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                  OUR MISSION
                </p>
                <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                  Building Cultural Bridges
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                >
                  <h3 className="text-display-thin text-xl text-tan-light mb-6">
                    {culture.culturalBridge.missionTitle}
                  </h3>
                  <div className="space-y-4">
                    {culture.culturalBridge.mission.map((paragraph, index) => (
                      <p key={index} className="text-body-relaxed text-tan-light/80">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                >
                  <h3 className="text-display-thin text-xl text-tan-light mb-6">
                    {culture.culturalBridge.howWeDoItTitle}
                  </h3>
                  <ul className="space-y-4">
                    {culture.culturalBridge.howWeDoIt.map((action, index) => {
                      const ActionIcon = getIcon(action.icon);
                      return (
                        <li key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 rounded-full bg-gold-500/20">
                            <ActionIcon className="h-4 w-4 text-gold-400" />
                          </div>
                          <span className="text-body-relaxed text-tan-light/80">
                            {action.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {culture.cta && (
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
                  {culture.cta.title}
                </h2>
                <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                  {culture.cta.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={culture.cta.buttons.primary.link} className="cta-primary">
                    {culture.cta.buttons.primary.text}
                    <ArrowRight size={18} />
                  </Link>
                  <Link href={culture.cta.buttons.secondary.link} className="cta-secondary">
                    {culture.cta.buttons.secondary.text}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
