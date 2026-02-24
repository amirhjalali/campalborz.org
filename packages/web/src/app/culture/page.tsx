'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
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
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Culture page configuration not found</p>
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
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent" style={{ background: `linear-gradient(to top, var(--color-cream), transparent, transparent)`, opacity: 0.9 }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 text-center py-24 max-w-[1200px] mx-auto px-5 md:px-10"
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
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="space-y-3 mb-14">
              <p className="text-eyebrow">PERSIAN HERITAGE</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
                Cultural Elements
              </h2>
              <p className="font-accent text-lg max-w-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                The rich traditions that shape our community experience
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.culturalElements.map((element, index) => {
              const ElementIcon = getIcon(element.icon);

              return (
                <Reveal key={element.title} direction="up" delay={index * 0.1}>
                  <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.12 + (index > 2 ? 0.05 : 0), ease: [0.22, 1, 0.36, 1] }}
                    className="luxury-card group h-full"
                  >
                    <div
                      className="inline-flex p-4 rounded-full mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', border: '1px solid rgba(184, 150, 12, 0.25)' }}
                    >
                      <ElementIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <h3 className="font-display text-lg mb-3" style={{ color: 'var(--color-ink)' }}>{element.title}</h3>
                    <p className="text-body-relaxed text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                      {element.description}
                    </p>
                    <div className="space-y-2">
                      {element.activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold-muted)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Persian Proverb */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center">
              <div className="persian-line max-w-md mx-auto mb-8">
                <span className="text-eyebrow">MUSIC & POETRY</span>
              </div>
              <blockquote className="max-w-2xl mx-auto">
                <p className="font-accent text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                  The wound is the place where the Light enters you.
                </p>
                <footer className="mt-4 text-caption" style={{ color: 'var(--color-gold-muted)' }}>
                  Rumi
                </footer>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Cultural Values */}
      <section className="section-contrast py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center mb-14">
              <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>TRADITIONS</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Core Persian Values
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culture.culturalValues.map((value, index) => {
              const ValueIcon = getIcon(value.icon);

              return (
                <Reveal key={value.title} direction={index % 2 === 0 ? 'left' : 'right'} delay={index * 0.1}>
                  <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
                    <div className="flex items-start gap-5">
                      <div
                        className="flex-shrink-0 p-4 rounded-full"
                        style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', border: '1px solid rgba(184, 150, 12, 0.25)' }}
                      >
                        <ValueIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl" style={{ color: 'var(--color-cream)' }}>
                          {value.title}
                        </h3>
                        <p className="text-body-relaxed text-sm" style={{ color: 'rgba(250, 247, 240, 0.8)' }}>
                          {value.description}
                        </p>
                        <p className="font-accent text-sm" style={{ color: 'var(--color-gold-muted)' }}>
                          In Practice: {value.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Cultural Workshops */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">HANDS-ON LEARNING</p>
              <h2 className="font-display text-3xl md:text-4xl" style={{ color: 'var(--color-ink)' }}>
                Cultural Workshops
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Immersive experiences to deepen your understanding of Persian culture
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culture.workshops.map((workshop, index) => (
              <Reveal key={workshop.title} direction={index % 2 === 0 ? 'left' : 'right'} delay={index * 0.1}>
                <div className={`luxury-card h-full ${index === 0 ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{workshop.title}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs tracking-[0.1em] uppercase"
                      style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', color: 'var(--color-gold-muted)' }}
                    >
                      {workshop.frequency}
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-gold-muted)' }}>Led by {workshop.instructor}</p>
                  <p className="font-accent text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                    {workshop.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-caption" style={{ color: 'var(--color-ink-faint)' }}>Level</span>
                      <p style={{ color: 'var(--color-ink)' }}>{workshop.level}</p>
                    </div>
                    <div>
                      <span className="text-caption" style={{ color: 'var(--color-ink-faint)' }}>Duration</span>
                      <p style={{ color: 'var(--color-ink)' }}>{workshop.duration}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-caption" style={{ color: 'var(--color-ink-faint)' }}>Materials</span>
                    <p className="text-sm" style={{ color: 'var(--color-ink)' }}>{workshop.materials}</p>
                  </div>

                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm transition-colors group/link"
                    style={{ color: 'var(--color-terracotta)' }}
                  >
                    View Schedule
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Persian Celebrations */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">CELEBRATIONS</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
                Persian Celebrations We Honor
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Traditional festivals that bring our community together year-round
              </p>
            </div>
          </Reveal>

          <div className="space-y-8">
            {culture.celebrations.map((celebration, index) => (
              <Reveal key={celebration.name} direction="up" delay={index * 0.1}>
                <div className="luxury-card">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', border: '1px solid rgba(184, 150, 12, 0.25)' }}
                      >
                        <Star className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{celebration.name}</h3>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-gold-muted)' }}>
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{celebration.date}</span>
                    </div>
                  </div>

                  <p className="text-body-relaxed mb-6 pl-0 md:pl-16" style={{ color: 'var(--color-ink-soft)' }}>
                    {celebration.description}
                  </p>

                  <div className="pl-0 md:pl-16">
                    <p className="text-caption mb-3" style={{ color: 'var(--color-ink-faint)' }}>Traditions</p>
                    <div className="flex flex-wrap gap-2">
                      {celebration.traditions.map((tradition, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full text-sm"
                          style={{ backgroundColor: 'var(--color-cream-warm)', color: 'var(--color-ink-soft)' }}
                        >
                          {tradition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Learning Resources */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="frame-panel">
              <div className="text-center space-y-4 mb-10">
                <p className="text-eyebrow">KNOWLEDGE</p>
                <div
                  className="inline-flex p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)', border: '1px solid rgba(184, 150, 12, 0.25)' }}
                >
                  <BookOpen className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--color-ink)' }}>
                  Cultural Learning Topics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {culture.learningResources.map((section, index) => (
                  <Reveal key={section.category} direction="up" delay={index * 0.1}>
                    <div>
                      <h3 className="font-display text-lg mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-warm-border)', color: 'var(--color-ink)' }}>
                        {section.category}
                      </h3>
                      <ul className="space-y-3">
                        {section.resources.map((resource, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                            <span className="mt-1" style={{ color: 'var(--color-gold)' }}>&#9670;</span>
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* Cultural Bridge */}
      {culture.culturalBridge && (
        <section className="section-contrast py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal direction="up">
              <div className="max-w-2xl mx-auto text-center mb-14">
                <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>BRIDGING WORLDS</p>
                <blockquote className="font-accent text-2xl md:text-3xl italic leading-relaxed" style={{ color: 'rgba(250, 247, 240, 0.9)' }}>
                  Building Cultural Bridges
                </blockquote>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Reveal direction="left" delay={0.1}>
                <div className="border border-white/10 rounded-2xl p-8 bg-white/5 h-full">
                  <h3 className="font-display text-xl mb-6" style={{ color: 'var(--color-cream)' }}>
                    {culture.culturalBridge.missionTitle}
                  </h3>
                  <div className="space-y-4">
                    {culture.culturalBridge.mission.map((paragraph, index) => (
                      <p key={index} className={`text-body-relaxed ${index === 0 ? 'drop-cap' : ''}`} style={{ color: 'rgba(250, 247, 240, 0.8)' }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div className="border border-white/10 rounded-2xl p-8 bg-white/5 h-full">
                  <h3 className="font-display text-xl mb-6" style={{ color: 'var(--color-cream)' }}>
                    {culture.culturalBridge.howWeDoItTitle}
                  </h3>
                  <ul className="space-y-4">
                    {culture.culturalBridge.howWeDoIt.map((action, index) => {
                      const ActionIcon = getIcon(action.icon);
                      return (
                        <li key={index} className="flex items-start gap-4">
                          <div
                            className="flex-shrink-0 p-2 rounded-full"
                            style={{ backgroundColor: 'rgba(184, 150, 12, 0.15)' }}
                          >
                            <ActionIcon className="h-4 w-4" style={{ color: 'var(--color-gold-muted)' }} />
                          </div>
                          <span className="text-body-relaxed" style={{ color: 'rgba(250, 247, 240, 0.8)' }}>
                            {action.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* CTA Section - Config-driven */}
      {culture.cta && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal direction="up">
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <p className="text-eyebrow">JOIN US</p>
                <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--color-ink)' }}>
                  {culture.cta.title}
                </h2>
                <p className="text-body-relaxed text-base" style={{ color: 'var(--color-ink-soft)' }}>
                  {culture.cta.description}
                </p>
                <Link href={culture.cta.buttons.primary.link} className="cta-primary inline-flex">
                  <span>{culture.cta.buttons.primary.text}</span>
                  <span><ArrowRight size={18} aria-hidden="true" /></span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Experience Persian Culture CTA */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <p className="text-eyebrow">IMMERSE YOURSELF</p>
              <h2 className="font-display text-3xl md:text-4xl" style={{ color: 'var(--color-ink)' }}>
                Experience Persian Culture
              </h2>
              <p className="text-body-relaxed text-lg" style={{ color: 'var(--color-ink-soft)' }}>
                Join us at our upcoming events and discover the beauty of Persian traditions, music, and community.
              </p>
              <Link href="/events" className="cta-primary inline-flex">
                <span>Explore Our Events</span>
                <span><ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
