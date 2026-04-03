'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '../../components/reveal';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import {
  Heart,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Award,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function DonatePage() {
  const { donate } = useContentConfig();
  const campConfig = useCampConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const scrollToPaymentOptions = useCallback(() => {
    document.getElementById('ways-to-give')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToDonate = useCallback(() => {
    document.getElementById('donate-now')?.scrollIntoView({ behavior: 'smooth' });
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
            src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.webp"
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
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {donate.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {donate.subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={scrollToDonate}
              className="cta-primary cta-shimmer inline-flex text-base px-8 py-3.5"
            >
              <span>Donate Now</span>
              <Heart size={18} aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div
            className="ornate-divider mt-10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>
      </section>

      {/* Impact Stats -- What Your Donation Accomplishes */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">YOUR IMPACT</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                What Your Donation Makes Possible
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Every dollar goes directly into the community -- here is what we have accomplished together
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {donate.impactStats.map((stat, index) => {
              const StatIcon = getIcon(stat.icon);
              return (
                <Reveal key={stat.label} delay={index * 0.1}>
                  <motion.div
                    className="luxury-card text-center group relative overflow-hidden"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(var(--color-gold-rgb), 0.08), transparent 70%)',
                      }}
                    />
                    <div className="relative z-10">
                      <div
                        className="inline-flex p-4 rounded-full mb-5 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                          border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                        }}
                      >
                        <StatIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <p className="text-3xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                        {stat.number}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Tiers -- Choose Your Level */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">DONATION TIERS</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                Choose Your Support Level
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Every contribution, no matter the size, helps us build a stronger community
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donate.donationTiers.map((tier, index) => (
              <Reveal key={tier.amount} delay={index * 0.1}>
                <motion.div
                  className="relative luxury-card cursor-pointer group h-full flex flex-col overflow-hidden"
                  style={tier.popular ? { boxShadow: '0 0 0 2px var(--color-gold)' } : undefined}
                  onClick={() => scrollToDonate()}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Donate $${tier.amount} - ${tier.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToDonate();
                    }
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: tier.popular
                        ? 'radial-gradient(circle at 50% 0%, rgba(var(--color-gold-rgb), 0.12), transparent 70%)'
                        : 'radial-gradient(circle at 50% 0%, rgba(var(--color-gold-rgb), 0.06), transparent 70%)',
                    }}
                  />

                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <span
                        className="px-4 py-1 text-white text-xs rounded-full uppercase tracking-[0.1em] flex items-center gap-1.5"
                        style={{ backgroundColor: 'var(--color-gold)' }}
                      >
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="text-center mb-6 pt-2">
                      <p className="text-4xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                        ${tier.amount}
                      </p>
                      <h3 className="font-display text-xl mb-2">{tier.title}</h3>
                      <p className="font-accent text-sm" style={{ color: 'var(--color-ink-soft)' }}>{tier.description}</p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full ${tier.popular ? 'cta-primary cta-shimmer' : 'cta-secondary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToDonate();
                      }}
                      tabIndex={-1}
                    >
                      <span>Donate ${tier.amount}</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-10">
              <p style={{ color: 'var(--color-ink-soft)' }} className="mb-4">Want to contribute a different amount?</p>
              <button
                className="cta-secondary"
                onClick={() => scrollToPaymentOptions()}
              >
                <span>Choose How to Give</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Donate Now CTA -- Givebutter */}
      <section id="donate-now" className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          <Reveal>
            <div className="frame-panel text-center relative overflow-hidden">
              {/* Decorative background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 20%, rgba(var(--color-gold-rgb), 0.06), transparent 60%)',
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div
                  className="inline-flex p-5 rounded-full mb-6"
                  style={{
                    backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                    border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                  }}
                >
                  <Heart className="h-10 w-10" style={{ color: 'var(--color-gold)' }} />
                </div>
                <h2 className="font-accent text-2xl md:text-3xl mb-4" style={{ color: '#2C2416' }}>
                  Donate Now
                </h2>
                <p className="text-body-relaxed text-sm mb-2 max-w-md mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  Every dollar goes directly into the camp -- art cars, sound systems, shade structures, and endless tea.
                </p>
                <p className="text-body-relaxed text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  All donations are <strong>tax-deductible</strong> and you will receive an instant receipt.
                </p>

                <a
                  href="https://givebutter.com/Alborz2025Fundraiser"
                  target="_blank"
                  rel="noreferrer"
                  className="cta-primary cta-shimmer inline-flex text-lg px-10 py-4"
                >
                  <span>Donate via Givebutter</span>
                  <ExternalLink size={20} aria-hidden="true" />
                </a>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs" style={{ color: 'rgba(var(--color-ink-rgb), 0.5)' }}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                    <span>501(c)(3) Tax-Deductible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                    <span>100% Goes to Community</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Funding Priorities -- Where Money Goes */}
      <section className="section-alt">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="frame-panel relative overflow-hidden">
              {/* Decorative background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 80% 20%, rgba(var(--color-gold-rgb), 0.04), transparent 50%)',
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <p className="text-eyebrow mb-3">WHERE YOUR MONEY GOES</p>
                  <h2 className="font-accent text-2xl md:text-3xl" style={{ color: '#2C2416' }}>
                    2026 Funding Priorities
                  </h2>
                  <p className="font-accent text-base mt-3 max-w-lg mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                    Full transparency on how every dollar is allocated
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {donate.fundingPriorities.map((priority) => {
                    const PriorityIcon = getIcon(priority.icon);
                    return (
                      <div
                        key={priority.title}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)' }}
                            >
                              <PriorityIcon className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                            </div>
                            <div>
                              <h3 className="font-display text-lg">{priority.title}</h3>
                              <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{priority.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-display" style={{ color: 'var(--color-gold)' }}>{priority.percentage}%</p>
                            <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>${priority.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div
                          className="w-full rounded-full h-2 overflow-hidden"
                          style={{ backgroundColor: 'var(--color-cream-warm)' }}
                          role="progressbar"
                          aria-valuenow={priority.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${priority.title}: ${priority.percentage}% of budget`}
                        >
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: 'var(--color-gold)' }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${priority.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Payment Options */}
      {donate.paymentOptions && donate.paymentOptions.length > 0 && (
        <section id="ways-to-give" className="section-contrast">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center space-y-4 mb-14">
                <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>WAYS TO GIVE</p>
                <h2 className="font-accent text-3xl md:text-4xl" style={{ color: 'var(--color-cream)' }}>
                  Preferred Ways to Give
                </h2>
                <p className="font-accent text-base max-w-lg mx-auto" style={{ color: 'rgba(var(--color-tan-50), 0.7)' }}>
                  Choose the method that works best for you
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {donate.paymentOptions.map((option, index) => {
                const OptionIcon = getIcon(option.icon || 'heart');
                return (
                  <Reveal key={option.method} delay={index * 0.12}>
                    <motion.div
                      className="border rounded-2xl p-5 sm:p-8 group relative overflow-hidden"
                      style={{
                        borderColor: 'rgba(255,255,255,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}
                      whileHover={{
                        borderColor: 'rgba(184, 150, 12, 0.25)',
                        backgroundColor: 'rgba(255,255,255,0.07)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Subtle hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at 30% 20%, rgba(var(--color-gold-rgb), 0.06), transparent 60%)',
                        }}
                      />

                      <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div
                              className="p-3 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                              style={{
                                backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                                border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                              }}
                            >
                              <OptionIcon className="h-5 w-5" style={{ color: 'var(--color-gold-muted)' }} />
                            </div>
                            <div>
                              <h3 className="font-display text-lg" style={{ color: 'var(--color-cream)' }}>
                                {option.method}
                              </h3>
                              <p className="text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.6)' }}>
                                {option.description}
                              </p>
                            </div>
                          </div>
                          {option.badge && (
                            <span
                              className="px-3 py-1 text-white text-xs rounded-full uppercase tracking-[0.1em] flex-shrink-0 flex items-center gap-1.5"
                              style={{ backgroundColor: 'var(--color-gold)' }}
                            >
                              <Sparkles className="h-3 w-3" aria-hidden="true" />
                              {option.badge}
                            </span>
                          )}
                        </div>

                        <ul className="space-y-3 mb-6">
                          {option.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-gold-muted)' }} aria-hidden="true" />
                              {detail}
                            </li>
                          ))}
                        </ul>

                        {option.linkUrl && option.linkText && (
                          <Link
                            href={option.linkUrl}
                            target={option.linkUrl.startsWith('http') ? '_blank' : undefined}
                            rel={option.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                            style={{
                              color: 'var(--color-gold)',
                              backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                              border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                            }}
                          >
                            {option.linkText}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Financial Transparency */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="luxury-card relative overflow-hidden">
              {/* Decorative element */}
              <div
                className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(var(--color-gold-rgb), 0.06), transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="text-center space-y-4 mb-10">
                  <p className="text-eyebrow">TRANSPARENCY</p>
                  <h2 className="font-accent text-2xl md:text-3xl" style={{ color: '#2C2416' }}>
                    Financial Transparency
                  </h2>
                  <p className="text-body-relaxed text-sm max-w-lg mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                    2025 budget breakdown -- see exactly how donations were used
                  </p>
                </div>

                <div className="space-y-6">
                  {donate.transparencyItems.map((item) => (
                    <div
                      key={item.category}
                      className="pb-6 last:border-b-0 last:pb-0"
                      style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-lg">{item.category}</h3>
                        <div className="flex items-center gap-4">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                              color: 'var(--color-gold)',
                            }}
                          >
                            {item.percentage}%
                          </span>
                          <span className="text-lg font-display" style={{ color: 'var(--color-gold)' }}>{item.amount}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>{item.description}</p>
                      <div
                        className="w-full rounded-full h-1.5 overflow-hidden"
                        style={{ backgroundColor: 'var(--color-cream-warm)' }}
                        role="progressbar"
                        aria-valuenow={item.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.category}: ${item.percentage}%`}
                      >
                        <motion.div
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-gold)' }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>GET INVOLVED</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Other Ways to Support Us
              </h2>
              <p className="font-accent text-base max-w-lg mx-auto" style={{ color: 'rgba(var(--color-tan-50), 0.7)' }}>
                Financial contributions are just one way to help
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {donate.otherWaysToHelp.map((option, index) => {
              const OptionIcon = getIcon(option.icon);
              return (
                <Reveal key={option.title} delay={index * 0.12}>
                  <motion.div
                    className="border rounded-2xl p-5 sm:p-8 group relative overflow-hidden h-full"
                    style={{
                      borderColor: 'rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }}
                    whileHover={{
                      borderColor: 'rgba(184, 150, 12, 0.2)',
                      backgroundColor: 'rgba(255,255,255,0.07)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 30% 20%, rgba(var(--color-gold-rgb), 0.05), transparent 60%)',
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="p-3 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                            border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                          }}
                        >
                          <OptionIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl" style={{ color: 'var(--color-cream)' }}>
                            {option.title}
                          </h3>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-gold-muted)' }}
                          >
                            {option.amount}
                          </p>
                        </div>
                      </div>
                      <p className="text-body-relaxed mb-6" style={{ color: 'rgba(var(--color-cream-rgb), 0.8)' }}>
                        {option.description}
                      </p>
                      <Link
                        href="/about"
                        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                        style={{
                          color: 'var(--color-gold)',
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                          border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                        }}
                      >
                        Learn More
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </motion.div>
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
              <div className="frame-panel relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 0% 50%, rgba(var(--color-gold-rgb), 0.05), transparent 50%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                  <div
                    className="inline-flex p-4 rounded-full"
                    style={{
                      backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                      border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                    }}
                  >
                    <Award className="h-8 w-8" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl mb-3">
                      {donate.taxInfo.title}
                    </h3>
                    <p className="text-body-relaxed mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                      <strong>{campConfig.name} is a registered 501(c)(3) non-profit organization.</strong>
                      {' '}{donate.taxInfo.description}
                    </p>
                    {donate.taxInfo.ein && (
                      <div
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.08)',
                          border: '1px solid rgba(var(--color-gold-rgb), 0.15)',
                          color: 'var(--color-ink-soft)',
                        }}
                      >
                        <Shield className="h-4 w-4" style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
                        <span>EIN: {donate.taxInfo.ein}</span>
                        <span style={{ color: 'rgba(var(--color-line-rgb), 0.5)' }}>|</span>
                        <span>Tax receipt sent via email after donation</span>
                      </div>
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
              <div className="luxury-card text-center relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--color-gold-rgb), 0.06), transparent 50%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div
                    className="inline-flex p-4 rounded-full mb-6"
                    style={{
                      backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                      border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                    }}
                  >
                    <Heart className="h-10 w-10" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <h2 className="font-accent text-2xl md:text-3xl mb-3" style={{ color: '#2C2416' }}>
                    {donate.donorRecognition.title}
                  </h2>
                  <p className="text-body-relaxed mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                    {donate.donorRecognition.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {donate.donorRecognition.tiers.map((tier) => (
                      <div
                        key={tier.title}
                        className="p-6 rounded-xl"
                        style={{ backgroundColor: 'rgba(var(--color-tan-50), 0.5)' }}
                      >
                        <h3 className="font-display text-lg mb-2">{tier.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{tier.description}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm mt-8" style={{ color: 'var(--color-ink-soft)' }}>
                    Full donor recognition list available upon request. We respect donor privacy preferences.
                  </p>
                </div>
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
              <div className="frame-panel text-center relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--color-gold-rgb), 0.05), transparent 60%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10">
                  <h2 className="font-accent text-2xl md:text-3xl mb-6" style={{ color: '#2C2416' }}>
                    {donate.gratitude.title}
                  </h2>
                  <p className="font-accent italic text-lg max-w-3xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                    {donate.gratitude.message}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA */}
      {donate.cta && (
        <section
          className="py-24 md:py-32 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a1f1a 0%, #4A5D5A 40%, #2C2416 80%)',
          }}
        >
          <div className="absolute inset-0 pattern-persian opacity-10" aria-hidden="true" />
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
            <Reveal>
              <div className="text-center space-y-6">
                <h2 className="font-accent text-3xl md:text-4xl tracking-tight text-white">
                  {donate.cta.title}
                </h2>
                <p className="text-body-relaxed text-lg max-w-2xl mx-auto text-white/80">
                  {donate.cta.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link href={donate.cta.buttons.primary.link} className="cta-primary cta-shimmer">
                    <span>{donate.cta.buttons.primary.text}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  {donate.cta.buttons.secondary && (
                    <Link
                      href={donate.cta.buttons.secondary.link}
                      className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full transition-all duration-200"
                      style={{
                        color: 'var(--color-cream)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <span>{donate.cta.buttons.secondary.text}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
