'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../components/reveal';
import { useContentConfig } from '../hooks/useConfig';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from 'framer-motion';

/* ──────────────────────────────────────────────
   Shared animation config
   ────────────────────────────────────────────── */
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ──────────────────────────────────────────────
   Animated stat counter
   ────────────────────────────────────────────── */
function AnimatedStat({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: easeOutExpo }}
      className="py-10 md:py-14 text-center"
    >
      <p className="font-display text-4xl md:text-5xl font-light tracking-wide mb-2">
        {value}
      </p>
      <p
        className="text-eyebrow"
        style={{ color: 'var(--color-ink-faint)' }}
      >
        {label}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const artists = [
  {
    number: '001',
    name: 'Mahmoud Farshchian',
    initials: 'MF',
    medium: 'Miniature Painting \u00b7 Neo-classical Persian',
    era: 'b. 1930, Isfahan',
    bio: 'The undisputed master of contemporary Persian miniature painting. His luminous compositions bridge centuries of tradition with modern sensibility.',
    image: '/images/farshchian_tribute.webp',
  },
  {
    number: '002',
    name: 'Parviz Tanavoli',
    initials: 'PT',
    medium: 'Sculpture \u00b7 Heech Series',
    era: 'b. 1937, Tehran',
    bio: 'Father of modern Iranian sculpture. His iconic "Heech" (Nothingness) series explores the void between existence and absence.',
    image: '/images/tanavoli_tribute.webp',
  },
  {
    number: '003',
    name: 'Monir Farmanfarmaian',
    initials: 'MF',
    medium: 'Mirror Mosaic \u00b7 Geometric Abstraction',
    era: '1924 \u2013 2019, Tehran',
    bio: 'Fused traditional Iranian mirror mosaic (aineh-kari) with Western geometric abstraction to create something entirely new.',
    image: '/images/mirror_mosaic.webp',
  },
];

/* Artist image with graceful fallback to styled initials placeholder */
function ArtistImage({ artist }: { artist: (typeof artists)[number] }) {
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => setImgError(true), []);

  if (imgError) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, var(--color-sage) 0%, #2C2416 60%, var(--color-gold-muted) 100%)',
        }}
      >
        <div className="text-center">
          <span className="font-display text-5xl md:text-6xl tracking-widest text-white/80">
            {artist.initials}
          </span>
          <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-white/40">
            {artist.medium.split('\u00b7')[0].trim()}
          </p>
        </div>
        {/* Decorative geometric pattern overlay */}
        <div className="absolute inset-0 pattern-persian opacity-10 pointer-events-none" />
      </div>
    );
  }

  return (
    <Image
      src={artist.image}
      alt={`${artist.name} \u2014 ${artist.medium}`}
      fill
      className="object-cover transition-transform duration-700"
      sizes="(max-width: 768px) 100vw, 33vw"
      loading="lazy"
      onError={handleError}
    />
  );
}

