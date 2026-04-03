'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Reveal } from '../../components/reveal';
import { useContentConfig } from '../../hooks/useConfig';
import { toast } from 'sonner';
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  FileText,
  Users,
  MessageSquare,
  User,
  Utensils,
  AlertCircle,
} from 'lucide-react';

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

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  interests?: string;
  contribution?: string;
  emergency_contact?: string;
}

const STEPS = [
  { id: 'personal', label: 'About You', icon: User },
  { id: 'experience', label: 'Experience', icon: MessageSquare },
  { id: 'contribution', label: 'Contribution', icon: Users },
  { id: 'details', label: 'Details', icon: Utensils },
] as const;

function CharacterCount({ value, min }: { value: string; min: number }) {
  const count = value.length;
  const remaining = min - count;
  const met = count >= min;

  return (
    <div className="flex items-center justify-between mt-1.5">
      <p className="text-xs" style={{ color: met ? 'var(--color-sage)' : 'var(--color-ink-faint)' }}>
        {met ? 'Minimum reached' : `${remaining} more character${remaining !== 1 ? 's' : ''} needed`}
      </p>
      <p className="text-xs tabular-nums" style={{ color: met ? 'var(--color-sage)' : 'var(--color-ink-faint)' }}>
        {count}/{min} min
      </p>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 text-xs mt-1.5"
      style={{ color: 'var(--color-error)' }}
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {error}
    </motion.p>
  );
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

  const [currentStep, setCurrentStep] = useState(0);
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  if (!apply) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Apply page configuration not found</p>
      </main>
    );
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return undefined;
      case 'email': {
        if (!value.trim()) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address.';
        return undefined;
      }
      case 'phone': {
        if (!value.trim()) return 'Phone number is required.';
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) return 'Please enter a valid phone number.';
        return undefined;
      }
      case 'emergency_contact':
        if (!value.trim()) return 'Emergency contact is required for safety.';
        return undefined;
      case 'interests':
        if (!value.trim()) return 'Please share your interests.';
        if (value.length < 50) return 'Please tell us more (at least 50 characters).';
        return undefined;
      case 'contribution':
        if (!value.trim()) return 'Please share how you would like to contribute.';
        if (value.length < 50) return 'Please tell us more (at least 50 characters).';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: FieldErrors = {};

    if (step === 0) {
      const nameErr = validateField('name', formData.name);
      const emailErr = validateField('email', formData.email);
      const phoneErr = validateField('phone', formData.phone);
      const emergencyErr = validateField('emergency_contact', formData.emergency_contact);
      if (nameErr) errors.name = nameErr;
      if (emailErr) errors.email = emailErr;
      if (phoneErr) errors.phone = phoneErr;
      if (emergencyErr) errors.emergency_contact = emergencyErr;
    } else if (step === 1) {
      // Experience selection is optional, no hard validation needed
    } else if (step === 2) {
      const interestsErr = validateField('interests', formData.interests);
      const contributionErr = validateField('contribution', formData.contribution);
      if (interestsErr) errors.interests = interestsErr;
      if (contributionErr) errors.contribution = contributionErr;
    }
    // Step 3 (Details) is optional

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (Object.keys(errors).length > 0) {
      // Mark all fields in this step as touched
      const stepFields: Record<number, string[]> = {
        0: ['name', 'email', 'phone', 'emergency_contact'],
        1: ['experience'],
        2: ['interests', 'contribution'],
        3: ['dietary'],
      };
      setTouchedFields((prev) => {
        const next = new Set(prev);
        stepFields[step]?.forEach((f) => next.add(f));
        return next;
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (touchedFields.has(name)) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => new Set(prev).add(name));
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps
    let hasErrors = false;
    for (let i = 0; i <= 3; i++) {
      if (!validateStep(i)) {
        hasErrors = true;
        setCurrentStep(i);
        break;
      }
    }
    if (hasErrors) return;

    setIsSubmitting(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

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
      setCurrentStep(0);
      setFieldErrors({});
      setTouchedFields(new Set());

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

  const processIcons = [FileText, MessageSquare, Users];

  // Step completion check
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name.trim() && formData.email.trim() && formData.phone.trim() && formData.emergency_contact.trim()
          && !validateField('name', formData.name) && !validateField('email', formData.email) && !validateField('phone', formData.phone));
      case 1:
        return !!formData.experience;
      case 2:
        return !!(formData.interests.length >= 50 && formData.contribution.length >= 50);
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

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
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {apply.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto italic"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-flex p-4 rounded-full"
                  style={{ backgroundColor: 'rgba(90, 107, 90, 0.12)', border: '1px solid rgba(90, 107, 90, 0.25)' }}
                >
                  <CheckCircle className="h-10 w-10" style={{ color: 'var(--color-sage)' }} aria-hidden="true" />
                </motion.div>
                <h2 className="font-accent text-2xl md:text-3xl tracking-tight" style={{ color: '#2C2416' }}>
                  Application Submitted Successfully!
                </h2>
                <p className="text-body-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  Thank you for your interest in joining our camp! We've received your application
                  and will review it carefully. You should receive a confirmation email shortly.
                  We'll be in touch within 1-2 weeks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/about" className="cta-secondary inline-flex">
                    <span>Learn More About Us</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-sage)' }}
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Legacy Form Option */}
      {apply.externalApplication && !isSubmitted && (
        <section className="py-16 md:py-20">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="font-accent text-xl tracking-tight mb-2" style={{ color: '#2C2416' }}>
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

      {!isSubmitted && <div className="ornate-divider" />}

      {/* Application Form */}
      {!isSubmitted && (
        <section className="py-24 md:py-32" ref={formRef}>
          <div className="max-w-3xl mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel">
                <div className="mb-10">
                  <p className="text-eyebrow mb-3">MEMBERSHIP APPLICATION</p>
                  <h2 className="font-accent text-2xl md:text-3xl tracking-tight" style={{ color: '#2C2416' }}>
                    {apply.form.title}
                  </h2>
                </div>

                {/* Step Progress Indicator */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-3">
                    {STEPS.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index === currentStep;
                      const isComplete = index < currentStep || isStepComplete(index);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => {
                            // Allow navigating to completed steps or current
                            if (index <= currentStep || isStepComplete(currentStep)) {
                              setCurrentStep(index);
                            }
                          }}
                          className="flex flex-col items-center gap-2 group relative"
                          disabled={index > currentStep && !isStepComplete(currentStep)}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                              isActive
                                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                                : isComplete
                                ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10'
                                : 'border-[var(--color-line)] bg-transparent'
                            }`}
                          >
                            {isComplete && !isActive ? (
                              <CheckCircle
                                className="h-5 w-5"
                                style={{ color: 'var(--color-sage)' }}
                              />
                            ) : (
                              <StepIcon
                                className="h-5 w-5"
                                style={{
                                  color: isActive
                                    ? 'var(--color-gold)'
                                    : 'var(--color-ink-faint)',
                                }}
                              />
                            )}
                          </div>
                          <span
                            className="text-[11px] font-medium tracking-wide hidden sm:block"
                            style={{
                              color: isActive
                                ? 'var(--color-gold)'
                                : isComplete
                                ? 'var(--color-sage)'
                                : 'var(--color-ink-faint)',
                            }}
                          >
                            {step.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(var(--color-line-rgb), 0.2)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--color-gold)' }}
                      initial={false}
                      animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2" style={{ color: 'var(--color-ink-faint)' }}>
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Step 0: Personal Information */}
                    {currentStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <p className="text-eyebrow mb-2">ABOUT YOU</p>
                          <h3 className="font-accent text-lg tracking-tight pb-3" style={{ color: '#2C2416', borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                            {apply.form.fields.personalInfo.title}
                          </h3>
                          <p className="text-body-relaxed text-sm mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                            Let us know who you are. All fields marked with an asterisk are required.
                          </p>
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
                                className={`form-input border-0 bg-transparent ${fieldErrors.name && touchedFields.has('name') ? 'ring-2 ring-red-300' : ''}`}
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="name"
                                placeholder="Your full name"
                              />
                            </div>
                            <FieldError error={touchedFields.has('name') ? fieldErrors.name : undefined} />
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
                                className={`form-input border-0 bg-transparent ${fieldErrors.email && touchedFields.has('email') ? 'ring-2 ring-red-300' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="email"
                                placeholder="your@email.com"
                              />
                            </div>
                            <FieldError error={touchedFields.has('email') ? fieldErrors.email : undefined} />
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
                                className={`form-input border-0 bg-transparent ${fieldErrors.phone && touchedFields.has('phone') ? 'ring-2 ring-red-300' : ''}`}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="tel"
                                placeholder="(555) 123-4567"
                              />
                            </div>
                            <FieldError error={touchedFields.has('phone') ? fieldErrors.phone : undefined} />
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
                                className={`form-input border-0 bg-transparent ${fieldErrors.emergency_contact && touchedFields.has('emergency_contact') ? 'ring-2 ring-red-300' : ''}`}
                                placeholder={apply.form.fields.personalInfo.emergencyContactPlaceholder}
                                value={formData.emergency_contact}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                            <FieldError error={touchedFields.has('emergency_contact') ? fieldErrors.emergency_contact : undefined} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Experience */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <p className="text-eyebrow mb-2">BURNING MAN EXPERIENCE</p>
                          <h3 className="font-accent text-lg tracking-tight pb-3" style={{ color: '#2C2416', borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                            Tell Us About Your Journey
                          </h3>
                          <p className="text-body-relaxed text-sm mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                            Whether this is your first time or you are a seasoned burner, we welcome all experience levels.
                          </p>
                        </div>

                        <div>
                          <label htmlFor="apply-experience" className="form-label">{apply.form.fields.experienceLabel}</label>
                          <div className="space-y-2 mt-2">
                            {apply.form.fields.experienceOptions.map((option) => (
                              <label
                                key={option.value}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                                  formData.experience === option.value
                                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                                    : 'border-transparent bg-white/50 hover:bg-white/80'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="experience"
                                  value={option.value}
                                  checked={formData.experience === option.value}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  formData.experience === option.value
                                    ? 'border-[var(--color-gold)]'
                                    : 'border-gray-300'
                                }`}>
                                  {formData.experience === option.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: 'var(--color-gold)' }}
                                    />
                                  )}
                                </div>
                                <span className="text-sm font-medium" style={{ color: '#2C2416' }}>
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Interests & Contribution */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <p className="text-eyebrow mb-2">YOUR CONTRIBUTION</p>
                          <h3 className="font-accent text-lg tracking-tight pb-3" style={{ color: '#2C2416', borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                            What Brings You Here
                          </h3>
                          <p className="text-body-relaxed text-sm mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                            Camp Alborz thrives on the unique talents and passions each member brings. Share what excites you about our community.
                          </p>
                        </div>

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
                              className={`form-input border-0 bg-transparent ${fieldErrors.interests && touchedFields.has('interests') ? 'ring-2 ring-red-300' : ''}`}
                              placeholder={apply.form.fields.interestsPlaceholder}
                              value={formData.interests}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </div>
                          <CharacterCount value={formData.interests} min={50} />
                          <FieldError error={touchedFields.has('interests') ? fieldErrors.interests : undefined} />
                        </div>

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
                              className={`form-input border-0 bg-transparent ${fieldErrors.contribution && touchedFields.has('contribution') ? 'ring-2 ring-red-300' : ''}`}
                              placeholder={apply.form.fields.contributionPlaceholder}
                              value={formData.contribution}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </div>
                          <CharacterCount value={formData.contribution} min={50} />
                          <FieldError error={touchedFields.has('contribution') ? fieldErrors.contribution : undefined} />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Details (Dietary + Terms) */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <p className="text-eyebrow mb-2">ADDITIONAL DETAILS</p>
                          <h3 className="font-accent text-lg tracking-tight pb-3" style={{ color: '#2C2416', borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                            Almost There
                          </h3>
                          <p className="text-body-relaxed text-sm mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                            Just a couple more optional details and you are ready to submit your application.
                          </p>
                        </div>

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
                          <p className="text-xs mt-1" style={{ color: 'var(--color-ink-faint)' }}>Optional -- helps us plan camp meals.</p>
                        </div>

                        {/* Terms */}
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-tan-50), 0.5)' }}>
                          <h4 className="font-accent text-lg tracking-tight mb-4" style={{ color: '#2C2416' }}>
                            {apply.form.beforeYouApply.title}
                          </h4>
                          <ul className="space-y-2.5">
                            {apply.form.beforeYouApply.items.map((item, index) => (
                              <li key={index} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                                <span style={{ color: 'var(--color-gold)' }} className="mt-0.5">&#9670;</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Application Summary */}
                        <div className="p-6 rounded-xl border" style={{ borderColor: 'rgba(var(--color-line-rgb), 0.3)', backgroundColor: 'white' }}>
                          <h4 className="font-accent text-base tracking-tight mb-4 flex items-center gap-2" style={{ color: '#2C2416' }}>
                            <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-sage)' }} />
                            Application Summary
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>Name</p>
                              <p style={{ color: '#2C2416' }}>{formData.name || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>Email</p>
                              <p style={{ color: '#2C2416' }}>{formData.email || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>Phone</p>
                              <p style={{ color: '#2C2416' }}>{formData.phone || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>Experience</p>
                              <p style={{ color: '#2C2416' }}>
                                {apply.form.fields.experienceOptions.find(o => o.value === formData.experience)?.label || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 mt-8" style={{ borderTop: '1px solid rgba(var(--color-line-rgb), 0.2)' }}>
                    {currentStep > 0 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="cta-secondary inline-flex items-center gap-2"
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < STEPS.length - 1 ? (
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cta-primary inline-flex items-center gap-2"
                      >
                        <span>Continue</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className="cta-primary cta-shimmer inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>{apply.form.submitButton}</span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {currentStep === STEPS.length - 1 && (
                    <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-ink-soft)' }}>
                      {apply.form.reviewMessage}
                    </p>
                  )}
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <div className="ornate-divider" />

      {/* Application Process */}
      <section className="section-contrast">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="mb-14">
              <p className="text-eyebrow mb-3" style={{ color: 'var(--color-gold-muted)' }}>HOW IT WORKS</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                {apply.process.title}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apply.process.steps.map((step, index) => {
              const StepIcon = processIcons[index] || FileText;
              return (
                <Reveal key={step.stepNumber} delay={index * 0.1}>
                  <div className="border rounded-2xl p-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="inline-flex p-4 rounded-full mb-5" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                      <StepIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                    </div>
                    <div className="text-3xl font-display mb-2" style={{ color: 'var(--color-gold)' }}>
                      {step.stepNumber}
                    </div>
                    <h3 className="font-accent text-lg tracking-tight mb-3" style={{ color: 'var(--color-cream)' }}>
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
            <h2 className="font-accent text-2xl md:text-3xl tracking-tight" style={{ color: '#2C2416' }}>
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
