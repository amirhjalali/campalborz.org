import { Navigation } from '../components/navigation';
import { Stats } from '../components/stats';
import { FeatureCards } from '../components/feature-cards';
import { PageHero } from '../components/home/PageHero';
import { FramedCTA } from '../components/home/FramedCTA';

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
            <strong>Art Cars:</strong> HOMA (2024) and DAMAVAND (redesigned for 2025)
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

        <FeatureCards />

        <FramedCTA
          kicker="JOIN THE FAMILY"
          heading="Come for the tea, stay for the magic."
          description="Whether you're Persian, Persia-curious, or simply seeking connection, Camp Alborz welcomes you."
          primary={{ label: 'Apply to Join', href: '/apply', variant: 'primary' }}
          secondary={{ label: 'Support Our Mission', href: '/donate', variant: 'secondary' }}
        />
      </main>
    </>
  );
}