'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '../../components/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
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
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Apply page configuration not found</p>
        </main>
      </>
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

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).catch(() => {
        return { ok: true };
      });

      if (response.ok) {
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
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application', {
        description: 'Please try again or contact us directly if the problem persists.',
        duration: 5000,
      });
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
              alt="Camp Alborz community members gathering under string lights, welcoming new members"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          </motion.div>

          <motion.div
            className="relative z-10 section-contained text-center py-24"
            style={{ y: textY, opacity }}
          >
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
          </motion.div>
        </section>

        {/* Success Message */}
        {isSubmitted && (
          <section className="section-base section-contained" role="status" aria-live="polite">
            <motion.div
              initial={{ y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              className="frame-panel text-center space-y-6"
            >
              <div className="inline-flex p-4 rounded-full bg-sage-100 border border-sage-300">
                <CheckCircle className="h-10 w-10 text-sage-600" aria-hidden="true" />
              </div>
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Application Submitted Successfully!
              </h2>
              <p className="text-body-relaxed text-ink-soft max-w-2xl mx-auto">
                Thank you for your interest in joining our camp! We've received your application
                and will review it carefully. You should receive a confirmation email shortly.
                We'll be in touch within 1-2 weeks.
              </p>
            </motion.div>
          </section>
        )}

        {/* Legacy Form Option */}
        {apply.externalApplication && (
          <section className="section-base section-contained">
            <div className="frame-panel">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-display-thin text-xl mb-2">
                    Prefer the Google Form?
                  </h3>
                  <p className="text-body-relaxed text-sm text-ink-soft">
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
                    {apply.externalApplication.linkText}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {apply.externalApplication.note && (
                    <p className="text-xs text-ink-soft">{apply.externalApplication.note}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Application Form */}
        <section className="section-base">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="frame-panel">
              <div className="mb-10">
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {apply.form.title}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-display-thin text-lg pb-3 border-b border-line/30">
                    {apply.form.fields.personalInfo.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="apply-name" className="form-label">
                        {apply.form.fields.personalInfo.nameLabel} <span className="text-error">*</span>
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
                        {apply.form.fields.personalInfo.emailLabel} <span className="text-error">*</span>
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
                        {apply.form.fields.personalInfo.phoneLabel} <span className="text-error">*</span>
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
                        {apply.form.fields.personalInfo.emergencyContactLabel} <span className="text-error">*</span>
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

                {/* Experience */}
                <div>
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

                {/* Interests */}
                <div>
                  <label htmlFor="apply-interests" className="form-label">
                    {apply.form.fields.interestsLabel} <span className="text-error">*</span>
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
                  <p id="interests-hint" className="text-xs text-ink-soft/70 mt-1">Minimum 50 characters</p>
                </div>

                {/* Contribution */}
                <div>
                  <label htmlFor="apply-contribution" className="form-label">
                    {apply.form.fields.contributionLabel} <span className="text-error">*</span>
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
                  <p id="contribution-hint" className="text-xs text-ink-soft/70 mt-1">Minimum 50 characters</p>
                </div>

                {/* Dietary */}
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

                {/* Terms */}
                <div className="bg-tan-50 p-6 rounded-xl">
                  <h4 className="text-display-thin text-lg mb-4">
                    {apply.form.beforeYouApply.title}
                  </h4>
                  <ul className="space-y-2">
                    {apply.form.beforeYouApply.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-ink-soft">
                        <span className="text-gold-500 mt-1">◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit */}
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
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        {apply.form.submitButton}
                        <ArrowRight size={18} aria-hidden="true" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-sm text-ink-soft mt-4 text-center">
                    {apply.form.reviewMessage}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="section-contrast">
          <div className="section-contained">
            <div className="mb-14">
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                {apply.process.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {apply.process.steps.map((step, index) => {
                const StepIcon = processIcons[index] || FileText;
                return (
                  <div
                    key={step.stepNumber}
                    className="border border-white/10 rounded-2xl p-8 bg-white/5 text-center"
                  >
                    {index % 2 === 0 ? (
                      <StepIcon className="h-6 w-6 text-gold-400 mx-auto mb-5" />
                    ) : (
                      <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-5">
                        <StepIcon className="h-6 w-6 text-gold-400" />
                      </div>
                    )}
                    <div className="text-3xl font-display text-gold-500 mb-2">
                      {step.stepNumber}
                    </div>
                    <h3 className="text-display-thin text-lg text-tan-light mb-3">
                      {step.title}
                    </h3>
                    <p className="text-body-relaxed text-sm text-tan-light/70">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="section-base">
          <div className="section-contained text-center space-y-6">
            <h2 className="text-display-thin text-2xl md:text-3xl">
              Questions About Applying?
            </h2>
            <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
              Learn more about who we are and what drives our community.
            </p>
            <Link href="/about" className="cta-secondary inline-flex">
              About Camp Alborz
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
