'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
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
    <section className="section-base">
      <div className="section-contained">
        <div className="space-y-4 mb-14">
          <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
            15+ YEARS OF MAGIC
          </p>
          <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
            Our Journey
          </h2>
        </div>

        <div ref={timelineRef} className="relative max-w-3xl mx-auto">
          {/* Timeline Line Background */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-tan-300/50" />

          {/* Animated Timeline Line */}
          <motion.div
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 w-px bg-gradient-to-b from-gold-500 via-gold-500 to-gold-500 origin-top"
            style={{ scaleY, height: '100%' }}
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
                  className="absolute left-8 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-gold-500 border-4 border-cream z-10"
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
                    <p className="text-display-wide text-xs tracking-[0.3em] text-gold-600 mb-2">
                      {milestone.year}
                    </p>
                    <p className="text-body-relaxed text-ink-soft">
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
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQZBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEEA/AKWkWq6bCJH3G4kOZGJ5OOwPgGtItdOS8gFwlw8Mb5CJGQAM9kj81UtJNxp9pcNazyW5ljV2MTlSR8yKn/lKU4x//9k="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
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
        <section className="section-base section-contained">
          <div className="text-center space-y-8">
            <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
              {about.mission.title}
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {about.mission.paragraphs.map((paragraph, index) => (
                <p key={index} className={`text-body-relaxed text-base md:text-lg text-ink-soft text-left ${index === 0 ? 'drop-cap font-accent' : ''}`}>
                  {paragraph}
                </p>
              ))}
            </div>

            <blockquote className="blockquote-elegant max-w-2xl mx-auto">
              <p className="font-accent text-xl md:text-2xl text-ink/80 leading-relaxed">
                Out beyond ideas of wrongdoing and rightdoing, there is a field. I&apos;ll meet you there.
              </p>
              <footer className="mt-4 text-caption text-gold-600">
                Rumi
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Values Section */}
        <section className="section-contrast">
          <div className="section-contained">
            <div className="mb-14">
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight text-tan-light">
                Our Core Values
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about.values.map((value, index) => {
                const ValueIcon = getIcon(value.icon);

                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={`border border-white/10 rounded-2xl p-8 bg-white/5 text-center group transition-shadow duration-300 hover:shadow-lg hover:shadow-gold-500/10 ${index === 0 ? 'md:col-span-2' : ''}`}
                  >
                    <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
                      <ValueIcon className="h-8 w-8 text-gold-400" aria-hidden="true" />
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
        <TimelineSection about={about} />

        {/* Team Section */}
        <section className="section-alt">
          <div className="section-contained">
            <div className="mb-14">
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Our Leadership
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {about.team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3 }}
                  className="luxury-card text-center group"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-sage-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <span className="text-2xl font-display text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-display-thin text-lg mb-1">{member.name}</h3>
                  <p className="text-caption text-gold-600 mb-3">
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
          <div className="section-contained text-center space-y-6">
            <h2 className="text-display-thin text-2xl md:text-3xl">
              {about.nonprofit.title}
            </h2>
            <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
              {about.nonprofit.description}
            </p>
            <div>
              <Link href="/donate" className="cta-primary cta-shimmer">
                {about.nonprofit.cta.donate}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
