'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../../../components/reveal';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Volume2, Zap, Flame, Users, Wrench } from 'lucide-react';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomaPage() {
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(heroProgress, [0, 1], ['0%', '25%']);
  const backgroundScale = useTransform(heroProgress, [0, 1], [1, 1.1]);
  const textY = useTransform(heroProgress, [0, 1], ['0%', '12%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero -- Full viewport, dramatic reveal */}
      <section ref={heroRef} className="relative min-h-hero overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY, scale: backgroundScale }}
        >
          <Image
            src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
            alt="HOMA art car illuminated at night on the playa, inspired by the mythological Homa Bird"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAAFERIGEyExQXH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AxXS9Ks6lqMdWGeSNZFZjJxBKgAnz+5t9LoFfQ4BVhtTzxqSFeQgFx9yScYyLZwBXJM//2Q=="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-cream), transparent 35%, transparent)' }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-10 z-[1]" />

        <motion.div
          className="relative z-10 section-contained text-center py-24"
          style={{ y: textY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/art"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-10"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Art
            </Link>
          </motion.div>

          <motion.p
            className="text-eyebrow mb-4"
            style={{ color: 'var(--color-terracotta)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            ART CAR 001
          </motion.p>
          <motion.h1
            className="font-display tracking-tight text-white drop-shadow-lg mb-4"
            style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 0.9, letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            HOMA
          </motion.h1>
          <motion.p
            className="font-accent text-xl md:text-2xl italic text-white/85 max-w-2xl mx-auto mt-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Risen from the ashes, inspired by the mythological Homa Bird
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />

          {/* Scroll indicator */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 mx-auto rounded-full border-2 border-white/25 flex items-start justify-center p-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/50"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Opening story -- Magazine editorial layout */}
      <section ref={storyRef} className="py-24 md:py-32">
        <div className="section-contained">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Text column */}
            <div className="lg:col-span-7">
              <Reveal direction="left">
                <p className="text-eyebrow mb-6">THE ORIGIN</p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-wide mb-8" style={{ color: 'var(--color-ink)' }}>
                  A Beast Reborn
                </h2>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="space-y-6" style={{ color: 'var(--color-ink-soft)' }}>
                  <p className="drop-cap text-lg leading-relaxed font-editorial">
                    Homa is the latest Art Car at Camp Alborz. Taking cue from the spirit of the mythological Homa Bird, it is a beautiful beast that has risen from the ashes of its previous life as a competitive racing mud truck. As fate would have it, 2023 was the right year to show up to the playa with a mud truck!
                  </p>
                  <p className="text-body-relaxed">
                    For 2024 the team cooked up some special vocal chords, worthy of this beast. The Huma bird is a mythical bird of Persian legends and fables, and continuing as a common motif in Persian art and culture. Like the phoenix, it is said to never alight on the ground, and its shadow is said to be auspicious.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Side detail card */}
            <div className="lg:col-span-5">
              <Reveal delay={0.25} direction="right">
                <div
                  className="p-8 rounded-xl border relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'rgba(var(--color-terracotta-rgb),0.15)',
                  }}
                >
                  <div className="absolute inset-0 pattern-persian opacity-[0.03]" />
                  <div className="relative z-10">
                    <Flame className="h-8 w-8 mb-4" style={{ color: 'var(--color-terracotta)' }} />
                    <h3 className="font-display text-xl mb-3">From Mud Truck to Art Car</h3>
                    <p className="text-body-relaxed text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                      A competitive racing mud truck found its second life as HOMA -- proof that rebirth is the ultimate creative act.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-terracotta)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Previous life: racing mud truck</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-terracotta)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Playa debut: Burning Man 2023</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-terracotta)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>2024 upgrade: custom sound system</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width image break */}
      <Reveal>
        <div className="relative aspect-[21/9] md:aspect-[3/1]">
          <Image
            src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
            alt="HOMA art car illuminated with LED lights on the playa at night"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="section-contained">
              <p className="font-accent text-white/80 text-sm italic">HOMA on the playa, illuminated at night</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Specifications -- Dark contrast section with large numbers */}
      <section className="section-contrast py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <p className="text-eyebrow" style={{ color: 'var(--color-terracotta)' }}>
                SPECIFICATIONS
              </p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-cream)' }}>
                The Beast
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, label: 'Debut', value: '2023', detail: 'Burning Man' },
              { icon: MapPin, label: 'Home', value: 'BRC', detail: 'Black Rock City, NV' },
              { icon: Volume2, label: 'Sound', value: 'Custom', detail: 'Playa-ready system' },
              { icon: Zap, label: 'Origin', value: 'Reborn', detail: 'From racing mud truck' },
            ].map((spec, index) => (
              <Reveal key={spec.label} delay={index * 0.1}>
                <div className="text-center">
                  <div
                    className="inline-flex p-4 rounded-full border mb-5"
                    style={{
                      borderColor: 'rgba(var(--color-terracotta-rgb),0.25)',
                      backgroundColor: 'rgba(var(--color-terracotta-rgb),0.08)',
                    }}
                  >
                    <spec.icon className="h-5 w-5" style={{ color: 'var(--color-terracotta)' }} />
                  </div>
                  <p className="text-caption mb-2" style={{ color: 'rgba(var(--color-cream-rgb),0.5)' }}>{spec.label}</p>
                  <p
                    className="font-display text-3xl md:text-4xl mb-1"
                    style={{ color: 'var(--color-cream)' }}
                  >
                    {spec.value}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(var(--color-cream-rgb),0.5)' }}>{spec.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Mythology -- Immersive quote section */}
      <section className="py-24 md:py-36 relative overflow-hidden" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="absolute inset-0 pattern-persian opacity-[0.04]" />

        <div className="section-contained relative z-10">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-eyebrow mb-10">THE MYTHOLOGY</p>

              {/* Large decorative quotation mark */}
              <div
                className="font-display text-[120px] md:text-[180px] leading-none opacity-10 select-none mb-[-60px] md:mb-[-90px]"
                style={{ color: 'var(--color-terracotta)' }}
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <blockquote className="relative">
                <p
                  className="font-accent text-2xl md:text-3xl lg:text-4xl italic leading-snug"
                  style={{ color: 'var(--color-ink)' }}
                >
                  The Huma bird is a mythical creature of Persian legends and fables. Like the phoenix, it is said to never alight on the ground, and its shadow is said to be auspicious.
                </p>
              </blockquote>

              <div className="ornate-divider mt-10" />

              <p className="text-body-relaxed mt-8 max-w-2xl mx-auto text-base" style={{ color: 'var(--color-ink-soft)' }}>
                In Persian mythology, it was believed that the Huma bird could never be caught, and that anyone who spotted its shadow would be blessed with great fortune. This spirit of the untouchable, the eternally soaring, drives the soul of our art car.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery -- Magazine-style masonry */}
      <section className="py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="space-y-4 mb-14">
              <p className="text-eyebrow">ON THE PLAYA</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-ink)' }}>
                Gallery
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large main image */}
            <Reveal className="md:col-span-8" delay={0}>
              <div className="image-frame image-grain image-hover-zoom relative aspect-[16/10]">
                <Image
                  src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
                  alt="HOMA art car illuminated with LED lights on the playa at night"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
            </Reveal>

            {/* Side column with stacked images */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <Reveal delay={0.15} direction="right">
                <div className="image-frame image-grain image-hover-zoom relative aspect-[4/3]">
                  <Image
                    src="/images/migrated/art/193f4a3f0015480546bb78faa7650751.jpg"
                    alt="Camp Alborz art installation detail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Reveal>
              <Reveal delay={0.25} direction="right">
                <div className="image-frame image-grain image-hover-zoom relative aspect-[4/3]">
                  <Image
                    src="/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.jpg"
                    alt="Camp Alborz community at the playa"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Reveal>
            </div>
          </div>

          {/* Second row -- wide panoramic */}
          <Reveal delay={0.2} className="mt-4">
            <div className="image-frame image-grain image-hover-zoom relative aspect-[21/7]">
              <Image
                src="/images/migrated/alborz/e4956d45216d473ca35c279237d61592.jpg"
                alt="Panoramic view of Camp Alborz and HOMA on the playa"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* CTA Section */}
      <Reveal>
        <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
          <div className="section-contained">
            <div className="frame-panel text-center space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 pattern-persian opacity-[0.03]" />
              <div className="relative z-10">
                <p className="text-eyebrow">GET INVOLVED</p>
                <h2 className="font-accent text-2xl md:text-3xl tracking-wide mt-4" style={{ color: 'var(--color-ink)' }}>
                  Help HOMA Take Flight
                </h2>
                <p className="text-body-relaxed text-base max-w-2xl mx-auto mt-4" style={{ color: 'var(--color-ink-soft)' }}>
                  Whether you can weld, wire, paint, or just want to lend a hand at a build party, there is room on the crew. Your support keeps HOMA roaming the playa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link href="/donate" className="cta-primary cta-shimmer">
                    <span>Support the Build</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link href="/art/damavand" className="cta-secondary">
                    <span>Meet DAMAVAND</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
