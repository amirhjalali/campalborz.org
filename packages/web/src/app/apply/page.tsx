'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '../../components/reveal';
import { useContentConfig } from '../../hooks/useConfig';
import { toast } from 'sonner';
import { CheckCircle, Loader2, ArrowRight, ExternalLink, FileText, Users, MessageSquare, Clock } from 'lucide-react';

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  interests: string;
  contribution: string;
  dietary: string;
  emergency_contact: string;
}

export default function ApplyPage() {
  const { apply } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '24%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    interests: '',
    contribution: '',
    dietary: '',
    emergency_contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!apply) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Apply page configuration not found</p>
      </main>
    );
  }

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    if (formData.interests.length < 50) {
      toast.error('Please tell us more about your interests (at least 50 characters)');
      return false;
    }

    if (formData.contribution.length < 50) {
      toast.error('Please tell us more about how you\'d like to contribute (at least 50 characters)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

    // Map form experience values to the API's enum
    const experienceMap: Record<string, string> = {
      'first-time': 'FIRST_TIMER',
      '1-3-years': 'BEEN_BEFORE',
      '4-7-years': 'VETERAN',
      '8-plus-years': 'VETERAN',
    };

    const trpcInput = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experience: experienceMap[formData.experience] || 'FIRST_TIMER',
      interests: formData.interests || undefined,
      contribution: formData.contribution || undefined,
      dietaryRestrictions: formData.dietary || undefined,
      emergencyContactName: formData.emergency_contact || undefined,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/trpc/applications.submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trpcInput),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const message =
          data.error?.json?.message ||
          data.error?.message ||
          'Submission failed';
        throw new Error(message);
      }

      setIsSubmitted(true);
      toast.success(apply.form.successMessage || 'Application submitted successfully!', {
        description: 'We\'ll review your application and get back to you soon.',
        duration: 5000,
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        interests: '',
        contribution: '',
        dietary: '',
        emergency_contact: '',
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Application submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';

      if (errorMessage.includes('already under review')) {
        toast.error('Duplicate application', {
          description: 'An application with this email is already under review. Please contact us if you need to update it.',
          duration: 7000,
        });
      } else {
        toast.error('Failed to submit application', {
          description: errorMessage !== 'Submission failed'
            ? errorMessage
            : 'Please try again or contact us directly if the problem persists.',
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const processIcons = [FileText, Users, MessageSquare, Clock];

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
            alt="Camp Alborz community members gathering under string lights, welcoming new members"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </motion.div>

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
            MEMBERSHIP APPLICATION
          </motion.p>
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
          >
            {apply.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto italic"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {apply.subtitle}
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

      {/* Success Message */}
      {isSubmitted && (
        <section className="py-24 md:py-32" role="status" aria-live="polite">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal direction="none">
              <div className="frame-panel text-center space-y-6">
                <div className="inline-flex p-4 rounded-full" style={{ backgroundColor: 'rgba(90, 107, 90, 0.12)', border: '1px solid rgba(90, 107, 90, 0.25)' }}>
                  <CheckCircle className="h-10 w-10" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                </div>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  Application Submitted Successfully!
                </h2>
                <p className="text-body-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  Thank you for your interest in joining our camp! We've received your application
                  and will review it carefully. You should receive a confirmation email shortly.
                  We'll be in touch within 1-2 weeks.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Legacy Form Option */}
      {apply.externalApplication && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-display-thin text-xl mb-2">
                      Prefer the Google Form?
                    </h3>
                    <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                      {apply.externalApplication.description}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Link
                      href={apply.externalApplication.linkUrl}
                      target={apply.externalApplication.linkUrl.startsWith('http') ? '_blank' : undefined}
                      rel={apply.externalApplication.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                      className="cta-primary"
                    >
                      <span>{apply.externalApplication.linkText}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {apply.externalApplication.note && (
                      <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{apply.externalApplication.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Application Form */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-10">
          <Reveal>
            <div className="frame-panel">
              <div className="mb-10">
                <p className="text-eyebrow mb-3">MEMBERSHIP APPLICATION</p>
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {apply.form.title}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <Reveal delay={0.1}>
                  <div className="space-y-6">
                    <div>
                      <p className="text-eyebrow mb-2">ABOUT YOU</p>
                      <h3 className="text-display-thin text-lg pb-3" style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                        {apply.form.fields.personalInfo.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="apply-name" className="form-label">
                          {apply.form.fields.personalInfo.nameLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div className="input-glow rounded-xl">
                          <input
                            type="text"
                            id="apply-name"
                            name="name"
                            required
                            className="form-input border-0 bg-transparent"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="apply-email" className="form-label">
                          {apply.form.fields.personalInfo.emailLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div className="input-glow rounded-xl">
                          <input
                            type="email"
                            id="apply-email"
                            name="email"
                            required
                            className="form-input border-0 bg-transparent"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="apply-phone" className="form-label">
                          {apply.form.fields.personalInfo.phoneLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div className="input-glow rounded-xl">
                          <input
                            type="tel"
                            id="apply-phone"
                            name="phone"
                            required
                            className="form-input border-0 bg-transparent"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="apply-emergency" className="form-label">
                          {apply.form.fields.personalInfo.emergencyContactLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div className="input-glow rounded-xl">
                          <input
                            type="text"
                            id="apply-emergency"
                            name="emergency_contact"
                            required
                            className="form-input border-0 bg-transparent"
                            placeholder={apply.form.fields.personalInfo.emergencyContactPlaceholder}
                            value={formData.emergency_contact}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Experience */}
                <Reveal delay={0.15}>
                  <div>
                    <p className="text-eyebrow mb-2">EXPERIENCE</p>
                    <label htmlFor="apply-experience" className="form-label">{apply.form.fields.experienceLabel}</label>
                    <div className="input-glow rounded-xl">
                      <select
                        id="apply-experience"
                        name="experience"
                        className="form-input border-0 bg-transparent"
                        value={formData.experience}
                        onChange={handleChange}
                      >
                        {apply.form.fields.experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Reveal>

                {/* Interests */}
                <Reveal delay={0.2}>
                  <div>
                    <label htmlFor="apply-interests" className="form-label">
                      {apply.form.fields.interestsLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div className="input-glow rounded-xl">
                      <textarea
                        id="apply-interests"
                        name="interests"
                        required
                        aria-required="true"
                        aria-describedby="interests-hint"
                        rows={4}
                        className="form-input border-0 bg-transparent"
                        placeholder={apply.form.fields.interestsPlaceholder}
                        value={formData.interests}
                        onChange={handleChange}
                      />
                    </div>
                    <p id="interests-hint" className="text-xs mt-1" style={{ color: 'var(--color-ink-faint)' }}>Minimum 50 characters</p>
                  </div>
                </Reveal>

                {/* Contribution */}
                <Reveal delay={0.25}>
                  <div>
                    <label htmlFor="apply-contribution" className="form-label">
                      {apply.form.fields.contributionLabel} <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <div className="input-glow rounded-xl">
                      <textarea
                        id="apply-contribution"
                        name="contribution"
                        required
                        aria-required="true"
                        aria-describedby="contribution-hint"
                        rows={4}
                        className="form-input border-0 bg-transparent"
                        placeholder={apply.form.fields.contributionPlaceholder}
                        value={formData.contribution}
                        onChange={handleChange}
                      />
                    </div>
                    <p id="contribution-hint" className="text-xs mt-1" style={{ color: 'var(--color-ink-faint)' }}>Minimum 50 characters</p>
                  </div>
                </Reveal>

                {/* Dietary */}
                <Reveal delay={0.3}>
                  <div>
                    <label htmlFor="apply-dietary" className="form-label">{apply.form.fields.dietaryLabel}</label>
                    <div className="input-glow rounded-xl">
                      <textarea
                        id="apply-dietary"
                        name="dietary"
                        rows={3}
                        className="form-input border-0 bg-transparent"
                        placeholder={apply.form.fields.dietaryPlaceholder}
                        value={formData.dietary}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </Reveal>

                {/* Terms */}
                <Reveal delay={0.35}>
                  <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-tan-50), 0.5)' }}>
                    <h4 className="text-display-thin text-lg mb-4">
                      {apply.form.beforeYouApply.title}
                    </h4>
                    <ul className="space-y-2">
                      {apply.form.beforeYouApply.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <span style={{ color: 'var(--color-gold)' }} className="mt-1">&#9670;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>

                {/* Submit */}
                <Reveal delay={0.4}>
                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full cta-primary cta-shimmer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>{apply.form.submitButton}</span>
                          <ArrowRight size={18} aria-hidden="true" />
                        </>
                      )}
                    </motion.button>
                    <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-ink-soft)' }}>
                      {apply.form.reviewMessage}
                    </p>
                  </div>
                </Reveal>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Application Process */}
      <section className="section-contrast">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="mb-14">
              <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>HOW IT WORKS</p>
              <h2 className="text-display-thin text-3xl md:text-4xl" style={{ color: 'var(--color-cream)' }}>
                {apply.process.title}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apply.process.steps.map((step, index) => {
              const StepIcon = processIcons[index] || FileText;
              return (
                <Reveal key={step.stepNumber} delay={index * 0.1}>
                  <div className="border rounded-2xl p-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    {index % 2 === 0 ? (
                      <StepIcon className="h-6 w-6 mx-auto mb-5" style={{ color: 'var(--color-gold-muted)' }} />
                    ) : (
                      <div className="inline-flex p-4 rounded-full mb-5" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                        <StepIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                      </div>
                    )}
                    <div className="text-3xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                      {step.stepNumber}
                    </div>
                    <h3 className="text-display-thin text-lg mb-3" style={{ color: 'var(--color-cream)' }}>
                      {step.title}
                    </h3>
                    <p className="text-body-relaxed text-sm" style={{ color: 'rgba(var(--color-cream-rgb), 0.7)' }}>
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 text-center space-y-6">
          <Reveal>
            <h2 className="text-display-thin text-2xl md:text-3xl">
              Questions About Applying?
            </h2>
            <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
              Learn more about who we are and what drives our community.
            </p>
            <Link href="/about" className="cta-secondary inline-flex">
              <span>About Camp Alborz</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
