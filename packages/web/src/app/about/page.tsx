'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef } from 'react';

function TimelineSection({ about }: { about: NonNullable<ReturnType<typeof useContentConfig>['about']> }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Reveal>
          <div className="space-y-4 mb-14 text-center">
            <p className="text-eyebrow">TIMELINE</p>
            <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
              Our Journey
            </h2>
            <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
              15+ years of building community, art, and hospitality on the playa and beyond.
            </p>
          </div>
        </Reveal>

        <div className="ornate-divider mb-14" />

        <div ref={timelineRef} className="relative max-w-3xl mx-auto">
          {/* Timeline Line Background */}
          <div
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px"
            style={{ backgroundColor: 'rgba(var(--color-line-rgb), 0.5)' }}
          />

          {/* Animated Timeline Line */}
          <motion.div
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 w-px origin-top"
            style={{
              scaleY,
              height: '100%',
              background: 'linear-gradient(to bottom, var(--color-gold), var(--color-gold-muted), var(--color-gold))',
            }}
          />

          <div className="space-y-12">
            {about.timeline.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline Dot */}
                <motion.div
                  className="absolute left-8 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-4 z-10"
                  style={{
                    backgroundColor: 'var(--color-gold)',
                    borderColor: 'var(--color-cream)',
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                />

                {/* Content Card */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                  <motion.div
                    className="luxury-card card-tilt"
                    whileHover={{ y: -4 }}
                  >
                    <p className="text-eyebrow mb-2">
                      {milestone.year}
                    </p>
                    <p className="text-body-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                      {milestone.event}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { about } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!about) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>About page configuration not found</p>
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
            src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.jpg"
            alt="Camp Alborz community members gathering at night under string lights in Black Rock City"
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQZBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEEQ/AKWkWq6bCJH3G4kOZGJ5OOwPgGtItdOS8gFwlw8Mb5CJGQAM9kj81UtJNxp9pcNazyW5ljV2MTlSR8yKn/lKU4x//9k="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 text-center py-24"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            OUR STORY
          </motion.p>
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {about.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {about.subtitle}
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

      {/* Mission Statement */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="text-center space-y-8">
            <Reveal>
              <p className="text-eyebrow">OUR MISSION</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight mt-3">
                {about.mission.title}
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="max-w-3xl mx-auto space-y-6">
                {about.mission.paragraphs.map((paragraph, index) => (
                  <p key={index} className={`text-body-relaxed text-base md:text-lg text-left ${index === 0 ? 'drop-cap font-accent' : ''}`} style={{ color: 'var(--color-ink-soft)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <blockquote className="blockquote-elegant max-w-2xl mx-auto">
                <p className="font-accent text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--color-ink)', opacity: 0.8 }}>
                  A good name is better than a golden girdle.
                </p>
                <footer className="mt-4 text-caption" style={{ color: 'var(--color-gold)' }}>
                  Persian Proverb
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Values Section */}
      <section className="py-24 md:py-32 section-contrast">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>OUR VALUES</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight mt-3" style={{ color: 'var(--color-cream)' }}>
                Our Core Values
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.values.map((value, index) => {
              const ValueIcon = getIcon(value.icon);

              return (
                <Reveal key={value.title} delay={index * 0.15} direction={index === 0 ? 'left' : index === 2 ? 'right' : 'up'}>
                  <div
                    className={`border rounded-2xl p-8 text-center group transition-shadow duration-300 ${index === 0 ? 'md:col-span-2' : ''}`}
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div
                      className="inline-flex p-4 rounded-full border mb-6"
                      style={{
                        backgroundColor: 'rgba(var(--color-gold-rgb), 0.2)',
                        borderColor: 'rgba(var(--color-gold-rgb), 0.3)',
                      }}
                    >
                      <ValueIcon className="h-8 w-8" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                    </div>
                    <h3 className="text-display-thin text-xl mb-4" style={{ color: 'var(--color-cream)' }}>
                      {value.title}
                    </h3>
                    <p className="text-body-relaxed text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                      {value.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection about={about} />

      {/* Team Section */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-eyebrow">THE CREW</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight mt-3">
                Our Leadership
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.team.map((member, index) => (
              <Reveal key={member.name} delay={index * 0.1} direction={index % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="luxury-card text-center group"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(to bottom right, var(--color-gold-muted), var(--color-sage))',
                    }}
                  >
                    <span className="text-2xl font-display text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-display-thin text-lg mb-1">{member.name}</h3>
                  <p className="text-caption mb-3" style={{ color: 'var(--color-gold)' }}>
                    {member.role}
                  </p>
                  <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                    {member.bio}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* 501(c)(3) CTA Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 text-center space-y-6">
          <Reveal>
            <p className="text-eyebrow">NON-PROFIT</p>
            <h2 className="text-display-thin text-2xl md:text-3xl mt-3">
              {about.nonprofit.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
              {about.nonprofit.description}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/donate" className="cta-primary cta-shimmer">
                <span>{about.nonprofit.cta.donate}</span>
                <span><ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
