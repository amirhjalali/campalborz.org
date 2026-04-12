'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, Calendar } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
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
      <section
        ref={heroRef}
        className="relative min-h-hero-sm overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #2C2416 0%, #D4C4A8 30%, #4A5D5A 60%, #D4AF37 85%, #2C2416 100%)',
        }}
      >
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/culture_hero_pro.webp"
            alt="Persian tea house gathering at Camp Alborz with traditional samovar, carpets, lanterns, and live music on the playa"
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" aria-hidden="true" />

        <motion.div
          className="relative z-10 text-center py-24 max-w-[1200px] mx-auto px-5 md:px-10"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            HERITAGE &amp; TRADITIONS
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {culture.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {culture.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>
      </section>

      {/* Cultural Elements */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="space-y-3 mb-14">
              <p className="text-eyebrow">PERSIAN HERITAGE</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                Cultural Elements
              </h2>
              <p className="font-accent text-lg max-w-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                The rich traditions that shape our community experience
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.culturalElements.map((element) => (
              <div
                key={element.title}
                className="luxury-card h-full"
              >
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persian Proverb — full-bleed dark */}
      <section className="py-28 md:py-40" style={{ backgroundColor: 'var(--color-ink)' }}>
        <div className="max-w-[960px] mx-auto px-8 md:px-16">
          <blockquote className="text-center">
            <p className="font-accent text-2xl sm:text-3xl md:text-4xl italic leading-relaxed" style={{ color: 'var(--color-cream)' }}>
              The wound is the place where the Light enters you.
            </p>
            <footer className="mt-8 font-display text-sm tracking-widest uppercase" style={{ color: 'var(--color-gold-muted)' }}>
              Rumi
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Cultural Values */}
      <section className="section-contrast py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center mb-14">
              <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>TRADITIONS</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Core Persian Values
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culture.culturalValues.map((value) => (
              <div key={value.title} className="border border-white/10 rounded-2xl p-8 bg-white/5">
                <h3 className="font-display text-xl mb-3" style={{ color: 'var(--color-cream)' }}>
                  {value.title}
                </h3>
                <p className="text-body-relaxed text-sm mb-3" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                  {value.description}
                </p>
                <p className="font-accent text-sm" style={{ color: 'var(--color-gold-muted)' }}>
                  In Practice: {value.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Workshops */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">HANDS-ON LEARNING</p>
              <h2 className="font-accent text-3xl md:text-4xl" style={{ color: '#2C2416' }}>
                Cultural Workshops
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Immersive experiences to deepen your understanding of Persian culture
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culture.workshops.map((workshop) => (
              <div key={workshop.title} className="border rounded-2xl p-8 h-full" style={{ borderColor: 'var(--color-warm-border)' }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{workshop.title}</h3>
                  <span
                    className="flex-shrink-0 px-3 py-1 text-xs tracking-[0.08em] uppercase border rounded"
                    style={{ borderColor: 'var(--color-warm-border)', color: 'var(--color-ink-soft)' }}
                  >
                    {workshop.frequency}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--color-gold-muted)' }}>Led by {workshop.instructor}</p>
                <p className="font-accent text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                  {workshop.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-6 text-sm">
                  <span className="px-3 py-1 rounded border" style={{ borderColor: 'var(--color-warm-border)', color: 'var(--color-ink-soft)' }}>
                    {workshop.level}
                  </span>
                  <span className="px-3 py-1 rounded border" style={{ borderColor: 'var(--color-warm-border)', color: 'var(--color-ink-soft)' }}>
                    {workshop.duration}
                  </span>
                </div>

                <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                  <span className="text-caption" style={{ color: 'var(--color-ink-faint)' }}>Materials: </span>
                  {workshop.materials}
                </p>

                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 text-sm transition-colors group/link"
                  style={{ color: 'var(--color-terracotta)' }}
                >
                  View Schedule
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persian Celebrations */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">CELEBRATIONS</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                Persian Celebrations We Honor
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Traditional festivals that bring our community together year-round
              </p>
            </div>
          </Reveal>

          <div className="space-y-8">
            {culture.celebrations.map((celebration) => (
              <div key={celebration.name} className="border rounded-2xl p-8" style={{ borderColor: 'var(--color-warm-border)' }}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <h3 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{celebration.name}</h3>
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-gold-muted)' }}>
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{celebration.date}</span>
                  </div>
                </div>

                <p className="text-body-relaxed mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                  {celebration.description}
                </p>

                <div>
                  <p className="text-caption mb-3" style={{ color: 'var(--color-ink-faint)' }}>Traditions</p>
                  <div className="flex flex-wrap gap-2">
                    {celebration.traditions.map((tradition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-sm"
                        style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-ink-soft)' }}
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
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="frame-panel">
              <div className="text-center space-y-4 mb-10">
                <p className="text-eyebrow">KNOWLEDGE</p>
                <h2 className="font-accent text-2xl md:text-3xl" style={{ color: '#2C2416' }}>
                  Cultural Learning Topics
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {culture.learningResources.map((section) => (
                  <div key={section.category}>
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
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cultural Bridge */}
      {culture.culturalBridge && (
        <section className="section-contrast py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal direction="up">
              <div className="max-w-2xl mx-auto text-center mb-14">
                <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>BRIDGING WORLDS</p>
                <blockquote className="font-accent text-2xl md:text-3xl italic leading-relaxed" style={{ color: 'rgba(var(--color-cream-rgb), 0.9)' }}>
                  Building Cultural Bridges
                </blockquote>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-white/10 rounded-2xl p-8 bg-white/5 h-full">
                <h3 className="font-display text-xl mb-6" style={{ color: 'var(--color-cream)' }}>
                  {culture.culturalBridge.missionTitle}
                </h3>
                <div className="space-y-4">
                  {culture.culturalBridge.mission.map((paragraph, index) => (
                    <p key={index} className={`text-body-relaxed ${index === 0 ? 'drop-cap' : ''}`} style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 bg-white/5 h-full">
                <h3 className="font-display text-xl mb-6" style={{ color: 'var(--color-cream)' }}>
                  {culture.culturalBridge.howWeDoItTitle}
                </h3>
                <ul className="space-y-4">
                  {culture.culturalBridge.howWeDoIt.map((action, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-gold-muted)' }} />
                      <span className="text-body-relaxed" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                        {action.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Camp Traditions — editorial list */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[720px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <h2 className="font-accent text-3xl md:text-4xl tracking-tight mb-4" style={{ color: '#2C2416' }}>
              Our Camp Traditions
            </h2>
            <p className="font-body text-base mb-14" style={{ color: 'var(--color-ink-soft)' }}>
              Beyond Persian heritage, Camp Alborz has developed its own rituals — traditions born on the playa
              that have become the heartbeat of our community. These aren&apos;t prescribed; they emerged naturally
              from years of building, celebrating, and caring for each other.
            </p>
          </Reveal>

          <div className="space-y-0">
            {[
              {
                title: 'Sunrise Chai Circle',
                description:
                  'Every morning at Camp Alborz begins the same way: gathered around the samovar as dawn paints the playa gold. No phones, no plans — just Persian tea, cardamom, and whatever conversation finds us. It\u2019s where strangers become family.',
              },
              {
                title: 'The Simorgh Gathering',
                description:
                  'Named for the mythical bird that is all birds united as one, our pre-Temple-burn circle is where we share what we\u2019re leaving behind and what we\u2019re carrying forward. Thirty voices become one.',
              },
              {
                title: 'First-Timer\u2019s Welcome',
                description:
                  'Every virgin burner at Camp Alborz gets a personal guide, a playa name ceremony, and a spot at the chai circle. We remember what it\u2019s like to arrive overwhelmed — and we make sure nobody feels alone.',
              },
              {
                title: 'The Hafez Oracle',
                description:
                  'In Persian tradition, you open the poet Hafez at random for guidance. At Camp Alborz, we keep a weathered volume of Hafez in the common space. Before big decisions — or just on quiet afternoons — members seek the poet\u2019s wisdom.',
              },
              {
                title: 'Build Week Bonding',
                description:
                  'The week before Burning Man is when Camp Alborz truly comes alive. Long days of building shade structures, wiring HOMA, and hanging lights — fueled by ghormeh sabzi and shared purpose. The camp we build is the community we\u2019ve become.',
              },
              {
                title: 'Playa Name Ceremony',
                description:
                  'Your playa name isn\u2019t chosen — it finds you. At Camp Alborz, names emerge from stories told over chai, moments on the dance floor, or the way you hammer a nail. When the name sticks, we celebrate with a toast.',
              },
            ].map((tradition, index, arr) => (
              <article key={tradition.title}>
                <h3 className="font-display text-lg mb-2" style={{ color: 'var(--color-ink)' }}>
                  {tradition.title}
                </h3>
                <p className="font-body text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                  {tradition.description}
                </p>
                {index < arr.length - 1 && (
                  <hr className="my-8" style={{ borderColor: 'var(--color-warm-border)' }} aria-hidden="true" />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Config-driven */}
      {culture.cta && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal direction="up">
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <p className="text-eyebrow">JOIN US</p>
                <h2 className="font-accent text-2xl md:text-3xl" style={{ color: '#2C2416' }}>
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
    </main>
  );
}
