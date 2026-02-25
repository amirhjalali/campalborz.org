'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '../../components/reveal';
import { DonationForm } from '../../components/donation/DonationForm';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import {
  Heart,
  CheckCircle,
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

  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);

  const scrollToFormAndSetAmount = useCallback((amountInCents: number | null) => {
    setPrefilledAmount(amountInCents);
    setPrefillKey((k) => k + 1);
    document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!donate) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Donate page configuration not found</p>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
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
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQZBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEEQ/AKWkWq6bCJH3G4kOZGJ5OOwPgGtItdOS8gFwlw8Mb5CJGQAM9kj81UtJNxp9pcNazyW5ljV2MTlSR8yKn/lKU4x//9k="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent" style={{ background: 'linear-gradient(to top, var(--color-cream), transparent, transparent)', opacity: 0.9 }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 text-center py-24 md:py-32"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow text-white/80 mb-6"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            SUPPORT OUR MISSION
          </motion.p>
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {donate.title}
          </motion.h1>
          <motion.p
            className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {donate.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>

      </section>

      {/* Donation Tiers */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="space-y-4 mb-14">
              <p className="text-eyebrow">DONATION TIERS</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Choose Your Support Level
              </h2>
              <p className="font-accent text-lg max-w-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                Every contribution helps us build a stronger, more vibrant community
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donate.donationTiers.map((tier, index) => (
              <Reveal key={tier.amount} delay={index * 0.1}>
                <div
                  className="relative luxury-card cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={tier.popular ? { boxShadow: '0 0 0 2px var(--color-gold)' } : undefined}
                  onClick={() => scrollToFormAndSetAmount(tier.amount * 100)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-white text-xs rounded-full uppercase tracking-[0.1em]" style={{ backgroundColor: 'var(--color-gold)' }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <p className="text-4xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                      ${tier.amount}
                    </p>
                    <h3 className="text-display-thin text-xl mb-2">{tier.title}</h3>
                    <p className="font-accent text-sm" style={{ color: 'var(--color-ink-soft)' }}>{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-sage)' }} />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full ${tier.popular ? 'cta-primary cta-shimmer' : 'cta-secondary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToFormAndSetAmount(tier.amount * 100);
                    }}
                  >
                    <span>Donate ${tier.amount}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-10">
              <p style={{ color: 'var(--color-ink-soft)' }} className="mb-4">Want to contribute a different amount?</p>
              <button
                className="cta-secondary"
                onClick={() => scrollToFormAndSetAmount(null)}
              >
                <span>Custom Donation</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Donation Form */}
      {donate.donationForm && (
        <section id="donation-form" className="py-24 md:py-32">
          <div className="max-w-2xl mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center space-y-4 mb-10">
                <p className="text-eyebrow">MAKE A GIFT</p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {donate.donationForm.title}
                </h2>
                <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                  {donate.donationForm.description}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="frame-panel">
                <DonationForm
                  campaigns={donate.donationForm.campaigns}
                  initialAmount={prefilledAmount}
                  prefillKey={prefillKey}
                  onSuccess={(donationId) => {
                    console.log('Donation successful:', donationId);
                  }}
                />
              </div>
            </Reveal>

            {/* Trust Indicators */}
            <Reveal delay={0.25}>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs" style={{ color: 'rgba(var(--color-ink-rgb), 0.5)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-sage)' }} />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" style={{ color: 'var(--color-sage)' }} />
                  <span>501(c)(3) Tax-Deductible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" style={{ color: 'var(--color-sage)' }} />
                  <span>100% Goes to Community</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">IMPACT</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                How Donations Help
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {donate.impactStats.map((stat, index) => {
              const StatIcon = getIcon(stat.icon);
              return (
                <Reveal key={stat.label} delay={index * 0.1}>
                  <div className="luxury-card text-center">
                    <div className="inline-flex p-4 rounded-full mb-5" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                      <StatIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <p className="text-3xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                      {stat.number}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Payment Options */}
      {donate.paymentOptions && donate.paymentOptions.length > 0 && (
        <section className="section-contrast">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center space-y-4 mb-14">
                <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>WAYS TO GIVE</p>
                <h2 className="text-display-thin text-3xl md:text-4xl" style={{ color: 'var(--color-cream)' }}>
                  Preferred Ways to Give
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {donate.paymentOptions.map((option, index) => {
                const OptionIcon = getIcon(option.icon || 'heart');
                return (
                  <Reveal key={option.method} delay={index * 0.12}>
                    <div className="border rounded-2xl p-8" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                            <OptionIcon className="h-5 w-5" style={{ color: 'var(--color-gold-muted)' }} />
                          </div>
                          <div>
                            <h3 className="text-display-thin text-lg" style={{ color: 'var(--color-cream)' }}>
                              {option.method}
                            </h3>
                            <p className="text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.6)' }}>
                              {option.description}
                            </p>
                          </div>
                        </div>
                        {option.badge && (
                          <span className="px-3 py-1 text-white text-xs rounded-full uppercase tracking-[0.1em]" style={{ backgroundColor: 'var(--color-gold)' }}>
                            {option.badge}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {option.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-gold-muted)' }} />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {option.linkUrl && option.linkText && (
                        <Link
                          href={option.linkUrl}
                          target={option.linkUrl.startsWith('http') ? '_blank' : undefined}
                          rel={option.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                          className="inline-flex items-center gap-2 text-sm transition-colors"
                          style={{ color: 'var(--color-gold-muted)' }}
                        >
                          {option.linkText}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Funding Priorities */}
      <section className="section-alt">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="frame-panel">
              <div className="text-center mb-10">
                <p className="text-eyebrow mb-3">WHERE YOUR MONEY GOES</p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  2026 Funding Priorities
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {donate.fundingPriorities.map((priority, index) => {
                  const PriorityIcon = getIcon(priority.icon);
                  return (
                    <div
                      key={priority.title}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)' }}>
                            <PriorityIcon className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                          </div>
                          <div>
                            <h3 className="text-display-thin text-lg">{priority.title}</h3>
                            <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{priority.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-display" style={{ color: 'var(--color-gold)' }}>{priority.percentage}%</p>
                          <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>${priority.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-cream-warm)' }} role="progressbar" aria-valuenow={priority.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${priority.title}: ${priority.percentage}% funded`}>
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${priority.percentage}%`, backgroundColor: 'var(--color-gold)' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Financial Transparency */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="luxury-card">
              <div className="text-center space-y-4 mb-10">
                <p className="text-eyebrow">TRANSPARENCY</p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  Financial Transparency
                </h2>
                <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                  2025 budget breakdown — see exactly how donations were used
                </p>
              </div>

              <div className="space-y-6">
                {donate.transparencyItems.map((item, index) => (
                  <div
                    key={item.category}
                    className="pb-6 last:border-b-0"
                    style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-display-thin text-lg">{item.category}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{item.percentage}%</span>
                        <span className="text-lg font-display" style={{ color: 'var(--color-gold)' }}>{item.amount}</span>
                      </div>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>{item.description}</p>
                    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--color-cream-warm)' }} role="progressbar" aria-valuenow={item.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.category}: ${item.percentage}%`}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.percentage}%`, backgroundColor: 'var(--color-gold)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Other Ways to Help */}
      <section className="section-contrast">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="space-y-4 mb-14">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>GET INVOLVED</p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Other Ways to Support Us
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {donate.otherWaysToHelp.map((option, index) => {
              const OptionIcon = getIcon(option.icon);
              return (
                <Reveal key={option.title} delay={index * 0.12}>
                  <div className="border rounded-2xl p-8" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                        <OptionIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                      </div>
                      <div>
                        <h3 className="text-display-thin text-xl" style={{ color: 'var(--color-cream)' }}>
                          {option.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-gold-muted)' }}>{option.amount}</p>
                      </div>
                    </div>
                    <p className="text-body-relaxed mb-6" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                      {option.description}
                    </p>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 text-sm transition-colors"
                      style={{ color: 'var(--color-gold-muted)' }}
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tax Information */}
      {donate.taxInfo && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="inline-flex p-4 rounded-full" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                    <Award className="h-8 w-8" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-display-thin text-xl mb-3">
                      {donate.taxInfo.title}
                    </h3>
                    <p className="text-body-relaxed mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                      <strong>{campConfig.name} is a registered 501(c)(3) non-profit organization.</strong>
                      {' '}{donate.taxInfo.description}
                    </p>
                    {donate.taxInfo.ein && (
                      <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                        EIN: {donate.taxInfo.ein} | You will receive a tax receipt via email after your donation.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Donor Recognition */}
      {donate.donorRecognition && (
        <section className="section-alt">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="luxury-card text-center">
                <div className="inline-flex p-4 rounded-full mb-6" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                  <Heart className="h-10 w-10" style={{ color: 'var(--color-gold)' }} />
                </div>
                <h2 className="text-display-thin text-2xl md:text-3xl mb-3">
                  {donate.donorRecognition.title}
                </h2>
                <p className="text-body-relaxed mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  {donate.donorRecognition.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {donate.donorRecognition.tiers.map((tier, index) => (
                    <div
                      key={tier.title}
                      className="p-6 rounded-xl"
                      style={{ backgroundColor: 'rgba(var(--color-tan-50), 0.5)' }}
                    >
                      <h3 className="text-display-thin text-lg mb-2">{tier.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{tier.description}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm mt-8" style={{ color: 'var(--color-ink-soft)' }}>
                  Full donor recognition list available upon request. We respect donor privacy preferences.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Gratitude */}
      {donate.gratitude && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel text-center">
                <h2 className="text-display-thin text-2xl md:text-3xl mb-6">
                  {donate.gratitude.title}
                </h2>
                <p className="font-accent italic text-lg max-w-3xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  {donate.gratitude.message}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA */}
      {donate.cta && (
        <section className="section-contrast">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center space-y-6">
                <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                  {donate.cta.title}
                </h2>
                <p className="text-body-relaxed text-lg max-w-2xl mx-auto" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                  {donate.cta.description}
                </p>
                <Link href={donate.cta.buttons.primary.link} className="cta-primary cta-shimmer">
                  <span>{donate.cta.buttons.primary.text}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
