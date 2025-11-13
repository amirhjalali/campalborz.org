import { Navigation } from '../components/navigation';
import { Hero } from '../components/hero';
import { Stats } from '../components/stats';
import { FeatureCards } from '../components/feature-cards';
import SectionHeader from '../components/section-header';
import DecorativeDivider from '../components/decorative-divider';
import QASection, { QAList } from '../components/qa-section';

export default function HomePage() {
  // Q&A content from style guide
  const campQAs = [
    {
      question: "What is Camp Alborz?",
      answer: "Camp Alborz is a Burning Man theme camp that celebrates Persian culture, art, and community. We blend ancient Persian traditions with the innovative spirit of Black Rock City, creating a unique space for connection, creativity, and cultural exchange."
    },
    {
      question: "What does 'TOMORROW-TODAY' mean?",
      answer: "TOMORROW-TODAY represents our philosophy of bringing the future into the present moment. We honor ancient Persian wisdom while embracing cutting-edge art, technology, and radical self-expression. It's about creating the world we want to see, right now."
    },
    {
      question: "What do you offer at camp?",
      answer: (
        <>
          <p>Camp Alborz provides a welcoming oasis with:</p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li><strong>Persian Tea Service:</strong> Traditional chai and refreshments throughout the day</li>
            <li><strong>Hookah Lounge:</strong> Relaxing smoke sessions under shade structures</li>
            <li><strong>Art Cars:</strong> HOMA (2024) and DAMAVAND (redesigned for 2025)</li>
            <li><strong>Cultural Workshops:</strong> Calligraphy, poetry, music, and more</li>
            <li><strong>Community Meals:</strong> Shared dinners celebrating Persian cuisine</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Stats Section - Warm Beige background */}
        <section className="py-16 bg-tan-100">
          <Stats />
        </section>

        {/* Mission Statement Section - Cream background */}
        <section className="py-20 bg-warm-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="MISSION STATEMENT"
              subtitle="Building Bridges Between Cultures"
              bgColor="sage"
              decorated={true}
            />

            <div className="max-w-4xl mx-auto mt-12">
              <p className="text-lg md:text-xl text-center leading-relaxed text-sage-dark font-body font-normal">
                Camp Alborz exists to celebrate and share Persian culture within the transformative environment
                of Burning Man. We create immersive experiences that honor our heritage while embracing radical
                inclusion, gifting, and communal effort. Through art, music, food, and hospitality, we build
                bridges between ancient traditions and contemporary expression.
              </p>
            </div>
          </div>
        </section>

        {/* Q&A Section - Refined Sage Green background */}
        <section className="py-20 bg-sage text-tan-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DecorativeDivider variant="ornate" color="gold" />

            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-wide mb-4">
                Frequently Asked Questions
              </h2>
              <p className="font-accent text-xl md:text-2xl text-tan italic font-normal">
                Learn more about our camp and community
              </p>
            </div>

            <QAList items={campQAs} alternateBackgrounds={false} darkMode={true} />
          </div>
        </section>

        {/* Features Section - Warm Beige background (alternating) */}
        <section className="py-20 bg-tan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="CAMP OFFERINGS"
              subtitle="Experience Persian Hospitality"
              bgColor="sage"
              decorated={true}
              dividerColor="gold"
            />

            <div className="mt-12">
              <FeatureCards />
            </div>
          </div>
        </section>

        {/* Call to Action - Cream background */}
        <section className="py-20 bg-warm-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <DecorativeDivider variant="double" color="gold" />

            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-sage-dark mb-6">
              Join Our Community
            </h2>
            <p className="font-body text-lg md:text-xl text-sage-dark font-normal mb-8 leading-relaxed">
              Whether you're Persian, Persia-curious, or simply seeking connection, Camp Alborz welcomes you.
              Come for the tea, stay for the magic.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-display font-semibold bg-gold text-white rounded-lg hover:bg-gold-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Apply to Join Camp
              </a>
              <a
                href="/donate"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-display font-semibold bg-sage text-tan-light rounded-lg hover:bg-sage-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Support Our Mission
              </a>
            </div>

            <DecorativeDivider variant="double" color="gold" />
          </div>
        </section>
      </main>
    </>
  );
}