const offerings = [
  {
    title: 'Tea & Hospitality',
    description:
      'Hot Persian tea from dawn to dusk. Sit, sip, and connect with strangers who become family.',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M8 18h24v18a6 6 0 01-6 6H14a6 6 0 01-6-6V18z" />
        <path d="M32 22h4a4 4 0 010 8h-4" />
        <path
          d="M14 8c0 0 2-4 6-4s6 4 6 4"
          strokeLinecap="round"
        />
        <path
          d="M17 12c0 0 1-2 3-2s3 2 3 2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Art Cars',
    description:
      'HOMA and DAMAVAND roam the playa nightly \u2014 rolling temples of light, sound, and Persian geometry.',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="18" />
        <path d="M24 6v36M6 24h36" />
        <path d="M10.1 10.1l27.8 27.8M37.9 10.1L10.1 37.9" />
        <circle cx="24" cy="24" r="8" />
      </svg>
    ),
  },
  {
    title: 'Sound & Music',
    description:
      'Live DJs blend Persian classical with electronic. The desert becomes a dance floor under the stars.',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M20 8v28a6 6 0 11-6-6h6" />
        <path d="M20 18l16-6v22a6 6 0 11-6-6h6" />
      </svg>
    ),
  },
  {
    title: 'Hookah Lounge',
    description:
      'Traditional hookah under a hand-built shade structure. Pull up a cushion, swap stories, and lose track of time.',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-10 h-10"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M24 4v8M24 12c-6 0-10 4-10 10v2h20v-2c0-6-4-10-10-10z" />
        <path
          d="M14 24v8c0 2 2 4 4 4h2"
          strokeLinecap="round"
        />
        <path d="M20 36h8" strokeLinecap="round" />
        <circle cx="24" cy="42" r="2" />
        <path
          d="M34 24v4c0 4-3 6-6 6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const campQAs = [
  {
    question: 'What is Camp Alborz?',
    answer:
      'A 501(c)(3) non-profit celebrating Persian culture through music, art, and community. We\'ve been building on the playa since 2008 and year-round in LA, Brooklyn, and beyond.',
  },
  {
    question: 'Where does the name come from?',
    answer:
      'Alborz is Iran\'s greatest mountain range \u2014 home to Mount Damavand, the tallest peak in the Middle East. We named the camp after it, and one of our art cars after the peak.',
  },
  {
    question: 'What happens at camp?',
    answer:
      'Persian tea from sunrise on, hookah lounge all afternoon, and homemade camp dinners. After dark, our art cars HOMA and DAMAVAND head out with DJs blending Persian and electronic music.',
  },
  {
    question: 'How can I get involved?',
    answer:
      'Come to one of our events or find us on the playa \u2014 we\'re always welcoming new faces. You can also apply to join the camp, or donate to help us build art and keep the tea flowing.',
  },
];

/* ──────────────────────────────────────────────
   Homepage
   ────────────────────────────────────────────── */
