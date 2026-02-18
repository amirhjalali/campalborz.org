'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight, Calendar, Star, BookOpen } from 'lucide-react';
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

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
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
        <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: backgroundY }}
          >
            <Image
              src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
              alt="Traditional Persian cultural celebration featuring music, dance, and authentic decorations at Camp Alborz"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgICAgEFAAAAAAAAAAAAAQIDBAAFERIGEyExcZH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8Aw/XaZd0knsWp2rIhVFhRQCx9yT8ZZ0dSTXaxq1LMsLMpcy9eRcfnGMZFAFTJP//Z"
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
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              HERITAGE & TRADITIONS
            </motion.p>
            <motion.h1
              className="text-display-thin text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
              initial={{ y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {culture.title}
            </motion.h1>
            <motion.p
              className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {culture.subtitle}
            </motion.p>

          </motion.div>
        </section>

        {/* Cultural Elements */}
        <section className="section-base section-contained">
          <div className="space-y-3 mb-14">
            <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
              Cultural Elements
            </h2>
            <p className="font-accent text-lg text-ink-soft max-w-2xl">
              The rich traditions that shape our community experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.culturalElements.map((element, index) => {
              const ElementIcon = getIcon(element.icon);

              return (
                <motion.div
                  key={element.title}
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 + (index > 2 ? 0.05 : 0), ease: [0.22, 1, 0.36, 1] }}
                  className="luxury-card group"
                >
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-5 transition-transform duration-300 group-hover:scale-110">
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

        {/* Persian Proverb */}
        <section className="section-base">
          <div className="section-contained">
            <div className="text-center">
              <blockquote className="blockquote-elegant max-w-2xl mx-auto">
                <p className="font-accent text-xl md:text-2xl text-ink/80 leading-relaxed">
                  The wound is the place where the Light enters you.
                </p>
                <footer className="mt-4 text-caption text-gold-600">
                  Rumi
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Cultural Values */}
        <section className="section-contrast">
          <div className="section-contained">
            <div className="text-center mb-14">
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight text-tan-light">
                Core Persian Values
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culture.culturalValues.map((value, index) => {
                const ValueIcon = getIcon(value.icon);

                return (
                  <div
                    key={value.title}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5"
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
                        <p className="font-accent text-sm text-gold-400">
                          In Practice: {value.example}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cultural Workshops */}
        <section className="section-base">
          <div className="section-contained">
            <div className="text-center space-y-4 mb-14">
              <p className="font-accent italic text-sm tracking-wide text-ink-soft/80">
                Hands-On Learning
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Cultural Workshops
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Immersive experiences to deepen your understanding of Persian culture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culture.workshops.map((workshop, index) => (
                <div
                  key={workshop.title}
                  className={`luxury-card ${index === 0 ? 'md:col-span-2' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-display-thin text-xl">{workshop.title}</h3>
                    <span className="px-3 py-1 bg-gold-500/20 text-gold-600 rounded-full text-xs tracking-[0.1em] uppercase">
                      {workshop.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-gold-600 mb-4">Led by {workshop.instructor}</p>
                  <p className="font-accent text-sm text-ink-soft mb-6">
                    {workshop.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-caption text-ink-soft/80">Level</span>
                      <p className="text-ink">{workshop.level}</p>
                    </div>
                    <div>
                      <span className="text-caption text-ink-soft/80">Duration</span>
                      <p className="text-ink">{workshop.duration}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-caption text-ink-soft/80">Materials</span>
                    <p className="text-sm text-ink">{workshop.materials}</p>
                  </div>

                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-500 transition-colors group/link"
                  >
                    View Schedule
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Persian Celebrations */}
        <section className="section-alt">
          <div className="section-contained">
            <div className="text-center space-y-3 mb-14">
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Persian Celebrations We Honor
              </h2>
              <p className="font-accent text-lg text-ink-soft max-w-2xl mx-auto">
                Traditional festivals that bring our community together year-round
              </p>
            </div>

            <div className="space-y-8">
              {culture.celebrations.map((celebration, index) => (
                <div
                  key={celebration.name}
                  className="luxury-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                        <Star className="h-5 w-5 text-gold-500" />
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
                    <p className="text-caption text-ink-soft/80 mb-3">Traditions</p>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Resources */}
        <section className="section-base">
          <div className="section-contained">
            <div className="frame-panel">
              <div className="text-center space-y-4 mb-10">
                <div className="inline-flex p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                  <BookOpen className="h-6 w-6 text-gold-500" />
                </div>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  Cultural Learning Topics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {culture.learningResources.map((section, index) => (
                  <div key={section.category}>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Bridge */}
        {culture.culturalBridge && (
          <section className="section-contrast">
            <div className="section-contained">
              <div className="max-w-2xl mx-auto text-center mb-14">
                <blockquote className="font-accent text-2xl md:text-3xl text-tan-light/90 italic leading-relaxed">
                  Building Cultural Bridges
                </blockquote>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
                  <h3 className="text-display-thin text-xl text-tan-light mb-6">
                    {culture.culturalBridge.missionTitle}
                  </h3>
                  <div className="space-y-4">
                    {culture.culturalBridge.mission.map((paragraph, index) => (
                      <p key={index} className={`text-body-relaxed text-tan-light/80 ${index === 0 ? 'drop-cap' : ''}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
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
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {culture.cta && (
          <section className="section-base">
            <div className="section-contained">
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {culture.cta.title}
                </h2>
                <p className="text-body-relaxed text-base text-ink-soft">
                  {culture.cta.description}
                </p>
                <Link href={culture.cta.buttons.primary.link} className="cta-primary inline-flex">
                  {culture.cta.buttons.primary.text}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
