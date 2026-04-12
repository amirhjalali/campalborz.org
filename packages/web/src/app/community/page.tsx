'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, ChevronDown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--color-warm-border)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="font-display text-lg pr-4"
          style={{ color: 'var(--color-ink)' }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <ChevronDown
            className="h-5 w-5"
            style={{ color: 'var(--color-gold-muted)' }}
          />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p
          className="text-body-relaxed pb-6 pr-10"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Values Data                                                        */
/* ------------------------------------------------------------------ */
const campValues = [
  {
    title: 'Radical Hospitality',
    description:
      'In Persian culture, a guest is a gift from God. We bring that spirit to the playa \u2014 everyone is welcome at our table.',
  },
  {
    title: 'Creative Expression',
    description:
      "From HOMA's fire to Damavand's glow, we channel centuries of artistic tradition into modern playa art.",
  },
  {
    title: 'Cultural Bridge',
    description:
      'We bridge Persian heritage and Burning Man principles, creating a space where ancient traditions meet radical self-expression.',
  },
  {
    title: 'Collective Building',
    description:
      'Every tent stake, every art car bolt, every cup of tea \u2014 we build together. That\u2019s how a camp becomes a community.',
  },
];

/* ------------------------------------------------------------------ */
/*  Getting Started Steps                                              */
/* ------------------------------------------------------------------ */
const gettingStartedSteps = [
  {
    number: '01',
    title: 'Explore',
    description:
      'Browse our site, learn about our art, culture, and mission.',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Art', href: '/art' },
      { label: 'Culture', href: '/culture' },
    ],
  },
  {
    number: '02',
    title: 'Connect',
    description:
      'Attend one of our off-playa events or reach out to say hello.',
    links: [{ label: 'Events', href: '/events' }],
  },
  {
    number: '03',
    title: 'Apply',
    description:
      "Fill out a membership application \u2014 we'd love to hear your story.",
    links: [{ label: 'Apply Now', href: '/apply' }],
  },
  {
    number: '04',
    title: 'Build Together',
    description:
      'Join the crew! Help with art builds, fundraising, or camp logistics.',
    links: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Volunteer Roles                                                    */
/* ------------------------------------------------------------------ */
const volunteerRoles = [
  {
    title: 'Art Builds',
    description:
      'Help construct and maintain HOMA and DAMAVAND. No experience needed \u2014 just enthusiasm.',
  },
  {
    title: 'Kitchen & Tea',
    description:
      'Run our legendary Persian tea service and communal meals.',
  },
  {
    title: 'Music & Sound',
    description:
      'DJ, play live instruments, or help manage our sound system.',
  },
  {
    title: 'Camp Infrastructure',
    description:
      'Setup, teardown, power, shade structures \u2014 the backbone of camp life.',
  },
  {
    title: 'Fundraising & Outreach',
    description:
      'Help organize events, manage social media, and connect with supporters.',
  },
  {
    title: 'Mentorship',
    description:
      'Guide first-timers through their first Burn with our camp buddy system.',
  },
];

/* ------------------------------------------------------------------ */
/*  Traditions                                                         */
/* ------------------------------------------------------------------ */
const traditions = [
  {
    title: 'Sunrise Tea Ceremony',
    description:
      'Each morning, we gather for Persian tea as the sun rises over the playa. No agenda. Just conversation, chai, and community.',
  },
  {
    title: 'The Simorgh Circle',
    description:
      'Before the Temple burn, we gather in a circle to share gratitudes, intentions, and stories. Named for the mythical bird that represents unity.',
  },
  {
    title: 'Yalda Night',
    description:
      'We celebrate the Persian winter solstice with poetry readings, pomegranates, and stories \u2014 bringing an ancient tradition to the desert.',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */
const faqItems = [
  {
    question: 'Do I need to be Persian to join?',
    answer:
      'Absolutely not. Camp Alborz welcomes everyone. Our community includes people from every background united by curiosity, creativity, and a love of gathering.',
  },
  {
    question: 'What does membership cost?',
    answer:
      'Membership dues vary by season and help cover camp infrastructure, food, and art projects. We never turn anyone away for financial reasons \u2014 talk to us.',
  },
  {
    question: "I've never been to Burning Man. Can I still join?",
    answer:
      "Yes! Many of our members' first Burn was with Camp Alborz. We have a buddy system to help you navigate your first year.",
  },
  {
    question: 'How much time do I need to commit?',
    answer:
      'It varies. Some members help with year-round art builds, others join for the playa week. We value whatever time you can give.',
  },
  {
    question: 'How do I get involved right away?',
    answer:
      'Start by attending one of our off-playa events (check our events page), or fill out a membership application.',
  },
];

/* ------------------------------------------------------------------ */
/*  Main Community Page                                                */
/* ------------------------------------------------------------------ */
export default function CommunityPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ============================================================ */}
      {/*  HERO — text-first warm welcome, no parallax image           */}
      {/* ============================================================ */}
      <section
        className="relative py-28 md:py-36 lg:py-44 overflow-hidden"
        style={{ backgroundColor: 'var(--color-cream-warm, var(--color-cream))' }}
      >
        <div
          className="absolute inset-0 pattern-persian opacity-[0.05]"
          aria-hidden="true"
        />

        <div className="max-w-[900px] mx-auto px-5 md:px-10 relative z-10">
          <motion.p
            className="text-eyebrow mb-5"
            style={{ color: 'var(--color-gold-muted)' }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            WELCOME HOME
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6"
            style={{ color: 'var(--color-ink)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Our Community
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl"
            style={{ color: 'var(--color-ink-soft)' }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Camp Alborz is more than a theme camp &mdash; it&rsquo;s a family.
            From first-timers to playa veterans, we build, create, and celebrate
            together.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CAMP VALUES — 2-column: heading left, stacked list right    */}
      {/* ============================================================ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left column — heading + intro */}
            <div className="lg:col-span-2">
              <Reveal direction="up">
                <p className="text-eyebrow mb-3">WHAT WE STAND FOR</p>
                <h2
                  className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-5"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Our Values
                </h2>
                <p
                  className="font-accent text-lg leading-relaxed"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  The principles that make Camp Alborz feel like home
                </p>
              </Reveal>
            </div>

            {/* Right column — values as numbered manifesto items */}
            <div className="lg:col-span-3 space-y-10">
              {campValues.map((value, index) => (
                <div key={value.title} className="flex gap-5">
                  <span
                    className="font-display text-3xl md:text-4xl leading-none flex-shrink-0 mt-1"
                    style={{ color: 'var(--color-gold)' }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3
                      className="font-display text-lg md:text-xl mb-2"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className="text-body-relaxed"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  GETTING STARTED — vertical timeline/stepper                 */}
      {/* ============================================================ */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: 'var(--color-cream-warm, var(--color-cream))' }}
      >
        <div className="max-w-[700px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">YOUR PATH</p>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight"
                style={{ color: 'var(--color-ink)' }}
              >
                New to Camp Alborz?
              </h2>
              <p
                className="font-accent text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                Here&rsquo;s how to go from curious to crew
              </p>
            </div>
          </Reveal>

          <div className="relative">
            {/* Vertical connecting line */}
            <div
              className="absolute left-[23px] md:left-[27px] top-4 bottom-4 w-px"
              style={{ backgroundColor: 'var(--color-gold-muted)', opacity: 0.3 }}
              aria-hidden="true"
            />

            <div className="space-y-10">
              {gettingStartedSteps.map((step) => (
                <div key={step.title} className="relative flex gap-6">
                  {/* Step number circle */}
                  <div
                    className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center relative z-10"
                    style={{
                      backgroundColor: 'var(--color-cream, #FAF7F2)',
                      border: '2px solid var(--color-gold)',
                    }}
                  >
                    <span
                      className="font-display text-sm md:text-base tracking-wide"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-2 pb-2">
                    <h3
                      className="font-display text-xl mb-2"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-body-relaxed text-sm mb-3"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {step.description}
                    </p>
                    {step.links.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {step.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center gap-1.5 text-sm transition-colors group/link"
                            style={{ color: 'var(--color-terracotta)' }}
                          >
                            {link.label}
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  VOLUNTEER OPPORTUNITIES — cards with left border accent     */}
      {/* ============================================================ */}
      <section className="section-contrast py-24 md:py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 pattern-persian opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <Reveal direction="up">
            <div className="text-center mb-14">
              <p
                className="text-eyebrow"
                style={{ color: 'var(--color-gold-muted)' }}
              >
                GET INVOLVED
              </p>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mt-4"
                style={{ color: 'var(--color-cream)' }}
              >
                Ways to Contribute
              </h2>
              <p
                className="font-accent text-lg mt-4 max-w-xl mx-auto"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.7)' }}
              >
                Every hand makes camp better. Find where you fit.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteerRoles.map((role) => (
              <div
                key={role.title}
                className="rounded-lg p-7 h-full transition-colors duration-300 hover:bg-white/[0.06]"
                style={{
                  borderLeft: '3px solid var(--color-gold)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <h3
                  className="font-display text-xl mb-3"
                  style={{ color: 'var(--color-cream)' }}
                >
                  {role.title}
                </h3>
                <p
                  className="text-body-relaxed text-sm leading-relaxed"
                  style={{
                    color: 'rgba(var(--color-cream-rgb), 0.75)',
                  }}
                >
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CAMP TRADITIONS — simple text list with separators          */}
      {/* ============================================================ */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: 'var(--color-cream-warm, var(--color-cream))' }}
      >
        <div className="max-w-[750px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <p className="text-eyebrow mb-3">RITUALS</p>
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4"
              style={{ color: 'var(--color-ink)' }}
            >
              Our Traditions
            </h2>
            <p
              className="font-accent text-lg mb-14"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              The rituals that bind us together, year after year
            </p>
          </Reveal>

          <div>
            {traditions.map((tradition, index) => (
              <div key={tradition.title}>
                {index > 0 && (
                  <hr
                    className="my-8"
                    style={{ borderColor: 'var(--color-warm-border)' }}
                  />
                )}
                <div>
                  <h3
                    className="font-display text-xl mb-3"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {tradition.title}
                  </h3>
                  <p
                    className="text-body-relaxed leading-relaxed"
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    {tradition.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[800px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">QUESTIONS</p>
              <h2
                className="font-display text-3xl md:text-4xl tracking-tight"
                style={{ color: 'var(--color-ink)' }}
              >
                Frequently Asked
              </h2>
              <p
                className="font-accent text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                Everything you want to know before jumping in
              </p>
            </div>
          </Reveal>

          <div
            className="border-t"
            style={{ borderColor: 'var(--color-warm-border)' }}
          >
            {faqItems.map((item) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                   */}
      {/* ============================================================ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px] opacity-[0.06]"
          style={{
            background:
              'radial-gradient(circle, var(--color-gold), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <p className="text-eyebrow mb-4">JOIN US</p>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6"
                style={{ color: 'var(--color-ink)' }}
              >
                Ready to Join the Family?
              </h2>
              <p
                className="text-body-relaxed text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                Whether you&rsquo;re a builder, a dreamer, a tea drinker, or
                all three &mdash; there&rsquo;s a place for you at Camp Alborz.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply" className="cta-primary cta-shimmer">
                  <span>Apply to Join</span>
                  <span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
                <Link href="/donate" className="cta-secondary">
                  <span>Support Our Mission</span>
                  <span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
