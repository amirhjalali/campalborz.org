'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../components/reveal';
import { useContentConfig } from '../hooks/useConfig';
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const artists = [
  {
    number: '001',
    name: 'Mahmoud Farshchian',
    medium: 'Miniature Painting · Neo-classical Persian',
    era: 'b. 1930, Isfahan',
    bio: 'The undisputed master of contemporary Persian miniature painting. His luminous compositions bridge centuries of tradition with modern sensibility.',
    image: '/images/farshchian_tribute.webp',
  },
  {
    number: '002',
    name: 'Parviz Tanavoli',
    medium: 'Sculpture · Heech Series',
    era: 'b. 1937, Tehran',
    bio: 'Father of modern Iranian sculpture. His iconic "Heech" (Nothingness) series explores the void between existence and absence.',
    image: '/images/tanavoli_tribute.webp',
  },
  {
    number: '003',
    name: 'Monir Farmanfarmaian',
    medium: 'Mirror Mosaic · Geometric Abstraction',
    era: '1924 – 2019, Tehran',
    bio: 'Fused traditional Iranian mirror mosaic (aineh-kari) with Western geometric abstraction to create something entirely new.',
    image: '/images/mirror_mosaic.webp',
  },
];

const offerings = [
  {
    title: 'Chai & Hospitality',
    description: 'Hot Persian chai from dawn to dusk. Sit, sip, and connect with strangers who become family.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 18h24v18a6 6 0 01-6 6H14a6 6 0 01-6-6V18z" />
        <path d="M32 22h4a4 4 0 010 8h-4" />
        <path d="M14 8c0 0 2-4 6-4s6 4 6 4" strokeLinecap="round" />
        <path d="M17 12c0 0 1-2 3-2s3 2 3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Art Cars',
    description: 'HOMA and DAMAVAND roam the playa nightly — rolling temples of light, sound, and Persian geometry.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="24" r="18" />
        <path d="M24 6v36M6 24h36" />
        <path d="M10.1 10.1l27.8 27.8M37.9 10.1L10.1 37.9" />
        <circle cx="24" cy="24" r="8" />
      </svg>
    ),
  },
  {
    title: 'Sound & Music',
    description: 'Live DJs blend Persian classical with electronic. The desert becomes a dance floor under the stars.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 8v28a6 6 0 11-6-6h6" />
        <path d="M20 18l16-6v22a6 6 0 11-6-6h6" />
      </svg>
    ),
  },
  {
    title: 'Hookah Lounge',
    description: 'Traditional hookah under a hand-built shade structure. Stories exchanged, friendships forged.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 4v8M24 12c-6 0-10 4-10 10v2h20v-2c0-6-4-10-10-10z" />
        <path d="M14 24v8c0 2 2 4 4 4h2" strokeLinecap="round" />
        <path d="M20 36h8" strokeLinecap="round" />
        <circle cx="24" cy="42" r="2" />
        <path d="M34 24v4c0 4-3 6-6 6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const campQAs = [
  {
    question: 'What is Camp Alborz?',
    answer:
      "A Burning Man theme camp rooted in Persian hospitality that's been on the playa since 2018. Art cars, chai, sound systems, and a shaded space for everyone.",
  },
  {
    question: "What does 'TOMORROW-TODAY' mean?",
    answer:
      "A reminder that the future isn't somewhere out there — it's what we're building right now. Less philosophy, more doing stuff together.",
  },
  {
    question: 'What do you offer at camp?',
    answer:
      'Hot chai all day. Hookah lounge. HOMA and DAMAVAND art cars. Calligraphy workshops. Camp dinners with homemade Persian food.',
  },
  {
    question: 'How can I join?',
    answer:
      'Applications open every year around March. We look for people who want to contribute — whether that means building, cooking, DJing, or just being genuinely present.',
  },
];

/* ──────────────────────────────────────────────
   Homepage
   ────────────────────────────────────────────── */
