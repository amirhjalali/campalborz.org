'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navigation } from '../components/navigation';
import { Stats } from '../components/stats';
import { FeatureCards } from '../components/feature-cards';
import { PageHero } from '../components/home/PageHero';
import { FramedCTA } from '../components/home/FramedCTA';
import { useContentConfig } from '../hooks/useConfig';

const campQAs = [
  {
    question: 'What is Camp Alborz?',
    answer:
      "We're a theme camp that's been around since 2008. Persian hospitality, art cars, tea, sound systems, and a shaded spot to hang out. Open to everyone.",
  },
  {
    question: "What does 'TOMORROW-TODAY' mean?",
    answer:
      "It's a reminder that the future isn't somewhere out there—it's what we're building right now. Less philosophy, more doing stuff together.",
  },
  {
    question: 'What do you offer at camp?',
    answer: (
      <>
        <p>Stop by anytime. We've got:</p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            <strong>Tea:</strong> Hot chai, all day, every day
          </li>
          <li>
            <strong>Hookah:</strong> Shaded lounge area to chill
          </li>
          <li>
            <strong>Art Cars:</strong> HOMA and DAMAVAND—mobile sound stages
          </li>
          <li>
            <strong>Workshops:</strong> Calligraphy, cooking, poetry readings
          </li>
          <li>
            <strong>Meals:</strong> Camp dinners with Persian food
          </li>
        </ul>
      </>
    ),
  },
];

export default function HomePage() {
  const { home } = useContentConfig();
  return (
    <>
      <Navigation />
      <main>
        <PageHero />
        <Stats />

        <section className="section-base section-contained">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="frame-panel text-center space-y-6"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
              WHAT WE DO
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              Tea, Art Cars, and Good Company
            </h2>
            <p className="drop-cap text-body-relaxed text-base md:text-lg text-ink-soft/90 max-w-3xl mx-auto text-left">
              We run a hospitality camp at Burning Man. Every day we serve tea, fire up the hookah lounge,
              and keep our shaded space open to anyone who walks by. Throughout the year we throw fundraisers,
              build art cars, and look for excuses to hang out. Persian culture runs through everything we do—the
              food, the music, the way we welcome strangers. But you don&apos;t need to be Persian to be here.
            </p>
          </motion.div>
        </section>

        {home?.rumiQuote && (
          <section className="section-contrast">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="frame-panel bg-white/5 border border-white/10 text-center"
              >
                <div className="blockquote-elegant space-y-6">
                  <p className="text-tan-light/60 tracking-[0.4em] text-xs font-semibold uppercase">
                    Rumi &bull; Coleman Barks Translation
                  </p>
                  <p className="font-accent text-3xl md:text-4xl lg:text-5xl text-tan-light leading-relaxed">
                    {home.rumiQuote.text}
                  </p>
                  <p className="text-body-relaxed text-sm md:text-base text-tan-light/70 max-w-2xl mx-auto">
                    {home.rumiQuote.context}
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {home?.mediaSpotlight && (
          <section className="section-base">
            <div className="section-contained grid gap-10 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-tan-300/30 image-frame"
              >
                <iframe
                  src={home.mediaSpotlight.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  title={home.mediaSpotlight.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <p className="text-display-wide text-xs tracking-[0.4em] text-ink-soft/80">
                  FILM SPOTLIGHT
                </p>
                <h2 className="text-display-thin text-3xl md:text-4xl">{home.mediaSpotlight.title}</h2>
                <p className="text-body-relaxed text-base md:text-lg text-ink-soft/90">
                  {home.mediaSpotlight.description}
                </p>
                {home.mediaSpotlight.cta && (
                  <a href={home.mediaSpotlight.cta.link} target="_blank" rel="noreferrer" className="cta-primary inline-flex">
                    {home.mediaSpotlight.cta.text}
                  </a>
                )}
              </motion.div>
            </div>
          </section>
        )}

        <section className="section-contrast">
          <div className="section-contained space-y-10">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                TOMORROW &mdash; TODAY
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">
              {campQAs.map(({ question, answer }, index) => (
                <motion.div
                  key={question}
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm vignette"
                >
                  <h3 className="font-accent text-2xl md:text-[1.65rem] text-tan-light leading-snug">
                    {question}
                  </h3>
                  <div className="ornate-divider !w-[60px] !my-4 opacity-40" />
                  <div className="mt-4 text-body-relaxed text-sm text-tan-light/85 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm">
                    {answer}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {home?.gallery && (
          <section className="section-base">
            <div className="section-contained space-y-8">
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
              >
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
                  {home.gallery.title.toUpperCase()}
                </p>
                <p className="text-body-relaxed text-base md:text-lg text-ink-soft/90">{home.gallery.description}</p>
              </motion.div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {home.gallery.images.map((image, idx) => (
                  <motion.figure
                    key={image.src}
                    initial={{ y: 16, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className="relative overflow-hidden rounded-2xl shadow-xl border border-tan-300/40 group image-frame"
                  >
                    <div className="relative h-72 w-full overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.caption}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={85}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <figcaption className="p-5 text-sm text-ink-soft/90 leading-relaxed bg-white/80 backdrop-blur-sm">
                      {image.caption}
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <FeatureCards />

        <FramedCTA
          kicker="GET INVOLVED"
          heading="Come for the tea, stay for the people."
          description="Swing by a fundraiser, help out at an event, or just show up. Everyone's welcome."
          primary={{ label: 'About Us', href: '/about', variant: 'primary' }}
          secondary={{ label: 'Donate', href: '/donate', variant: 'secondary' }}
        />
      </main>
    </>
  );
}