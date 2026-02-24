'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '../../../components/navigation';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Mountain, Wrench } from 'lucide-react';
import { useRef } from 'react';

export default function DamavandPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <>
      <Navigation />
      <main className="bg-cream">
        {/* Hero Section with Parallax and Mountain Silhouette */}
        <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: backgroundY }}
          >
            <Image
              src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
              alt="DAMAVAND art car on the playa at Burning Man, named after Mt. Damavand in the Alborz range"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAAFERIGEyExQXH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AxXS9Ks6lqMdWGeSNZFZjJxBKgAnz+5t9LoFfQ4BVhtTzxqSFeQgFx9yScYyLZwBXJM//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
          </motion.div>

          <div className="absolute inset-0 pattern-persian opacity-15 z-[1]" />
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
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Art
              </Link>
            </motion.div>

            <motion.p
              className="text-display-wide text-xs tracking-[0.5em] text-white/80 mb-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              ART CAR
            </motion.p>
            <motion.h1
              className="text-optical-h1 tracking-tight text-white drop-shadow-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              DAMAVAND
            </motion.h1>
            <motion.p
              className="font-accent text-xl md:text-2xl italic text-white/90 max-w-2xl mx-auto"
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
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="section-base">
          <div className="section-contained">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-8">
                THE STORY
              </p>
              <div className="font-editorial text-lg text-ink-soft leading-relaxed space-y-6">
                <p>
                  Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move. In 2022 Damavand made its debut appearance on the playa.
                </p>
                <blockquote className="font-accent text-xl md:text-2xl italic text-ink/80 border-l-2 border-gold-500/40 pl-6 py-2 my-8 text-left">
                  Our home away from home -- our way to take the Alborz spirit on the move.
                </blockquote>
                <p>
                  That was a difficult year given the supply chain issues as well as so many natural and man-made challenges. The custom speakers made their first appearance in the dust. In 2023 we built resiliency into Damavand, continuing our tradition on Saturday night despite the rough conditions. In 2024 we had V3 of Damavand with a top made out of more mountainous materials.
                </p>
              </div>

              <div className="ornate-divider" />
            </div>
          </div>
        </section>

        {/* Evolution Timeline */}
        <section className="section-alt">
          <div className="section-contained">
            <div className="text-center space-y-4 mb-14">
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                EVOLUTION
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Three Generations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  year: '2022',
                  version: 'V1',
                  title: 'The Debut',
                  description: 'Damavand made its first appearance on the playa with custom speakers cutting through the dust.',
                },
                {
                  year: '2023',
                  version: 'V2',
                  title: 'Built for Resilience',
                  description: 'We reinforced Damavand to handle the toughest playa conditions, continuing our Saturday night tradition.',
                },
                {
                  year: '2024',
                  version: 'V3',
                  title: 'Mountain Top',
                  description: 'A new top made from mountainous materials gave Damavand its most striking silhouette yet.',
                },
              ].map((era) => (
                <div
                  key={era.year}
                  className="luxury-card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-display text-xs">
                      {era.version}
                    </div>
                    <span className="text-caption text-gold-600">{era.year}</span>
                  </div>
                  <h3 className="text-display-thin text-xl mb-3">{era.title}</h3>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {era.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="section-contrast">
          <div className="section-contained">
            <div className="text-center space-y-4 mb-10">
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                DETAILS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight text-tan-light">
                Specifications
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Debut', value: '2022' },
                { icon: MapPin, label: 'Home', value: 'Black Rock City' },
                { icon: Mountain, label: 'Namesake', value: 'Mt. Damavand' },
                { icon: Wrench, label: 'Iterations', value: '3 Versions' },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="text-center py-3"
                >
                  <spec.icon className="h-4 w-4 text-gold-400 mx-auto mb-2" />
                  <p className="text-caption text-tan-light/60 text-[10px] mb-0.5">{spec.label}</p>
                  <p className="text-display-thin text-base text-tan-light">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="section-base">
          <div className="section-contained">
            <div className="text-center space-y-4 mb-14">
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                ON THE PLAYA
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Gallery
              </h2>
            </div>

            <div className="image-frame image-grain relative aspect-[21/9] group">
              <Image
                src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
                alt="DAMAVAND art car at Camp Alborz on the playa"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
              />
            </div>
          </div>
        </section>

        {/* The Mountain Connection */}
        <section className="section-alt relative">
          <div className="section-contained">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-8">
                THE NAMESAKE
              </p>
              <div className="blockquote-elegant">
                <p className="font-accent text-xl md:text-2xl italic text-ink leading-relaxed">
                  Mt. Damavand stands at 5,610 meters -- the highest volcano in Asia and the tallest peak in the Alborz mountain range. It is a symbol of resistance and resilience in Persian mythology.
                </p>
              </div>
              <div className="ornate-divider mt-8" />
              <p className="text-body-relaxed text-ink-soft mt-8">
                Just as the mountain endures, our art car carries the spirit of the Alborz out onto the open playa -- moving, gathering people, and creating moments together.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-base">
          <div className="section-contained text-center space-y-4 py-8">
            <p className="text-body-relaxed text-base text-ink-soft">
              Damavand needs builders, welders, painters, and supporters every season.
            </p>
            <Link href="/donate" className="cta-primary inline-flex">
              Support the Build
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="text-sm text-ink-soft/70 pt-4">
              See our other art car{' '}
              <Link href="/art/homa" className="text-gold-600 hover:text-gold-500 transition-colors">
                HOMA <ArrowRight className="inline h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