export default function HomePage() {
  const content = useContentConfig();
  const rumiQuote = content.home?.rumiQuote;
  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '18%']);
  const heroImageScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(heroScroll, [0, 0.45], [1, 0]);
  const heroContentY = useTransform(heroScroll, [0, 0.45], [0, -50]);

  const quoteRef = useRef(null);
  const { scrollYProgress: quoteScroll } = useScroll({
    target: quoteRef,
    offset: ['start end', 'end start'],
  });
  const quoteBgY = useTransform(quoteScroll, [0, 1], ['0%', '20%']);
  const quoteScale = useTransform(quoteScroll, [0, 0.5, 1], [0.96, 1, 1.02]);

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
        {/* 1. HERO -- Full-bleed with dramatic entrance  */}
        {/* ============================================ */}
        <section
          ref={heroRef}
          className="relative min-h-screen overflow-hidden flex items-center"
          style={{
            background:
              'linear-gradient(135deg, #2C2416 0%, #4A5D5A 35%, #3a4a3a 55%, #D4C4A8 85%, #D4AF37 100%)',
          }}
        >
          {/* Full-bleed background image with parallax + zoom */}
          <motion.div
            className="absolute inset-0 -top-[18%] -bottom-[18%]"
            style={
              prefersReducedMotion
                ? {}
                : { y: heroImageY, scale: heroImageScale }
            }
          >
            <Image
              src="/images/playa_camp.webp"
              alt="Camp Alborz at golden hour on the playa"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>

          {/* Multi-layered overlays for cinematic depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.08) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(44,36,22,0.4) 0%, transparent 40%)',
            }}
          />
          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 250px rgba(0,0,0,0.2)' }}
          />

          {/* Text content */}
          <motion.div
            className="relative z-10 px-8 md:px-16 lg:px-20 max-w-3xl"
            style={
              prefersReducedMotion
                ? {}
                : { opacity: heroOpacity, y: heroContentY }
            }
          >
            {/* Decorative line */}
            <motion.div
              className="w-12 h-px bg-white/40 mb-8"
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: easeOutExpo,
              }}
              style={{ transformOrigin: 'left' }}
            />

            <motion.p
              className="text-eyebrow mb-8 text-white/60"
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.25,
                ease: easeOutExpo,
              }}
            >
              501(c)(3) Music &amp; Arts Organization
            </motion.p>

            <motion.h1
              className="font-display text-5xl md:text-6xl lg:text-[5.5rem] font-normal leading-[0.92] tracking-tight mb-8 text-white"
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 30, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.4,
                ease: easeOutExpo,
              }}
            >
              Camp
              <br />
              <em
                className="italic"
                style={{ color: '#D4AF37' }}
              >
                Alborz
              </em>
            </motion.h1>

            <motion.p
              className="text-[15px] md:text-base leading-[1.85] max-w-[440px] mb-12 text-white/75"
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: 20 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.65,
                ease: easeOutExpo,
              }}
            >
              Where 3,000 years of Persian culture meets the radical
              spirit of the desert. Tea at dawn, fire at dusk, art
              through the night.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4 sm:gap-6"
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.85,
                ease: easeOutExpo,
              }}
            >
              <Link
                href="/donate"
                className="cta-primary"
                style={{
                  backgroundColor: 'white',
                  color: '#1a1a18',
                  borderColor: 'white',
                }}
              >
                <span>Support Our Art</span>
              </Link>
              <Link
                href="/about"
                className="cta-secondary"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <span>Our Story</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <span className="text-[11px] tracking-[0.3em] uppercase text-white/45">
              Scroll
            </span>
            <motion.div
              className="w-px h-8 bg-white/35 origin-top"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* 2. NUMBERS BAR -- Animated counters           */}
        {/* ============================================ */}
        <section
          className="border-t border-b"
          style={{ borderColor: 'var(--color-warm-border)' }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { value: '10', label: 'Burns & Counting' },
                { value: '150+', label: 'Alborzians' },
                { value: '2', label: 'Art Cars' },
                { value: '\u221E', label: 'Cups of Tea' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${i < 3 ? 'border-r' : ''}${
                    i < 2 ? ' max-md:border-b' : ''
                  }${
                    i === 1 || i === 2
                      ? ' max-md:border-r-0'
                      : ''
                  }`}
                  style={{
                    borderColor: 'var(--color-warm-border)',
                  }}
                >
                  <AnimatedStat
                    value={stat.value}
                    label={stat.label}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 2b. MEMBER TESTIMONIALS -- Voices from the Playa */}
        {/* ============================================ */}
        <section className="py-24 md:py-36">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            {(() => {
              const testimonials = [
                {
                  quote:
                    'Camp Alborz gave me a home on the playa. For the first time at Burning Man, I heard my grandmother\u2019s language over tea, watched fire dance to setar music, and felt like I truly belonged.',
                  name: 'Shirin Mohammadi',
                  playaName: 'Desert Rose',
                  years: '6 years',
                },
                {
                  quote:
                    'I came for the art cars and stayed for the family. There\u2019s something magical about building HOMA with people who understand both the engineering AND why the Simorgh matters.',
                  name: 'Dariush Tehrani',
                  playaName: 'Dari',
                  years: '4 years',
                },
                {
                  quote:
                    'As a first-generation Iranian-American, I struggled to connect with my heritage. Camp Alborz bridges two worlds \u2014 the radical self-expression of the playa and the deep hospitality of Persian culture.',
                  name: 'Leila Azari',
                  playaName: 'Moonlight',
                  years: '3 years',
                },
              ];
              const first = testimonials[0];
              const rest = testimonials.slice(1);
              return (
                <>
                  {/* First testimonial alongside section heading */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16 md:mb-20">
                    <Reveal>
                      <div>
                        <p className="text-eyebrow mb-4">Our Community</p>
                        <h2
                          className="font-accent text-3xl md:text-4xl tracking-wide"
                          style={{ color: '#2C2416' }}
                        >
                          Voices from the Playa
                        </h2>
                      </div>
                    </Reveal>

                    <div>
                      <span
                        className="font-display text-5xl leading-none mb-4 block"
                        style={{ color: 'var(--color-gold-muted)' }}
                        aria-hidden="true"
                      >
                        &ldquo;
                      </span>
                      <p
                        className="text-sm leading-[1.85] mb-6"
                        style={{ color: 'var(--color-ink-soft)' }}
                      >
                        {first.quote}
                      </p>
                      <div
                        className="h-px w-12 mb-4"
                        style={{ backgroundColor: 'var(--color-warm-border)' }}
                        aria-hidden="true"
                      />
                      <p
                        className="font-accent text-base tracking-wide"
                        style={{ color: '#2C2416' }}
                      >
                        {first.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-ink-faint)' }}
                      >
                        &ldquo;{first.playaName}&rdquo;
                        <span className="mx-2" aria-hidden="true">&#183;</span>
                        {first.years}
                      </p>
                    </div>
                  </div>

                  {/* Remaining testimonials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                    {rest.map((testimonial) => (
                      <div key={testimonial.name}>
                        <span
                          className="font-display text-5xl leading-none mb-4 block"
                          style={{ color: 'var(--color-gold-muted)' }}
                          aria-hidden="true"
                        >
                          &ldquo;
                        </span>
                        <p
                          className="text-sm leading-[1.85] mb-6"
                          style={{ color: 'var(--color-ink-soft)' }}
                        >
                          {testimonial.quote}
                        </p>
                        <div
                          className="h-px w-12 mb-4"
                          style={{ backgroundColor: 'var(--color-warm-border)' }}
                          aria-hidden="true"
                        />
                        <p
                          className="font-accent text-base tracking-wide"
                          style={{ color: '#2C2416' }}
                        >
                          {testimonial.name}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: 'var(--color-ink-faint)' }}
                        >
                          &ldquo;{testimonial.playaName}&rdquo;
                          <span className="mx-2" aria-hidden="true">&#183;</span>
                          {testimonial.years}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </section>

        {/* ============================================ */}
        {/* 2c. COMMUNITY IMPACT -- By the Numbers        */}
        {/* ============================================ */}
        <section
          className="py-24 md:py-36"
          style={{ backgroundColor: 'var(--color-cream-warm)' }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center mb-16">
                <p className="text-eyebrow mb-4">Our Impact</p>
                <h2
                  className="font-accent text-3xl md:text-4xl tracking-wide mb-6"
                  style={{ color: '#2C2416' }}
                >
                  A Community Without Borders
                </h2>
                <p
                  className="text-sm max-w-xl mx-auto leading-[1.85]"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  From Tehran to Black Rock City, our community spans
                  continents and generations &mdash; united by a shared
                  love of Persian art, radical hospitality, and creative
                  expression.
                </p>
              </div>
            </Reveal>

            <div
              className="border-t border-b flex flex-wrap md:flex-nowrap"
              style={{ borderColor: 'var(--color-warm-border)' }}
            >
              {[
                { value: '50+', label: 'Active Members' },
                { value: '12+', label: 'Countries Represented' },
                { value: '8', label: 'Art Installations Built' },
                { value: '$150K+', label: 'Raised for Arts & Culture' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex-1 py-10 md:py-14 text-center${
                    i < 3 ? ' border-r' : ''
                  }${i < 2 ? ' max-md:border-b' : ''}${
                    i === 1 ? ' max-md:border-r-0' : ''
                  } min-w-[50%] md:min-w-0`}
                  style={{ borderColor: 'var(--color-warm-border)' }}
                >
                  <p
                    className="font-display text-3xl md:text-4xl font-light tracking-wide mb-2"
                    style={{ color: 'var(--color-terracotta)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs tracking-[0.15em] uppercase"
                    style={{ color: 'var(--color-ink-faint)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div
          className="h-px"
          style={{
            backgroundColor: 'var(--color-warm-border)',
          }}
        />

        {/* ============================================ */}
        {/* 3. STORY SECTION -- Who We Are                */}
        {/* ============================================ */}
        <section className="py-24 md:py-36">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-20">
              {/* Left label */}
              <Reveal direction="left">
                <div>
                  <p
                    className="font-display text-8xl md:text-9xl font-light tracking-wide opacity-[0.05] leading-none mb-3"
                    aria-hidden="true"
                  >
                    01
                  </p>
                  <p className="text-eyebrow">Our Story</p>
                </div>
              </Reveal>

              {/* Right content */}
              <div>
                <Reveal delay={0.1}>
                  <h2
                    className="font-accent text-2xl md:text-3xl lg:text-[2.75rem] tracking-wide leading-snug mb-10"
                    style={{ color: '#2C2416' }}
                  >
                    Born from the mountains.
                    <br className="hidden md:block" />
                    Built for the desert.
                  </h2>
                </Reveal>

                <Reveal delay={0.2}>
                  <div
                    className="space-y-6 text-[15px] leading-[1.85]"
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    <p className="drop-cap">
                      Alborz is a 501(c)(3) non-profit music and arts
                      organization, supporting an inclusive and diverse
                      community of performers and artists through
                      events, partnerships, and community involvement.
                      We were founded to celebrate Persian culture
                      worldwide &mdash; through music, food, and art.
                      The legendary hospitality, none of the pretense.
                    </p>
                    <p>
                      Many of us live far away from our ancestral
                      lands, but we share the best parts of our
                      cultural heritage with one another and the
                      broader community. We gather all over the globe
                      but coalesce around our love for hosting new and
                      old friends at our home &mdash; Black Rock City.
                    </p>
                  </div>
                </Reveal>

                {/* Inline CTA */}
                <Reveal delay={0.3}>
                  <div className="mt-10">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 hover:text-terracotta group"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      Read our full story
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <div
          className="h-px"
          style={{
            backgroundColor: 'var(--color-warm-border)',
          }}
        />

        {/* ============================================ */}
        {/* 4. OFFERINGS -- What We Bring to the Playa    */}
        {/* ============================================ */}
        <section
          className="py-24 md:py-36"
          style={{
            backgroundColor: 'var(--color-cream-warm)',
          }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center mb-20">
                <p className="text-eyebrow mb-4">What We Bring</p>
                <h2
                  className="font-accent text-3xl md:text-4xl tracking-wide mb-4"
                  style={{ color: '#2C2416' }}
                >
                  Life at Camp Alborz
                </h2>
                <p
                  className="text-sm max-w-md mx-auto leading-relaxed"
                  style={{ color: 'var(--color-ink-faint)' }}
                >
                  From the first kettle at sunrise to the last beat at
                  4am, here is what you will find at our camp.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {offerings.map((item) => (
                  <div key={item.title} className="group text-center lg:text-left p-6 rounded-lg transition-all duration-400 hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-sm">
                    <div className="inline-flex mb-5 text-terracotta [&_svg]:w-8 [&_svg]:h-8">
                      {item.icon}
                    </div>
                    <h3 className="font-display text-lg tracking-wide mb-3">
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: 'var(--color-ink-soft)',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 5. RUMI QUOTE -- Immersive parallax moment    */}
        {/* ============================================ */}
        <section
          ref={quoteRef}
          className="relative py-32 md:py-44 overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, #FAF7F0 0%, #e8ddd0 30%, #D4C4A8 60%, #f3ebe0 100%)',
          }}
        >
          {/* Parallax background */}
          <motion.div
            className="absolute inset-0 -top-20 -bottom-20"
            style={prefersReducedMotion ? {} : { y: quoteBgY }}
          >
            <Image
              src="/images/hero_texture.webp"
              alt=""
              fill
              className="object-cover opacity-25"
              aria-hidden="true"
              sizes="100vw"
            />
          </motion.div>

          {/* Decorative concentric circles */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="w-[400px] h-[400px] border rounded-full opacity-[0.04]"
              style={{
                borderColor: 'var(--color-ink)',
              }}
            />
            <div
              className="absolute w-[550px] h-[550px] border rounded-full opacity-[0.03]"
              style={{
                borderColor: 'var(--color-ink)',
              }}
            />
          </div>

          <motion.div
            className="relative max-w-3xl mx-auto px-5 md:px-10 text-center"
            style={
              prefersReducedMotion ? {} : { scale: quoteScale }
            }
          >
            <Reveal direction="none">
              <div className="ornate-divider mb-12">
                <span
                  className="text-xs tracking-[0.4em] uppercase"
                  style={{
                    color: 'var(--color-gold-muted)',
                  }}
                >
                  &#10022;
                </span>
              </div>

              <blockquote>
                <p
                  className="font-accent text-2xl md:text-4xl lg:text-[2.75rem] leading-[1.4] mb-10"
                  style={{
                    color: '#2C2416',
                    textShadow:
                      '0 0 30px rgba(250, 247, 240, 0.6)',
                  }}
                >
                  &ldquo;
                  {rumiQuote?.text ||
                    "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there."}
                  &rdquo;
                </p>

                <footer>
                  <p
                    className="text-xs tracking-[0.35em] uppercase font-medium"
                    style={{ color: '#2C2416' }}
                  >
                    {rumiQuote?.attribution
                      ? rumiQuote.attribution
                          .split('\u00b7')[0]
                          .trim()
                      : 'Jalal ad-Din Rumi'}
                  </p>
                  {rumiQuote?.context && (
                    <p
                      className="text-xs mt-3 italic"
                      style={{ color: 'var(--color-ink-faint)' }}
                    >
                      {rumiQuote.context}
                    </p>
                  )}
                </footer>
              </blockquote>

              <div className="ornate-divider mt-12">
                <span
                  className="text-xs tracking-[0.4em] uppercase"
                  style={{
                    color: 'var(--color-gold-muted)',
                  }}
                >
                  &#10022;
                </span>
              </div>
            </Reveal>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* 6. FULL-BLEED CAMP IMAGE -- Parallax          */}
        {/* ============================================ */}
        <section
          ref={panoramaRef}
          className="relative w-full overflow-hidden"
          style={{
            height: 'clamp(300px, 50vw, 600px)',
            background:
              'linear-gradient(135deg, #4A5D5A 0%, #2C2416 40%, #D4AF37 70%, #D4C4A8 100%)',
          }}
        >
          <motion.div
            className="absolute inset-0 -top-[10%] -bottom-[10%]"
            style={
              prefersReducedMotion ? {} : { y: panoramaY }
            }
          >
            <Image
              src="/images/mirror_mosaic.webp"
              alt="Mirror mosaic art installation at Camp Alborz"
              fill
              className="object-cover"
              sizes="100vw"
              loading="lazy"
            />
          </motion.div>

          {/* Cinematic letterbox overlay */}
          <div className="absolute inset-0 z-10 bg-black/15" />
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              boxShadow:
                'inset 0 60px 80px -40px rgba(0,0,0,0.3), inset 0 -60px 80px -40px rgba(0,0,0,0.3)',
            }}
          />

          {/* Caption */}
          <div className="absolute bottom-6 right-8 z-20 text-right">
            <p
              className="text-[11px] tracking-[0.2em] uppercase text-white/55"
              style={{
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              Black Rock City
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* 7. ARTIST SPOTLIGHT                          */}
        {/* ============================================ */}
        <section className="py-24 md:py-36">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            {/* Header */}
            <Reveal>
              <div className="flex items-center justify-between pb-6 mb-14">
                <div>
                  <p className="text-eyebrow mb-2">
                    Inspiration
                  </p>
                  <h2
                    className="font-accent text-2xl md:text-3xl tracking-wide"
                    style={{ color: '#2C2416' }}
                  >
                    Artist Spotlight
                  </h2>
                </div>
                <Link
                  href="/art"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-colors hover:text-terracotta py-3 pl-3 group"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  View all
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </div>
            </Reveal>

            {/* Decorative line */}
            <div
              className="h-px mb-14 animate-draw-line"
              style={{
                backgroundColor: 'var(--color-warm-border)',
              }}
            />

            {/* Staggered 3-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_1fr] gap-8 md:gap-10">
              {artists.map((artist, i) => {
                const marginTop =
                  i === 0
                    ? 'mt-0'
                    : i === 1
                      ? 'md:mt-24'
                      : 'md:mt-10';

                return (
                    <article key={artist.number} className={`${marginTop} group`}>
                      {/* Image with hover zoom and fallback */}
                      <div
                        className="relative aspect-[3/4] overflow-hidden rounded-sm mb-6 image-hover-zoom"
                        style={{
                          backgroundColor:
                            'var(--color-sage, #4A5D5A)',
                        }}
                      >
                        <ArtistImage artist={artist} />
                        {/* Gradient overlay on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background:
                              'linear-gradient(to top, rgba(var(--color-ink-rgb), 0.3) 0%, transparent 50%)',
                          }}
                        />
                      </div>

                      {/* Number */}
                      <p
                        className="text-xs tracking-[0.15em] mb-2 font-medium"
                        style={{
                          color: 'var(--color-terracotta)',
                        }}
                      >
                        {artist.number}
                      </p>

                      {/* Name */}
                      <h3 className="font-accent text-xl md:text-2xl mb-1.5">
                        {artist.name}
                      </h3>

                      {/* Medium */}
                      <p
                        className="text-[11px] tracking-[0.12em] uppercase mb-1"
                        style={{
                          color: 'var(--color-ink-faint)',
                        }}
                      >
                        {artist.medium}
                      </p>

                      {/* Era */}
                      <p
                        className="text-xs mb-4"
                        style={{
                          color: 'var(--color-ink-faint)',
                        }}
                      >
                        {artist.era}
                      </p>

                      {/* Bio */}
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: 'var(--color-ink-soft)',
                        }}
                      >
                        {artist.bio}
                      </p>
                    </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 8. MOUNTAIN DIVIDER -- Parallax               */}
        {/* ============================================ */}
        <div
          className="relative w-full h-48 md:h-56 overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, var(--color-cream) 0%, #4A5D5A 30%, #2C2416 60%, var(--color-cream) 100%)',
          }}
        >
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
              background:
                'linear-gradient(to bottom, var(--color-cream) 0%, transparent 30%, transparent 70%, var(--color-cream) 100%)',
            }}
          />
        </div>

        {/* ============================================ */}
        {/* 8b. GET INVOLVED -- Find Your Place            */}
        {/* ============================================ */}
        <section className="py-24 md:py-36">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center mb-20">
                <p className="text-eyebrow mb-4">Get Involved</p>
                <h2
                  className="font-accent text-3xl md:text-4xl tracking-wide"
                  style={{ color: '#2C2416' }}
                >
                  Find Your Place in Camp Alborz
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {[
                {
                  title: 'Join as a Member',
                  description:
                    'Bring your talents, passion, and curiosity. No experience required \u2014 just an open heart.',
                  href: '/apply',
                  linkText: 'Apply Now',
                },
                {
                  title: 'Support Our Art',
                  description:
                    'Help us bring Persian art and culture to the playa. Every contribution fuels the fire.',
                  href: '/donate',
                  linkText: 'Donate',
                },
                {
                  title: 'Explore Our Culture',
                  description:
                    'Discover the traditions, music, and stories that make Camp Alborz unique.',
                  href: '/culture',
                  linkText: 'Learn More',
                },
              ].map((pathway) => (
                  <Link key={pathway.title} href={pathway.href} className="block group h-full">
                    <div
                      className="luxury-card p-8 md:p-10 h-full flex flex-col text-center transition-all duration-300 group-hover:shadow-lg"
                      style={{
                        borderTop: '2px solid var(--color-gold-muted)',
                      }}
                    >
                      {/* Diamond accent */}
                      <span
                        className="text-xs mb-6 block"
                        style={{ color: 'var(--color-gold-muted)' }}
                        aria-hidden="true"
                      >
                        &#9670;
                      </span>

                      <h3
                        className="font-accent text-xl md:text-2xl tracking-wide mb-4 transition-colors duration-300 group-hover:text-terracotta"
                        style={{ color: '#2C2416' }}
                      >
                        {pathway.title}
                      </h3>

                      <p
                        className="text-sm leading-[1.85] flex-1 mb-8"
                        style={{ color: 'var(--color-ink-soft)' }}
                      >
                        {pathway.description}
                      </p>

                      <span
                        className="inline-flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 group-hover:text-terracotta"
                        style={{ color: 'var(--color-ink-soft)' }}
                      >
                        {pathway.linkText}
                        <span
                          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          &rarr;
                        </span>
                      </span>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 9. CTA SECTION -- 2026 Season                 */}
        {/* ============================================ */}
        <section className="section-contrast py-28 md:py-40 relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 pattern-persian opacity-[0.03] pointer-events-none" />

          <div className="max-w-2xl mx-auto px-5 md:px-10 text-center relative">
            <Reveal direction="none">
              <div className="ornate-divider mb-8">
                <span
                  className="text-xs tracking-[0.4em]"
                  style={{
                    color: 'var(--color-gold-muted)',
                  }}
                >
                  &#10022;
                </span>
              </div>
            </Reveal>

            <Reveal>
              <p
                className="text-eyebrow mb-6"
                style={{
                  color: 'var(--color-gold-muted)',
                }}
              >
                2026 Season
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-[3.25rem] tracking-wide leading-snug mb-6"
                style={{ color: 'var(--color-cream)' }}
              >
                The Playa Is Calling
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                className="font-accent text-lg md:text-xl leading-relaxed mb-12 max-w-lg mx-auto"
                style={{
                  color: 'rgba(250, 247, 240, 0.75)',
                }}
              >
                Bring your spirit, your curiosity, and your
                appetite. We&apos;ll bring the tea, the music, and
                the fire. Come home to Black Rock City with us.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/apply"
                  className="cta-primary text-sm"
                  style={{
                    backgroundColor: 'var(--color-gold)',
                    color: 'var(--color-ink)',
                    border: 'none',
                  }}
                >
                  <span>Apply to Join</span>
                </Link>
                <Link
                  href="/donate"
                  className="cta-secondary text-sm"
                  style={{
                    color: 'var(--color-cream)',
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  <span>Support the Art</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <div
          className="h-px"
          style={{
            backgroundColor: 'var(--color-warm-border)',
          }}
        />

        {/* ============================================ */}
        {/* 10. FAQ SECTION                              */}
        {/* ============================================ */}
        <section
          className="py-24 md:py-36"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="flex items-end justify-between mb-14">
                <div>
                  <p className="text-eyebrow mb-2">
                    Common Questions
                  </p>
                  <h2
                    id="faq-heading"
                    className="font-accent text-2xl md:text-3xl tracking-wide"
                    style={{ color: '#2C2416' }}
                  >
                    Questions &amp; Answers
                  </h2>
                </div>
              </div>
            </Reveal>

            <div
              className="h-px mb-12"
              style={{
                backgroundColor: 'var(--color-warm-border)',
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-14">
              {campQAs.map(({ question, answer }) => (
                  <div key={question} className="group">
                    <h3
                      className="font-accent text-lg md:text-xl mb-3 transition-colors duration-300 group-hover:text-terracotta"
                      style={{ color: '#2C2416' }}
                    >
                      {question}
                    </h3>
                    <p
                      className="text-sm leading-[1.85]"
                      style={{ color: '#3d3426' }}
                    >
                      {answer}
                    </p>
                  </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <Reveal delay={0.2}>
              <div className="mt-16 pt-12 border-t text-center" style={{ borderColor: 'var(--color-warm-border)' }}>
                <p
                  className="text-sm mb-4"
                  style={{ color: 'var(--color-ink-faint)' }}
                >
                  Have more questions?
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 hover:text-terracotta group"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  Learn more about us
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
