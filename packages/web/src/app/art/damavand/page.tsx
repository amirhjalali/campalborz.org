'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../../../components/reveal';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Mountain, Wrench, Volume2, Users } from 'lucide-react';
import { useRef } from 'react';

export default function DamavandPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero Section -- Full viewport with mountain silhouette */}
      <section ref={heroRef} className="relative min-h-hero overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY, scale: backgroundScale }}
        >
          <Image
            src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.webp"
            alt="DAMAVAND art car on the playa at Burning Man, named after Mt. Damavand in the Alborz range"
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
        <div className="mountain-silhouette z-[2]" />

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
            style={{ color: 'var(--color-gold-muted)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            ART CAR 002
          </motion.p>
          <motion.h1
            className="font-display tracking-tight text-white drop-shadow-lg mb-4"
            style={{ fontSize: 'clamp(3.5rem, 11vw, 7.5rem)', lineHeight: 0.9, letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            DAMAVAND
          </motion.h1>
          <motion.p
            className="font-accent text-xl md:text-2xl italic text-white/85 max-w-2xl mx-auto mt-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Named after the highest peak in the Alborz range -- our first art car, our home on the move
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
      <section className="py-24 md:py-32">
        <div className="section-contained">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Text column */}
            <div className="lg:col-span-7">
              <Reveal direction="left">
                <p className="text-eyebrow mb-6">THE STORY</p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-wide mb-8" style={{ color: 'var(--color-ink)' }}>
                  Our Home Away From Home
                </h2>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="space-y-6" style={{ color: 'var(--color-ink-soft)' }}>
                  <p className="drop-cap text-lg leading-relaxed font-editorial">
                    Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move. In 2022 Damavand made its debut appearance on the playa.
                  </p>
                  <p className="text-body-relaxed">
                    That was a difficult year given the supply chain issues as well as so many natural and man-made challenges. The custom speakers made their first appearance in the dust. In 2023 we built resiliency into Damavand, continuing our tradition on Saturday night despite the rough conditions. In 2024 we had V3 of Damavand with a top made out of more mountainous materials.
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
                    borderColor: 'rgba(var(--color-gold-rgb),0.15)',
                  }}
                >
                  <div className="absolute inset-0 pattern-persian opacity-[0.03]" />
                  <div className="relative z-10">
                    <Mountain className="h-8 w-8 mb-4" style={{ color: 'var(--color-gold)' }} />
                    <h3 className="font-display text-xl mb-3">The Mountain Spirit</h3>
                    <p className="text-body-relaxed text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                      Named after the tallest peak in the Alborz range, Damavand carries the enduring spirit of the mountain onto the open playa.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Our first art car, debuted 2022</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Three generations of evolution</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Custom-built sound system</span>
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
            src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.webp"
            alt="DAMAVAND art car at Camp Alborz on the playa"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="section-contained">
              <p className="font-accent text-white/80 text-sm italic">Damavand on the playa, carrying the Alborz spirit</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Evolution Timeline -- Three generations with visual weight */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <p className="text-eyebrow">EVOLUTION</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-ink)' }}>
                Three Generations
              </h2>
              <p className="font-accent text-lg max-w-xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Each year, Damavand grows stronger
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                year: '2022',
                version: 'V1',
                title: 'The Debut',
                description: 'Damavand made its first appearance on the playa. Despite supply chain challenges and a difficult year, the custom speakers cut through the dust and the Alborz spirit roamed free.',
                highlight: 'First custom speakers',
              },
              {
                year: '2023',
                version: 'V2',
                title: 'Built for Resilience',
                description: 'We reinforced Damavand to handle the toughest playa conditions. When rough weather hit, we continued our Saturday night tradition without missing a beat.',
                highlight: 'Weatherproofed and hardened',
              },
              {
                year: '2024',
                version: 'V3',
                title: 'Mountain Top',
                description: 'A new top made from mountainous materials gave Damavand its most striking silhouette yet -- a rolling peak against the playa horizon.',
                highlight: 'New mountain-inspired silhouette',
              },
            ].map((era, index) => (
              <Reveal key={era.year} delay={index * 0.15}>
                <div className="luxury-card h-full flex flex-col">
                  {/* Version badge */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display text-sm"
                      style={{ backgroundColor: 'var(--color-gold)' }}
                    >
                      {era.version}
                    </div>
                    <div>
                      <span
                        className="font-display text-2xl"
                        style={{ color: 'var(--color-ink)' }}
                      >
                        {era.year}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-xl mb-3">{era.title}</h3>
                  <p className="text-body-relaxed text-sm mb-4 flex-1" style={{ color: 'var(--color-ink-soft)' }}>
                    {era.description}
                  </p>

                  {/* Highlight tag */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-wider self-start"
                    style={{
                      backgroundColor: 'rgba(var(--color-gold-rgb),0.1)',
                      color: 'var(--color-gold)',
                      border: '1px solid rgba(var(--color-gold-rgb),0.2)',
                    }}
                  >
                    <Wrench className="h-3 w-3" />
                    {era.highlight}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications -- Dark section with large values */}
      <section className="section-contrast py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                DETAILS
              </p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-wide" style={{ color: 'var(--color-cream)' }}>
                Specifications
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, label: 'Debut', value: '2022', detail: 'Burning Man' },
              { icon: MapPin, label: 'Home', value: 'BRC', detail: 'Black Rock City, NV' },
              { icon: Mountain, label: 'Namesake', value: '5,610m', detail: 'Mt. Damavand elevation' },
              { icon: Wrench, label: 'Iterations', value: '3', detail: 'Versions and counting' },
            ].map((spec, index) => (
              <Reveal key={spec.label} delay={index * 0.1}>
                <div className="text-center">
                  <div
                    className="inline-flex p-4 rounded-full border mb-5"
                    style={{
                      borderColor: 'rgba(var(--color-gold-rgb),0.25)',
                      backgroundColor: 'rgba(var(--color-gold-rgb),0.08)',
                    }}
                  >
                    <spec.icon className="h-5 w-5" style={{ color: 'var(--color-gold-muted)' }} />
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
                  src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.webp"
                  alt="DAMAVAND art car at Camp Alborz on the playa"
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
                    src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.webp"
                    alt="Camp Alborz community gathering"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Reveal>
              <Reveal delay={0.25} direction="right">
                <div className="image-frame image-grain image-hover-zoom relative aspect-[4/3]">
                  <Image
                    src="/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.webp"
                    alt="Camp Alborz on the playa at sunset"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Reveal>
            </div>
          </div>

          {/* Second row -- panoramic */}
          <Reveal delay={0.2} className="mt-4">
            <div className="image-frame image-grain image-hover-zoom relative aspect-[21/7]">
              <Image
                src="/images/migrated/alborz/e4956d45216d473ca35c279237d61592.webp"
                alt="Panoramic view of DAMAVAND and Camp Alborz"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* The Mountain Connection -- Immersive quote section */}
      <section className="py-24 md:py-36 relative overflow-hidden" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="absolute inset-0 pattern-persian opacity-[0.04]" />

        <div className="section-contained relative z-10">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-eyebrow mb-10">THE NAMESAKE</p>

              {/* Large decorative quotation mark */}
              <div
                className="font-display text-[120px] md:text-[180px] leading-none opacity-10 select-none mb-[-60px] md:mb-[-90px]"
                style={{ color: 'var(--color-gold)' }}
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <blockquote className="relative">
                <p
                  className="font-accent text-2xl md:text-3xl lg:text-4xl italic leading-snug"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Mt. Damavand stands at 5,610 meters -- the highest volcano in Asia and the tallest peak in the Alborz mountain range. It is a symbol of resistance and resilience in Persian mythology.
                </p>
              </blockquote>

              <div className="ornate-divider mt-10" />

              <p className="text-body-relaxed mt-8 max-w-2xl mx-auto text-base" style={{ color: 'var(--color-ink-soft)' }}>
                Just as the mountain endures through millennia, our art car carries the spirit of the Alborz out onto the open playa -- moving, gathering people, and creating moments together under the vast desert sky.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <Reveal>
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <div className="frame-panel text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 pattern-persian opacity-[0.03]" />
              <div className="relative z-10">
                <p className="text-eyebrow">GET INVOLVED</p>
                <h2 className="font-accent text-2xl md:text-3xl tracking-wide mt-4" style={{ color: 'var(--color-ink)' }}>
                  Help Build the Next Generation
                </h2>
                <p className="text-body-relaxed text-base max-w-2xl mx-auto mt-4" style={{ color: 'var(--color-ink-soft)' }}>
                  Damavand needs builders, welders, painters, and supporters every season. V4 is on the horizon -- be part of the next evolution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link href="/donate" className="cta-primary cta-shimmer">
                    <span>Support the Build</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link href="/art/homa" className="cta-secondary">
                    <span>Meet HOMA</span>
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
