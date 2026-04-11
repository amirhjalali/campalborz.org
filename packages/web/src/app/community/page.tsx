'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import {
  ArrowRight,
  Heart,
  Palette,
  Globe,
  Hammer,
  Wrench,
  Coffee,
  Music,
  Tent,
  Megaphone,
  Users,
  Sun,
  Flame,
  Moon,
  ChevronDown,
  Compass,
  CalendarDays,
  FileText,
  HeartHandshake,
} from 'lucide-react';

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
    icon: Heart,
    title: 'Radical Hospitality',
    description:
      'In Persian culture, a guest is a gift from God. We bring that spirit to the playa \u2014 everyone is welcome at our table.',
  },
  {
    icon: Palette,
    title: 'Creative Expression',
    description:
      "From HOMA's fire to Damavand's glow, we channel centuries of artistic tradition into modern playa art.",
  },
  {
    icon: Globe,
    title: 'Cultural Bridge',
    description:
      'We bridge Persian heritage and Burning Man principles, creating a space where ancient traditions meet radical self-expression.',
  },
  {
    icon: Hammer,
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
    icon: Compass,
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
    icon: CalendarDays,
    title: 'Connect',
    description:
      'Attend one of our off-playa events or reach out to say hello.',
    links: [{ label: 'Events', href: '/events' }],
  },
  {
    number: '03',
    icon: FileText,
    title: 'Apply',
    description:
      "Fill out a membership application \u2014 we'd love to hear your story.",
    links: [{ label: 'Apply Now', href: '/apply' }],
  },
  {
    number: '04',
    icon: HeartHandshake,
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
    icon: Wrench,
    title: 'Art Builds',
    description:
      'Help construct and maintain HOMA and DAMAVAND. No experience needed \u2014 just enthusiasm.',
  },
  {
    icon: Coffee,
    title: 'Kitchen & Tea',
    description:
      'Run our legendary Persian tea service and communal meals.',
  },
  {
    icon: Music,
    title: 'Music & Sound',
    description:
      'DJ, play live instruments, or help manage our sound system.',
  },
  {
    icon: Tent,
    title: 'Camp Infrastructure',
    description:
      'Setup, teardown, power, shade structures \u2014 the backbone of camp life.',
  },
  {
    icon: Megaphone,
    title: 'Fundraising & Outreach',
    description:
      'Help organize events, manage social media, and connect with supporters.',
  },
  {
    icon: Users,
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
    icon: Sun,
    title: 'Sunrise Tea Ceremony',
    description:
      'Each morning, we gather for Persian tea as the sun rises over the playa. No agenda. Just conversation, chai, and community.',
  },
  {
    icon: Flame,
    title: 'The Simorgh Circle',
    description:
      'Before the Temple burn, we gather in a circle to share gratitudes, intentions, and stories. Named for the mythical bird that represents unity.',
  },
  {
    icon: Moon,
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
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative min-h-hero-sm overflow-hidden flex items-center justify-center"
        style={{
          background:
            'linear-gradient(145deg, #2C2416 0%, #D4C4A8 30%, #4A5D5A 60%, #D4AF37 85%, #2C2416 100%)',
        }}
      >
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.webp"
            alt="Camp Alborz community members gathering together at Burning Man"
            fill
            className="object-cover object-center"
            priority
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </motion.div>

        <div
          className="absolute inset-0 pattern-persian opacity-20 z-[1]"
          aria-hidden="true"
        />

        <motion.div
          className="relative z-10 text-center py-24 max-w-[1200px] mx-auto px-5 md:px-10"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ y: 14, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            WELCOME HOME
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 24, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Our Community
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 14, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Camp Alborz is more than a theme camp &mdash; it&rsquo;s a family.
            From first-timers to playa veterans, we build, create, and celebrate
            together.
          </motion.p>

          <motion.div
            className="ornate-divider mt-10"
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  CAMP VALUES                                                  */}
      {/* ============================================================ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="space-y-3 mb-14 text-center">
              <p className="text-eyebrow">WHAT WE STAND FOR</p>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight"
                style={{ color: 'var(--color-ink)' }}
              >
                Our Values
              </h2>
              <p
                className="font-accent text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                The principles that make Camp Alborz feel like home
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {campValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} direction="up" delay={index * 0.1}>
                  <div className="luxury-card group h-full">
                    <div
                      className="inline-flex p-4 rounded-full mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)',
                        border: '1px solid rgba(var(--color-gold-rgb), 0.25)',
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: 'var(--color-gold)' }}
                        aria-hidden="true"
                      />
                    </div>
                    <h3
                      className="font-display text-lg mb-3"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className="text-body-relaxed text-sm"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      {value.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* ============================================================ */}
      {/*  GETTING STARTED GUIDE                                       */}
      {/* ============================================================ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="space-y-3 mb-14 text-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gettingStartedSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Reveal key={step.title} direction="up" delay={index * 0.12}>
                  <div className="relative h-full">
                    {/* Connector line on lg screens */}
                    {index < gettingStartedSteps.length - 1 && (
                      <div
                        className="hidden lg:block absolute top-12 right-0 w-full h-px translate-x-1/2 z-0"
                        style={{
                          background:
                            'linear-gradient(to right, var(--color-gold-muted), transparent)',
                          opacity: 0.3,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <div className="luxury-card h-full relative z-10">
                      <span
                        className="font-display text-sm tracking-[0.2em] mb-4 block"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        {step.number}
                      </span>
                      <div
                        className="inline-flex p-3 rounded-full mb-4"
                        style={{
                          backgroundColor:
                            'rgba(var(--color-gold-rgb), 0.12)',
                          border:
                            '1px solid rgba(var(--color-gold-rgb), 0.2)',
                        }}
                      >
                        <StepIcon
                          className="h-5 w-5"
                          style={{ color: 'var(--color-gold-muted)' }}
                          aria-hidden="true"
                        />
                      </div>
                      <h3
                        className="font-display text-xl mb-3"
                        style={{ color: 'var(--color-ink)' }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-body-relaxed text-sm mb-4"
                        style={{ color: 'var(--color-ink-soft)' }}
                      >
                        {step.description}
                      </p>
                      {step.links.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-auto">
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  VOLUNTEER OPPORTUNITIES                                     */}
      {/* ============================================================ */}
      <section className="section-contrast py-24 md:py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 pattern-persian opacity-[0.04]"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
          style={{
            background:
              'radial-gradient(circle, var(--color-gold), transparent 70%)',
          }}
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
            {volunteerRoles.map((role, index) => {
              const RoleIcon = role.icon;
              return (
                <Reveal key={role.title} direction="up" delay={index * 0.08}>
                  <motion.div
                    whileHover={{
                      y: -4,
                      borderColor: 'rgba(212, 175, 55, 0.35)',
                    }}
                    className="rounded-2xl p-8 h-full group transition-colors duration-500"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div
                      className="inline-flex p-4 rounded-full mb-6 transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundColor:
                          'rgba(var(--color-gold-rgb), 0.12)',
                        border:
                          '1px solid rgba(var(--color-gold-rgb), 0.2)',
                      }}
                    >
                      <RoleIcon
                        className="h-6 w-6"
                        style={{ color: 'var(--color-gold-muted)' }}
                        aria-hidden="true"
                      />
                    </div>
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
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

      {/* ============================================================ */}
      {/*  CAMP TRADITIONS                                              */}
      {/* ============================================================ */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: 'var(--color-cream-warm)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">RITUALS</p>
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight"
                style={{ color: 'var(--color-ink)' }}
              >
                Our Traditions
              </h2>
              <p
                className="font-accent text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                The rituals that bind us together, year after year
              </p>
            </div>
          </Reveal>

          <div className="space-y-8">
            {traditions.map((tradition, index) => {
              const TradIcon = tradition.icon;
              return (
                <Reveal
                  key={tradition.title}
                  direction="up"
                  delay={index * 0.1}
                >
                  <div className="luxury-card">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div
                        className="flex-shrink-0 inline-flex p-4 rounded-full"
                        style={{
                          backgroundColor:
                            'rgba(var(--color-gold-rgb), 0.15)',
                          border:
                            '1px solid rgba(var(--color-gold-rgb), 0.25)',
                        }}
                      >
                        <TradIcon
                          className="h-6 w-6"
                          style={{ color: 'var(--color-gold)' }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3
                          className="font-display text-xl mb-3"
                          style={{ color: 'var(--color-ink)' }}
                        >
                          {tradition.title}
                        </h3>
                        <p
                          className="text-body-relaxed"
                          style={{ color: 'var(--color-ink-soft)' }}
                        >
                          {tradition.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
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

          <Reveal direction="up" delay={0.1}>
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
          </Reveal>
        </div>
      </section>

      {/* Ornate Divider */}
      <div className="ornate-divider" aria-hidden="true">
        <span style={{ color: 'var(--color-gold-muted)' }}>&#9670;</span>
      </div>

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
