'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, Snowflake, Sprout, Sun, Leaf } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Stagger animation variants                                         */
/* ------------------------------------------------------------------ */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/*  Counter component for stats strip                                  */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const isInView = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      onViewportEnter={() => {
        if (isInView.current) return;
        isInView.current = true;
        const duration = 1200;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayed(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
    >
      {displayed}{suffix}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline section (extracted for cleanliness)                       */
/* ------------------------------------------------------------------ */
function TimelineSection({ about }: { about: NonNullable<ReturnType<typeof useContentConfig>['about']> }) {
  return (
    <section className="py-28 md:py-36 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pattern-persian opacity-[0.03]" />

      <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
        <Reveal>
          <div className="space-y-4 mb-16 text-center">
            <p className="text-eyebrow">TIMELINE</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Our Journey
            </h2>
            <p className="text-body-relaxed text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
              Nearly two decades of building community, art, and hospitality on the playa and beyond.
            </p>
          </div>
        </Reveal>

        <div className="ornate-divider mb-16" />

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div
            className="absolute left-3 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px"
            style={{ backgroundColor: 'var(--color-warm-border)' }}
          />

          <div className="space-y-10">
            {about.timeline.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative flex items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Dot */}
                <div className="absolute left-3 md:left-1/2 -translate-x-1/2 top-1 z-10">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                  />
                </div>

                {/* Content */}
                <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-14' : 'md:pl-14'}`}>
                  <p
                    className="font-display text-sm tracking-[0.2em] mb-1"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {milestone.year}
                  </p>
                  <p className="text-body-relaxed text-base" style={{ color: 'var(--color-ink-soft)' }}>
                    {milestone.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main About Page                                                    */
/* ------------------------------------------------------------------ */
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

      {/* ============================================================ */}
      {/*  HERO SECTION - Immersive parallax                           */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.webp"
            alt="Camp Alborz community members gathering at night under string lights in Black Rock City"
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQZBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEEQ/AKWkWq6bCJH3G4kOZGJ5OOwPgGtItdOS8gFwlw8Mb5CJGQAM9kj81UtJNxp9pcNazyW5ljV2MTlSR8yKn/lKU4x//9k="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 text-center py-24"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ y: 14, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            OUR STORY
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 24, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {about.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 14, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {about.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-10"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  IMPACT STATS STRIP                                          */}
      {/* ============================================================ */}
      <section
        className="relative z-20 -mt-12"
        style={{ perspective: '1000px' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden shadow-xl"
            style={{ border: '1px solid var(--color-warm-border)' }}
          >
            {[
              { value: 15, suffix: '+', label: 'Years on Playa' },
              { value: 500, suffix: '+', label: 'Community Members' },
              { value: 2, suffix: '', label: 'Art Cars Built' },
              { value: 20, suffix: '+', label: 'Events Per Year' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center py-6 px-4"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <p className="font-display text-2xl md:text-3xl mb-1" style={{ color: 'var(--color-gold)' }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-caption text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MISSION - Editorial storytelling                            */}
      {/* ============================================================ */}
      <section className="py-28 md:py-36">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left column - heading & image */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <Reveal direction="left">
                <p className="text-eyebrow mb-4">OUR MISSION</p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1] mb-8" style={{ color: 'var(--color-ink)' }}>
                  {about.mission.title}
                </h2>
              </Reveal>

              <Reveal direction="left" delay={0.15}>
                <div className="image-frame relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src="/images/migrated/alborz/e4956d45216d473ca35c279237d61592.webp"
                    alt="Camp Alborz tea house and gathering space with traditional Persian decor"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="image-grain" />
                </div>
              </Reveal>
            </div>

            {/* Right column - narrative text */}
            <div className="lg:col-span-7 space-y-8">
              {about.mission.paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={index * 0.1}>
                  <p
                    className={`text-body-relaxed text-base md:text-lg leading-[1.85] ${index === 0 ? 'drop-cap font-accent text-lg md:text-xl' : ''}`}
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}

              <Reveal delay={0.3}>
                <blockquote className="blockquote-elegant my-10">
                  <p className="font-accent text-xl md:text-2xl leading-relaxed italic" style={{ color: 'var(--color-ink)', opacity: 0.85 }}>
                    &ldquo;A good name is better than a golden girdle.&rdquo;
                  </p>
                  <footer className="mt-4 text-caption tracking-widest uppercase text-xs" style={{ color: 'var(--color-gold)' }}>
                    Persian Proverb
                  </footer>
                </blockquote>
              </Reveal>

              <Reveal delay={0.35}>
                <p className="text-body-relaxed text-base md:text-lg leading-[1.85]" style={{ color: 'var(--color-ink-soft)' }}>
                  Named after the mountain range that stretches across northern Iran, Camp Alborz channels the spirit of elevation -- reaching higher together. Every cup of tea we pour, every art car we weld, every sunrise DJ set is an act of radical hospitality rooted in thousands of years of Persian tradition.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* ============================================================ */}
      {/*  VALUES - Alternating contrast section                       */}
      {/* ============================================================ */}
      <section className="section-contrast py-28 md:py-36 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pattern-persian opacity-[0.04]" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }}
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>OUR VALUES</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mt-4" style={{ color: 'var(--color-cream)' }}>
                What Drives Us
              </h2>
              <p className="font-accent text-lg md:text-xl mt-4 max-w-xl mx-auto" style={{ color: 'rgba(var(--color-cream-rgb), 0.7)' }}>
                The principles that shape everything we build
              </p>
            </div>
          </Reveal>

          {/* Feature value -- large card */}
          {about.values.length > 0 && (() => {
            const firstValue = about.values[0];
            const FirstIcon = getIcon(firstValue.icon);
            return (
              <Reveal direction="up" className="mb-10">
                <div
                  className="rounded-2xl p-10 md:p-14 relative overflow-hidden"
                  style={{
                    border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                    background: 'linear-gradient(135deg, rgba(var(--color-gold-rgb), 0.08), rgba(255,255,255,0.03))',
                  }}
                >
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    <FirstIcon className="h-12 w-12 flex-shrink-0" style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl mb-4" style={{ color: 'var(--color-cream)' }}>
                        {firstValue.title}
                      </h3>
                      <p className="text-body-relaxed text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                        {firstValue.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })()}

          {/* Remaining values -- grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {about.values.slice(1).map((value) => {
              const ValueIcon = getIcon(value.icon);

              return (
                <div
                  key={value.title}
                  className="rounded-2xl p-8 h-full"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <ValueIcon className="h-9 w-9 mb-6" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                  <h3 className="font-display text-xl mb-3" style={{ color: 'var(--color-cream)' }}>
                    {value.title}
                  </h3>
                  <p className="text-body-relaxed text-sm leading-relaxed" style={{ color: 'rgba(var(--color-cream-rgb), 0.75)' }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TIMELINE                                                    */}
      {/* ============================================================ */}
      <TimelineSection about={about} />

      {/* ============================================================ */}
      {/*  HOW WE BUILD TOGETHER - Camp year cycle                     */}
      {/* ============================================================ */}
      <section className="section-contrast py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pattern-persian opacity-[0.04]" />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }}
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>THE COLLECTIVE</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mt-4" style={{ color: 'var(--color-cream)' }}>
                How We Build Together
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="font-accent text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed mb-16" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
              Camp Alborz isn&rsquo;t built by a few people&nbsp;&mdash; it&rsquo;s built by everyone. Every year, dozens of hands come together to raise structures, wire art cars, prepare meals, and create something none of us could build alone. Here&rsquo;s what a year in the life of Camp Alborz looks like.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Snowflake,
                season: 'Winter',
                months: 'Jan \u2013 Mar',
                title: 'Planning & Dreaming',
                description: 'We gather in living rooms and video calls to plan the coming year. What will HOMA become? What new art should we build? What traditions will we keep?',
              },
              {
                icon: Sprout,
                season: 'Spring',
                months: 'Apr \u2013 Jun',
                title: 'Building & Fundraising',
                description: 'Warehouse weekends begin. Art car maintenance, new projects take shape, fundraisers bring the community together off-playa.',
              },
              {
                icon: Sun,
                season: 'Summer',
                months: 'Jul \u2013 Aug',
                title: 'Build Week & Burn',
                description: 'The magic week. We arrive early, build camp from dust, and for seven days live the community we\u2019ve spent all year creating.',
              },
              {
                icon: Leaf,
                season: 'Fall',
                months: 'Sep \u2013 Dec',
                title: 'Reflection & Gratitude',
                description: 'We decompress, share photos and stories, celebrate at our annual Yalda gathering, and start dreaming about next year.',
              },
            ].map((item) => {
              const SeasonIcon = item.icon;
              return (
                <div
                  key={item.season}
                  className="rounded-2xl p-8 h-full"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <SeasonIcon className="h-9 w-9 mb-6" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                  <p
                    className="text-xs tracking-[0.15em] uppercase font-medium mb-2"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {item.season} &middot; {item.months}
                  </p>
                  <h3 className="font-display text-xl mb-3" style={{ color: 'var(--color-cream)' }}>
                    {item.title}
                  </h3>
                  <p className="text-body-relaxed text-sm leading-relaxed" style={{ color: 'rgba(var(--color-cream-rgb), 0.75)' }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TEAM - Magazine-style layout                                */}
      {/* ============================================================ */}
      <section className="py-28 md:py-36 relative" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="absolute inset-0 pattern-persian opacity-[0.02]" />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-eyebrow">THE CREW</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mt-4" style={{ color: 'var(--color-ink)' }}>
                Our Leadership
              </h2>
              <p className="font-accent text-lg mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                The people who keep the tea flowing and the art cars rolling
              </p>
            </div>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {about.team.map((member, index) => (
              <motion.div key={member.name} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(26, 26, 24, 0.12)' }}
                  className="luxury-card text-center group h-full"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-gold-muted), var(--color-sage))',
                    }}
                  >
                    <span className="text-2xl font-display text-white relative z-10">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg mb-1" style={{ color: 'var(--color-ink)' }}>
                    {member.name}
                  </h3>
                  <p
                    className="text-xs tracking-[0.15em] uppercase mb-4 font-medium"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {member.role}
                  </p>
                  <p className="text-body-relaxed text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                    {member.bio}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  JOIN THE STORY - Community invitation & testimonials         */}
      {/* ============================================================ */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pattern-persian opacity-[0.03]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }}
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
            {/* Left column -- heading & intro */}
            <div className="lg:col-span-5">
              <Reveal>
                <p className="text-eyebrow mb-4">COMMUNITY</p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
                  Every Member Has a Story
                </h2>
                <p className="text-body-relaxed text-base md:text-lg leading-[1.85] mt-6" style={{ color: 'var(--color-ink-soft)' }}>
                  Camp Alborz started with a handful of friends who wanted to share Persian culture on the playa. Today we&rsquo;re 50+ members from 12+ countries&nbsp;&mdash; engineers and artists, students and professors, first-timers and decade veterans.
                </p>
              </Reveal>
            </div>

            {/* Right column -- testimonials stacked */}
            <div className="lg:col-span-7 space-y-10">
              {[
                {
                  quote: 'I showed up knowing nobody. By Wednesday, I had a playa name and 30 new siblings.',
                  attribution: 'First-year member',
                  featured: true,
                },
                {
                  quote: 'Building HOMA in 110\u00B0F heat with people who get why the Simorgh matters \u2014 that\u2019s my happy place.',
                  attribution: 'Art crew lead',
                  featured: false,
                },
                {
                  quote: 'My kids now ask every year: \u201CWhen do we go home to the desert?\u201D',
                  attribution: 'Camp Alborz family',
                  featured: false,
                },
              ].map((item, index) => (
                <blockquote key={index} className={index === 0 ? '' : ''}>
                  <p
                    className={`font-accent italic leading-relaxed ${index === 0 ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}
                    style={{ color: 'var(--color-ink)', opacity: 0.85 }}
                  >
                    <span className="font-display text-3xl mr-1 not-italic" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true">&ldquo;</span>
                    {item.quote}&rdquo;
                  </p>
                  <hr
                    className="my-4 border-0 h-px w-16"
                    style={{ backgroundColor: 'var(--color-warm-border)' }}
                  />
                  <footer className="text-caption text-xs tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                    {item.attribution}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <Reveal>
            <div className="text-center">
              <Link href="/apply" className="cta-primary cta-shimmer">
                <span>Become Part of the Story</span>
                <span><ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* ============================================================ */}
      {/*  FULL-WIDTH IMAGE BREAK                                      */}
      {/* ============================================================ */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/images/playa_camp.webp"
            alt="Panoramic view of Camp Alborz on the playa at golden hour"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Reveal>
            <blockquote className="text-center max-w-2xl mx-auto px-5">
              <p className="font-accent text-2xl md:text-3xl lg:text-4xl italic text-white leading-relaxed drop-shadow-lg">
                &ldquo;Out beyond ideas of wrongdoing and rightdoing, there is a field. I&rsquo;ll meet you there.&rdquo;
              </p>
              <footer className="mt-5 text-sm tracking-[0.2em] uppercase text-white/70">
                Rumi
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  501(c)(3) CTA SECTION                                       */}
      {/* ============================================================ */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--color-gold), transparent 70%)' }}
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)', border: '1px solid rgba(var(--color-gold-rgb), 0.2)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: 'var(--color-gold)' }}>
                  501(c)(3) Tax-Exempt Organization
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-6" style={{ color: 'var(--color-ink)' }}>
                {about.nonprofit.title}
              </h2>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-body-relaxed text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                {about.nonprofit.description}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/donate" className="cta-primary cta-shimmer">
                  <span>{about.nonprofit.cta.donate}</span>
                  <span><ArrowRight size={18} aria-hidden="true" /></span>
                </Link>
                <Link href="/apply" className="cta-secondary">
                  <span>{about.nonprofit.cta.join}</span>
                  <span><ArrowRight size={18} aria-hidden="true" /></span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
