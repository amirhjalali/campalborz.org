'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DonationForm } from '../../components/donation/DonationForm';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import {
  Heart,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';

export default function DonatePage() {
  const { donate } = useContentConfig();
  const campConfig = useCampConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!donate) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Donate page configuration not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="bg-cream">
        {/* Hero Section with Parallax */}
        <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: backgroundY }}
          >
            <Image
              src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.jpg"
              alt="Camp Alborz community gathering at night with warm lighting, representing the hospitality and connection your donation supports"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQZBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEEA/AKWkWq6bCJH3G4kOZGJ5OOwPgGtItdOS8gFwlw8Mb5CJGQAM9kj81UtJNxp9pcNazyW5ljV2MTlSR8yKn/lKU4x//9k="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
          </motion.div>

          <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

          <motion.div
            className="relative z-10 section-contained text-center py-24"
            style={{ y: textY, opacity }}
          >
            <motion.p
              className="text-display-wide text-xs tracking-[0.5em] text-white/80 mb-6"
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              SUPPORT OUR MISSION
            </motion.p>
            <motion.h1
              className="text-display-thin text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-6"
              initial={{ y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              {donate.title}
            </motion.h1>
            <motion.p
              className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {donate.subtitle}
            </motion.p>

            <motion.div
              className="ornate-divider mt-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ filter: 'brightness(1.5)' }}
            />
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-8 h-8 text-white/60" />
          </motion.div>
        </section>

        {/* Impact Stats */}
        <section className="section-base section-contained">
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-14"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
              YOUR IMPACT
            </p>
            <h2 className="text-display-thin text-3xl md:text-4xl">
              How Donations Help
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {donate.impactStats.map((stat, index) => {
              const StatIcon = getIcon(stat.icon);
              return (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card text-center"
                >
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-5">
                    <StatIcon className="h-6 w-6 text-gold-500" />
                  </div>
                  <p className="text-3xl font-display text-gold-600 mb-2">
                    {stat.number}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Payment Options */}
        {donate.paymentOptions && donate.paymentOptions.length > 0 && (
          <section className="section-contrast">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 mb-14"
              >
                <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                  WAYS TO GIVE
                </p>
                <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                  Preferred Ways to Give
                </h2>
                <p className="text-body-relaxed text-base text-tan-light/80 max-w-2xl mx-auto">
                  Send dues, grid fees, and contributions using any of these methods
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {donate.paymentOptions.map((option, index) => {
                  const OptionIcon = getIcon(option.icon || 'heart');
                  return (
                    <motion.div
                      key={option.method}
                      initial={{ y: 20 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                            <OptionIcon className="h-5 w-5 text-gold-400" />
                          </div>
                          <div>
                            <h3 className="text-display-thin text-lg text-tan-light">
                              {option.method}
                            </h3>
                            <p className="text-sm text-tan-light/60">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        {option.badge && (
                          <span className="px-3 py-1 bg-gold-500 text-white text-xs rounded-full uppercase tracking-[0.1em]">
                            {option.badge}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {option.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-tan-light/80">
                            <CheckCircle className="h-4 w-4 text-gold-400 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {option.linkUrl && option.linkText && (
                        <Link
                          href={option.linkUrl}
                          target={option.linkUrl.startsWith('http') ? '_blank' : undefined}
                          rel={option.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                          className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          {option.linkText}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Donation Tiers */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                SUPPORT LEVELS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Choose Your Support Level
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Every contribution helps us build a stronger, more vibrant community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donate.donationTiers.map((tier, index) => (
                <motion.div
                  key={tier.amount}
                  initial={{ y: 20 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative luxury-card ${tier.popular ? 'ring-2 ring-gold-500' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gold-500 text-white text-xs rounded-full uppercase tracking-[0.1em]">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <p className="text-4xl font-display text-gold-600 mb-2">
                      ${tier.amount}
                    </p>
                    <h3 className="text-display-thin text-xl mb-2">{tier.title}</h3>
                    <p className="text-sm text-ink-soft">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-ink-soft">
                        <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full ${tier.popular ? 'cta-primary cta-shimmer' : 'cta-secondary'}`}>
                    Donate ${tier.amount}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-ink-soft mb-4">Want to contribute a different amount?</p>
              <button className="cta-secondary">
                Custom Donation
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Funding Priorities */}
        <section className="section-alt">
          <div className="section-contained">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel"
            >
              <div className="text-center space-y-4 mb-10">
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                  TRANSPARENCY
                </p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  2024 Funding Priorities
                </h2>
                <p className="text-body-relaxed text-sm text-ink-soft">
                  See how your donations will be allocated
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {donate.fundingPriorities.map((priority, index) => {
                  const PriorityIcon = getIcon(priority.icon);
                  return (
                    <motion.div
                      key={priority.title}
                      initial={{ y: 14 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gold-500/20">
                            <PriorityIcon className="h-5 w-5 text-gold-600" />
                          </div>
                          <div>
                            <h4 className="text-display-thin text-lg">{priority.title}</h4>
                            <p className="text-xs text-ink-soft">{priority.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-display text-gold-600">{priority.percentage}%</p>
                          <p className="text-xs text-ink-soft">${priority.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-full bg-tan-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${priority.color || 'bg-gold-500'}`}
                          style={{ width: `${priority.percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Financial Transparency */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="luxury-card"
            >
              <div className="text-center space-y-4 mb-10">
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                  ACCOUNTABILITY
                </p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  Financial Transparency
                </h2>
                <p className="text-body-relaxed text-sm text-ink-soft">
                  2023 budget breakdown - see exactly how donations were used
                </p>
              </div>

              <div className="space-y-6">
                {donate.transparencyItems.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ x: -14 }}
                    whileInView={{ x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-b border-line/30 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-display-thin text-lg">{item.category}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-ink-soft">{item.percentage}%</span>
                        <span className="text-lg font-display text-gold-600">{item.amount}</span>
                      </div>
                    </div>
                    <p className="text-sm text-ink-soft mb-3">{item.description}</p>
                    <div className="w-full bg-tan-100 rounded-full h-1.5">
                      <div
                        className="bg-gold-500 h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Other Ways to Help */}
        <section className="section-contrast">
          <div className="section-contained">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                BEYOND DONATIONS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Other Ways to Support Us
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {donate.otherWaysToHelp.map((option, index) => {
                const OptionIcon = getIcon(option.icon);
                return (
                  <motion.div
                    key={option.title}
                    initial={{ y: 20 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                        <OptionIcon className="h-6 w-6 text-gold-400" />
                      </div>
                      <div>
                        <h3 className="text-display-thin text-xl text-tan-light">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gold-400">{option.amount}</p>
                      </div>
                    </div>
                    <p className="text-body-relaxed text-tan-light/80 mb-6">
                      {option.description}
                    </p>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tax Information */}
        {donate.taxInfo && (
          <section className="section-base">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="frame-panel"
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                    <Award className="h-8 w-8 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-display-thin text-xl mb-3">
                      {donate.taxInfo.title}
                    </h3>
                    <p className="text-body-relaxed text-ink-soft mb-3">
                      <strong>{campConfig.name} is a registered 501(c)(3) non-profit organization.</strong>
                      {' '}{donate.taxInfo.description}
                    </p>
                    {donate.taxInfo.ein && (
                      <p className="text-sm text-ink-soft">
                        EIN: {donate.taxInfo.ein} | You will receive a tax receipt via email after your donation.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Donor Recognition */}
        {donate.donorRecognition && (
          <section className="section-alt">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="luxury-card text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
                  <Heart className="h-10 w-10 text-gold-500" />
                </div>
                <h2 className="text-display-thin text-2xl md:text-3xl mb-3">
                  {donate.donorRecognition.title}
                </h2>
                <p className="text-body-relaxed text-ink-soft mb-8 max-w-2xl mx-auto">
                  {donate.donorRecognition.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {donate.donorRecognition.tiers.map((tier, index) => (
                    <motion.div
                      key={tier.title}
                      initial={{ y: 14 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 bg-tan-50 rounded-xl"
                    >
                      <h4 className="text-display-thin text-lg mb-2">{tier.title}</h4>
                      <p className="text-sm text-ink-soft">{tier.description}</p>
                    </motion.div>
                  ))}
                </div>

                <p className="text-sm text-ink-soft mt-8">
                  Full donor recognition list available upon request. We respect donor privacy preferences.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Donation Form */}
        {donate.donationForm && (
          <section className="section-base">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 mb-10"
              >
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                  ONLINE DONATION
                </p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {donate.donationForm.title}
                </h2>
                <p className="text-body-relaxed text-sm text-ink-soft">
                  {donate.donationForm.description}
                </p>
              </motion.div>

              <div className="frame-panel">
                <DonationForm
                  campaigns={donate.donationForm.campaigns}
                  onSuccess={(donationId) => {
                    console.log('Donation successful:', donationId);
                  }}
                />
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-ink-soft/70">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sage-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-sage-600" />
                  <span>501(c)(3) Tax-Deductible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-sage-600" />
                  <span>100% Goes to Community</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gratitude */}
        {donate.gratitude && (
          <section className="section-base">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="frame-panel text-center"
              >
                <h2 className="text-display-thin text-2xl md:text-3xl mb-6">
                  {donate.gratitude.title}
                </h2>
                <p className="text-body-relaxed text-lg text-ink-soft max-w-3xl mx-auto">
                  {donate.gratitude.message}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        {donate.cta && (
          <section className="section-contrast">
            <div className="section-contained">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-8"
              >
                <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                  {donate.cta.title}
                </h2>
                <p className="text-body-relaxed text-lg text-tan-light/80 max-w-2xl mx-auto">
                  {donate.cta.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={donate.cta.buttons.primary.link} className="cta-primary cta-shimmer">
                    {donate.cta.buttons.primary.text}
                    <ArrowRight size={18} />
                  </Link>
                  <Link href={donate.cta.buttons.secondary.link} className="cta-secondary border-tan-light/30 text-tan-light hover:bg-tan-light/10">
                    {donate.cta.buttons.secondary.text}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