export default function HomePage() {
  const content = useContentConfig();
  const rumiQuote = content.home?.rumiQuote;

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '15%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);

  const quoteRef = useRef(null);
  const { scrollYProgress: quoteScroll } = useScroll({
    target: quoteRef,
    offset: ['start end', 'end start'],
  });
  const quoteBgY = useTransform(quoteScroll, [0, 1], ['0%', '20%']);

  const panoramaRef = useRef(null);
  const { scrollYProgress: panoramaScroll } = useScroll({
    target: panoramaRef,
    offset: ['start end', 'end start'],
  });
  const panoramaY = useTransform(panoramaScroll, [0, 1], ['-5%', '5%']);

  return (
    <>
      <main>
        {/* ============================================ */}
        {/* 1. HERO — Full viewport split grid            */}
        {/* ============================================ */}
        <section
          ref={heroRef}
          className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
        >
          {/* Left: Text */}
          <motion.div
            className="relative flex flex-col justify-center px-8 py-24 md:px-16 md:py-20 lg:px-20 z-10"
            style={{ opacity: heroOpacity }}
          >
            <motion.p
              className="text-eyebrow mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Burning Man Theme Camp · Est. 2018
            </motion.p>

            <motion.h1
              className="font-heading text-5xl md:text-6xl lg:text-[5.5rem] font-normal leading-[0.95] tracking-tight mb-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Camp<br />
              <em className="italic" style={{ color: 'var(--color-terracotta)' }}>Alborz</em>
            </motion.h1>

            <motion.p
              className="text-[15px] leading-[1.85] max-w-[420px] mb-12"
              style={{ color: 'var(--color-ink-soft)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Persian culture, radical hospitality, and art on the playa.
              Named after Iran&apos;s greatest mountain range — where earth
              meets sky. We build, we gather, we transform.
            </motion.p>

            <motion.div
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/apply"
                className="cta-primary text-xs"
              >
                <span>Join Our Camp</span>
              </Link>
              <Link
                href="/about"
                className="text-[13px] border-b pb-0.5 transition-colors hover:border-ink"
                style={{ color: 'var(--color-ink-soft)', borderColor: 'var(--color-ink-soft)' }}
              >
                Our Story
              </Link>
            </motion.div>

            {/* Decorative watermark */}
            <div className="absolute bottom-10 right-16 w-[120px] h-[120px] opacity-[0.06] pointer-events-none hidden lg:block">
              <Image
                src="/images/persian_pattern.webp"
                alt=""
                fill
                className="object-contain"
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* Right: Full-bleed image with parallax */}
          <div className="relative min-h-[450px] overflow-hidden">
            <motion.div className="absolute inset-0 -top-[15%] -bottom-[15%]" style={{ y: heroImageY }}>
              <Image
                src="/images/playa_camp.webp"
                alt="Camp Alborz at golden hour on the playa"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            {/* Image overlay for depth */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, var(--color-cream) 0%, transparent 12%)',
              }}
            />
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: 'var(--color-ink-faint)' }}
            >
              Scroll
            </span>
            <motion.div
              className="w-px h-8"
              style={{ backgroundColor: 'var(--color-ink-faint)' }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* 2. NUMBERS BAR                               */}
        {/* ============================================ */}
        <section
          className="border-t border-b"
          style={{ borderColor: 'var(--color-warm-border)' }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { value: '8', label: 'Years on Playa' },
                { value: '45+', label: 'Camp Members' },
                { value: '3', label: 'Art Installations' },
                { value: '\u221E', label: 'Cups of Chai' },
              ].map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.1}>
                  <div
                    className={`py-10 md:py-12 text-center${
                      i < 3 ? ' border-r' : ''
                    }${i < 2 ? ' max-md:border-b' : ''}${
                      i === 2 ? ' max-md:border-r-0' : ''
                    }`}
                    style={{ borderColor: 'var(--color-warm-border)' }}
                  >
                    <p className="font-display text-4xl md:text-5xl font-light tracking-wide mb-2">
                      {stat.value}
                    </p>
                    <p
                      className="text-[10px] tracking-[0.2em] uppercase font-medium"
                      style={{ color: 'var(--color-ink-faint)' }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 3. STORY SECTION                             */}
        {/* ============================================ */}
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-20">
              {/* Left label */}
              <Reveal direction="left">
                <div>
                  <p
                    className="font-display text-8xl md:text-9xl font-light tracking-wide opacity-[0.06] leading-none mb-3"
                    aria-hidden="true"
                  >
                    01
                  </p>
                  <p className="text-eyebrow">
                    Our Story
                  </p>
                </div>
              </Reveal>

              {/* Right content */}
              <div>
                <Reveal delay={0.1}>
                  <h2 className="font-display font-light text-2xl md:text-3xl lg:text-[2.75rem] tracking-wide leading-snug mb-10">
                    Radical hospitality is an<br className="hidden md:block" /> ancient Persian invention
                  </h2>
                </Reveal>

                <Reveal delay={0.2}>
                  <div
                    className="space-y-6 text-[15px] leading-[1.85]"
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    <p>
                      In Persian culture, the concept of{' '}
                      <em className="font-accent not-italic" style={{ color: 'var(--color-ink)', fontStyle: 'italic' }}>
                        mehman-navazi
                      </em>
                      — treating every guest as a gift from
                      God — has shaped how we gather for over 3,000 years. When a
                      stranger arrives, you serve the best you have. No questions
                      asked.
                    </p>
                    <p>
                      Camp Alborz carries that tradition into Black Rock City.
                      Every year we build a space where chai flows from dawn to
                      dusk, where art cars light up the night, and where anyone can
                      sit down and feel at home. It is not about being Persian. It
                      is about the oldest form of hospitality meeting the newest
                      kind of community.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px" style={{ backgroundColor: 'var(--color-warm-border)' }} />

        {/* ============================================ */}
        {/* 4. OFFERINGS — What We Bring to the Playa    */}
        {/* ============================================ */}
        <section
          className="py-24 md:py-32"
          style={{ backgroundColor: 'var(--color-cream-warm)' }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center mb-16">
                <p className="text-eyebrow mb-4">
                  What We Bring
                </p>
                <h2 className="font-display font-light text-3xl md:text-4xl tracking-wide">
                  Life at Camp Alborz
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {offerings.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <div className="group text-center lg:text-left p-6 rounded-lg transition-colors duration-300 hover:bg-white/50 dark:hover:bg-white/5">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 transition-colors duration-300"
                      style={{
                        color: 'var(--color-terracotta)',
                        backgroundColor: 'rgba(var(--color-terracotta-rgb), 0.08)',
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="font-display text-lg tracking-wide mb-3">
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 5. RUMI QUOTE — Parallax background          */}
        {/* ============================================ */}
        <section
          ref={quoteRef}
          className="relative py-28 md:py-40 overflow-hidden"
        >
          {/* Parallax background */}
          <motion.div className="absolute inset-0 -top-20 -bottom-20" style={{ y: quoteBgY }}>
            <Image
              src="/images/hero_texture.webp"
              alt=""
              fill
              className="object-cover opacity-30"
              aria-hidden="true"
              sizes="100vw"
            />
          </motion.div>

          {/* Decorative lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]" aria-hidden="true">
            <div className="w-[500px] h-[500px] border border-current rounded-full" />
          </div>

          <div className="relative max-w-3xl mx-auto px-5 md:px-10 text-center">
            <Reveal>
              <div className="ornate-divider mb-10">
                <span
                  className="text-xs tracking-[0.4em] uppercase"
                  style={{ color: 'var(--color-gold-muted)' }}
                >
                  &#10022;
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="font-accent text-2xl md:text-4xl lg:text-[2.75rem] leading-[1.4] mb-10" style={{ fontStyle: 'italic' }}>
                {rumiQuote?.text ||
                  "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there."}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <p
                className="text-xs tracking-[0.35em] uppercase font-medium"
                style={{ color: 'var(--color-terracotta)' }}
              >
                {rumiQuote?.attribution
                  ? rumiQuote.attribution.split('·')[0].trim()
                  : 'Jalal ad-Din Rumi'}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================ */}
        {/* 6. FULL-BLEED CAMP IMAGE — Parallax          */}
        {/* ============================================ */}
        <section
          ref={panoramaRef}
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(300px, 45vw, 550px)' }}
        >
          <motion.div
            className="absolute inset-0 -top-[10%] -bottom-[10%]"
            style={{ y: panoramaY }}
          >
            <Image
              src="/images/playa_camp.webp"
              alt="Camp Alborz panoramic view at Black Rock City"
              fill
              className="object-cover"
              sizes="100vw"
              loading="lazy"
            />
          </motion.div>

          {/* Gradient overlays for depth */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to bottom, var(--color-cream) 0%, transparent 20%, transparent 80%, var(--color-cream) 100%)',
            }}
          />

          <p
            className="absolute bottom-6 right-8 text-[10px] tracking-[0.2em] uppercase text-white/60 z-20"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            Black Rock City, 2025
          </p>
        </section>

        {/* ============================================ */}
        {/* 7. ARTIST SPOTLIGHT                          */}
        {/* ============================================ */}
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            {/* Header */}
            <Reveal>
              <div
                className="flex items-center justify-between pb-6 mb-14"
              >
                <div>
                  <p className="text-eyebrow mb-2">
                    Inspiration
                  </p>
                  <h2 className="font-display font-light text-2xl md:text-3xl tracking-wide">
                    Artist Spotlight
                  </h2>
                </div>
                <Link
                  href="/art"
                  className="text-xs tracking-[0.2em] uppercase font-medium transition-colors hover:text-terracotta"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  View all &rarr;
                </Link>
              </div>
            </Reveal>

            {/* Decorative line */}
            <Reveal>
              <div
                className="h-px mb-14 animate-draw-line"
                style={{ backgroundColor: 'var(--color-warm-border)' }}
              />
            </Reveal>

            {/* Staggered 3-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_1fr] gap-8 md:gap-10">
              {artists.map((artist, i) => {
                const marginTop =
                  i === 0 ? 'mt-0' : i === 1 ? 'md:mt-24' : 'md:mt-10';

                return (
                  <Reveal key={artist.number} delay={i * 0.15} direction="up">
                    <article className={`${marginTop} group`}>
                      {/* Image with hover zoom */}
                      <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-6 image-hover-zoom">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          className="object-cover transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          loading="lazy"
                        />
                        {/* Subtle overlay on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(to top, rgba(var(--color-ink-rgb), 0.3) 0%, transparent 50%)',
                          }}
                        />
                      </div>

                      {/* Number */}
                      <p
                        className="text-xs tracking-[0.15em] mb-2 font-medium"
                        style={{ color: 'var(--color-terracotta)' }}
                      >
                        {artist.number}
                      </p>

                      {/* Name */}
                      <h3 className="font-accent text-xl md:text-2xl mb-1.5" style={{ fontStyle: 'italic' }}>
                        {artist.name}
                      </h3>

                      {/* Medium */}
                      <p
                        className="text-[10px] tracking-[0.12em] uppercase mb-1"
                        style={{ color: 'var(--color-ink-faint)' }}
                      >
                        {artist.medium}
                      </p>

                      {/* Era */}
                      <p
                        className="text-xs mb-4"
                        style={{ color: 'var(--color-ink-faint)' }}
                      >
                        {artist.era}
                      </p>

                      {/* Bio */}
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-ink-soft)' }}
                      >
                        {artist.bio}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 8. MOUNTAIN DIVIDER — Parallax               */}
        {/* ============================================ */}
        <div className="relative w-full h-48 md:h-56 overflow-hidden">
          <Image
            src="/images/mountain_ink.webp"
            alt=""
            fill
            className="object-cover opacity-50"
            aria-hidden="true"
            sizes="100vw"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, var(--color-cream) 0%, transparent 30%, transparent 70%, var(--color-cream) 100%)',
            }}
          />
        </div>

        {/* ============================================ */}
        {/* 9. CTA SECTION                               */}
        {/* ============================================ */}
        <section
          className="py-28 md:py-36"
          style={{ backgroundColor: 'rgba(var(--color-terracotta-rgb), 0.04)' }}
        >
          <div className="max-w-2xl mx-auto px-5 md:px-10 text-center">
            <Reveal>
              <p className="text-eyebrow mb-6">
                2026 Season
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display font-light text-3xl md:text-4xl lg:text-[3.25rem] tracking-wide leading-snug mb-8">
                Come find{' '}
                <em
                  className="font-accent"
                  style={{ color: 'var(--color-terracotta)', fontStyle: 'italic' }}
                >
                  your field
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                className="text-base md:text-[17px] leading-relaxed mb-12 max-w-lg mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                Applications for the 2026 season are open. Come build art, serve
                tea, and be part of something that has been going for almost a
                decade.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply" className="cta-primary text-sm">
                  <span>Apply to Join</span>
                </Link>
                <Link href="/donate" className="cta-secondary text-sm">
                  <span>Support Our Camp</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="h-px" style={{ backgroundColor: 'var(--color-warm-border)' }} />

        {/* ============================================ */}
        {/* 10. FAQ SECTION                              */}
        {/* ============================================ */}
        <section className="py-24 md:py-32" aria-labelledby="faq-heading">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="flex items-end justify-between mb-14">
                <div>
                  <p className="text-eyebrow mb-2">
                    Common Questions
                  </p>
                  <h2
                    id="faq-heading"
                    className="font-display font-light text-2xl md:text-3xl tracking-wide"
                  >
                    Questions &amp; Answers
                  </h2>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div
                className="h-px mb-12"
                style={{ backgroundColor: 'var(--color-warm-border)' }}
              />
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
              {campQAs.map(({ question, answer }, i) => (
                <Reveal key={question} delay={i * 0.12}>
                  <div className="group">
                    <h3 className="font-accent text-lg md:text-xl mb-3 transition-colors group-hover:text-terracotta" style={{ fontStyle: 'italic' }}>
                      {question}
                    </h3>
                    <p
                      className="text-sm leading-[1.8]"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {answer}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
