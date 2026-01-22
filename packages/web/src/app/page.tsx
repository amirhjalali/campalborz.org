import Image from 'next/image';
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
      'Camp Alborz is a Burning Man theme camp that celebrates Persian culture, art, and community. We blend ancient Persian traditions with the innovative spirit of Black Rock City, creating a unique space for connection, creativity, and cultural exchange.',
  },
  {
    question: "What does 'TOMORROW-TODAY' mean?",
    answer:
      "TOMORROW-TODAY represents our philosophy of bringing the future into the present moment. We honor ancient Persian wisdom while embracing cutting-edge art, technology, and radical self-expression. It's about creating the world we want to see, right now.",
  },
  {
    question: 'What do you offer at camp?',
    answer: (
      <>
        <p>Camp Alborz provides a welcoming oasis with:</p>
        <ul className="mt-4 space-y-2 list-disc list-inside">
          <li>
            <strong>Persian Tea Service:</strong> Traditional chai and refreshments throughout the day
          </li>
          <li>
            <strong>Hookah Lounge:</strong> Relaxing smoke sessions under shade structures
          </li>
          <li>
            <strong>Art Cars:</strong> HOMA and DAMAVAND mobile sound stages
          </li>
          <li>
            <strong>Cultural Workshops:</strong> Calligraphy, poetry, music, and more
          </li>
          <li>
            <strong>Community Meals:</strong> Shared dinners celebrating Persian cuisine
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
          <div className="frame-panel text-center space-y-6">
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
              MISSION STATEMENT
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              Building Bridges Between Cultures
            </h2>
            <p className="text-body-relaxed text-base md:text-lg text-ink-soft/90 max-w-3xl mx-auto">
              Camp Alborz exists to celebrate and share Persian culture within the transformative environment
              of Burning Man. We create immersive experiences that honor our heritage while embracing radical
              inclusion, gifting, and communal effort. Through art, music, food, and hospitality, we build bridges
              between ancient traditions and contemporary expression.
            </p>
          </div>
        </section>

        {home?.rumiQuote && (
          <section className="section-contrast">
            <div className="section-contained">
              <div className="frame-panel bg-white/5 border border-white/10 text-center space-y-6">
                <p className="text-ink-soft/60 tracking-[0.4em] text-xs font-semibold">
                  RUMI • COLEMAN BARKS
                </p>
                <p className="text-display-thin text-2xl md:text-3xl italic text-tan-light">
                  “{home.rumiQuote.text}”
                </p>
                <p className="text-body-relaxed text-sm md:text-base text-tan-light/80 max-w-3xl mx-auto">
                  {home.rumiQuote.context}
                </p>
              </div>
            </div>
          </section>
        )}

        {home?.mediaSpotlight && (
          <section className="section-base">
            <div className="section-contained grid gap-10 lg:grid-cols-2 items-center">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-dust-khaki/30">
                <iframe
                  src={home.mediaSpotlight.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  title={home.mediaSpotlight.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="space-y-4">
                <p className="text-display-wide text-xs tracking-[0.4em] text-ink-soft/70">
                  FILM SPOTLIGHT
                </p>
                <h2 className="text-display-thin text-3xl md:text-4xl">{home.mediaSpotlight.title}</h2>
                <p className="text-body-relaxed text-base md:text-lg text-ink-soft/80">
                  {home.mediaSpotlight.description}
                </p>
                {home.mediaSpotlight.cta && (
                  <a href={home.mediaSpotlight.cta.link} target="_blank" rel="noreferrer" className="cta-primary inline-flex">
                    {home.mediaSpotlight.cta.text}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="section-contrast">
          <div className="section-contained space-y-10">
            <div className="text-center space-y-4">
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                TOMORROW — TODAY
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {campQAs.map(({ question, answer }) => (
                <div key={question} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
                  <p className="font-accent text-xl text-tan-light italic">{question}</p>
                  <div className="mt-4 text-body-relaxed text-sm text-tan-light/85 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm">
                    {answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {home?.gallery && (
          <section className="section-base">
            <div className="section-contained space-y-6">
              <div className="text-center space-y-2">
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/60">
                  {home.gallery.title.toUpperCase()}
                </p>
                <p className="text-body-relaxed text-base md:text-lg text-ink-soft/80">{home.gallery.description}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {home.gallery.images.map((image) => (
                  <figure key={image.src} className="relative overflow-hidden rounded-3xl shadow-xl border border-dust-khaki/30">
                    <div className="relative h-64 w-full">
                      <Image src={image.src} alt={image.caption} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                    </div>
                    <figcaption className="p-4 text-sm text-ink-soft/80">
                      {image.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <FeatureCards />

        <FramedCTA
          kicker="JOIN THE COMMUNITY"
          heading="Come for the tea, stay for the community."
          description="Whether you're Persian or simply curious about the culture, Camp Alborz welcomes you."
          primary={{ label: 'Apply to Join', href: '/apply', variant: 'primary' }}
          secondary={{ label: 'Support Our Mission', href: '/donate', variant: 'secondary' }}
        />
      </main>
    </>
  );
}