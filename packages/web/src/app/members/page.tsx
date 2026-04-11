'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, Eye, EyeOff, AlertCircle, Users, Globe, Flame, Palette, Quote, Calendar, Sparkles } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';
import { Reveal } from '../../components/reveal';

const campVoices = [
  {
    quote: 'The playa can feel overwhelming \u2014 but the moment you smell the chai at Camp Alborz, you\u2019re home.',
    name: 'Maryam',
    years: '5th year',
  },
  {
    quote: 'I came for the tea, stayed for the family, and now I can\u2019t imagine Burning Man without this crew.',
    name: 'Arash',
    years: '7th year',
  },
  {
    quote: 'Camp Alborz taught my daughter that her heritage is something to celebrate, not hide.',
    name: 'Parisa',
    years: '3rd year',
  },
];

const communityStats = [
  { label: 'Members', value: '50+', Icon: Users },
  { label: 'Countries', value: '12+', Icon: Globe },
  { label: 'Founded', value: '2008', Icon: Flame },
  { label: 'Art Installations', value: '8', Icon: Palette },
];

export default function MembersPage() {
  const { members } = useContentConfig();
  const { user, isAuthenticated, isLoading: authLoading, error, login, clearError } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to the full portal dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/portal');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!members) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Members page configuration not found</p>
      </main>
    );
  }

  // Redirect authenticated users to the proper portal dashboard
  if (isAuthenticated && user) {
    return null; // useEffect above handles redirect to /portal
  }

  // Login view (not authenticated)
  return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
        {/* Hero Section — warm community-first framing */}
        <section className="pt-32 pb-16">
          <div className="section-contained text-center">
            <Reveal direction="up">
              <p className="text-caption tracking-widest uppercase mb-4" style={{ color: 'var(--color-gold)' }}>
                Our People
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6" style={{ color: '#2C2416' }}>
                The Heart of Camp Alborz
              </h1>
            </Reveal>
            <Reveal direction="up" delay={0.2}>
              <p className="font-accent text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#4a4a42' }}>
                Fifty families, one camp. Here&apos;s who we are and what we build together.
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.3}>
              <div className="ornate-divider mt-8" aria-hidden="true">
                <span />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Who We Are — community snapshot */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <Reveal direction="up">
              <div className="max-w-3xl mx-auto text-center mb-14">
                <h2 className="font-display text-3xl md:text-4xl mb-6" style={{ color: '#2C2416' }}>
                  Who We Are
                </h2>
                <p className="text-body-relaxed text-lg leading-relaxed" style={{ color: '#4a4a42' }}>
                  Camp Alborz is home to engineers, artists, teachers, students, musicians, and dreamers
                  &mdash; bound together by Persian hospitality and a love of creating. Some of us have
                  burned for a decade; some are preparing for their first year. All of us belong.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {communityStats.map((stat, index) => (
                <Reveal key={stat.label} direction="up" delay={index * 0.1}>
                  <div className="luxury-card p-6 text-center">
                    <stat.Icon className="h-7 w-7 mx-auto mb-3" style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
                    <div className="font-display text-3xl md:text-4xl mb-1" style={{ color: 'var(--color-gold)' }}>
                      {stat.value}
                    </div>
                    <div className="text-body-relaxed text-sm" style={{ color: '#4a4a42' }}>
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Camp Voices — member quotes */}
        <section className="py-16">
          <div className="section-contained">
            <Reveal direction="up">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4" style={{ color: '#2C2416' }}>
                  Camp Voices
                </h2>
                <p className="text-body-relaxed text-lg max-w-2xl mx-auto" style={{ color: '#4a4a42' }}>
                  In their own words, why our members keep coming back.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {campVoices.map((voice, index) => (
                <Reveal key={voice.name} direction="up" delay={index * 0.12}>
                  <div className="luxury-card p-6 h-full flex flex-col justify-between">
                    <div>
                      <Quote className="h-6 w-6 mb-4" style={{ color: 'var(--color-gold-muted)', opacity: 0.6 }} aria-hidden="true" />
                      <p className="font-accent text-base md:text-lg italic leading-relaxed mb-6" style={{ color: '#2C2416', opacity: 0.85 }}>
                        &ldquo;{voice.quote}&rdquo;
                      </p>
                    </div>
                    <p className="text-caption text-xs tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                      {voice.name} &mdash; {voice.years}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Member Spotlight */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <Reveal direction="up">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl mb-4" style={{ color: '#2C2416' }}>
                  {members.spotlight.title}
                </h2>
                <p className="text-body-relaxed text-lg max-w-2xl mx-auto" style={{ color: '#4a4a42' }}>
                  {members.spotlight.subtitle}
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.spotlight.members.map((member, index) => (
                <Reveal key={member.name} direction="up" delay={index * 0.1}>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/30 to-sage-light/30 border-2 border-gold/30" />
                    <h3 className="font-display text-xl mb-1" style={{ color: '#2C2416' }}>
                      {member.name}
                    </h3>
                    <p className="font-medium mb-2" style={{ color: 'var(--color-gold)' }}>
                      {member.role}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#4a4a42' }}>
                      Member for {member.years}
                    </p>
                    <p className="text-body-relaxed text-sm" style={{ color: '#4a4a42' }}>
                      {member.contribution}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Community at a Glance — config-driven stats */}
        <section className="py-16">
          <div className="section-contained">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {members.communityStats.map((stat, index) => {
                const StatIcon = getIcon(stat.icon);
                return (
                  <Reveal key={stat.label} direction="up" delay={index * 0.08}>
                    <div>
                      <StatIcon className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-gold)' }} />
                      <div className="font-display text-4xl mb-1" style={{ color: 'var(--color-gold)' }}>
                        {stat.value}
                      </div>
                      <div className="text-body-relaxed" style={{ color: '#4a4a42' }}>
                        {stat.label}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* What It Means to Be Part of Camp Alborz — softer benefits framing */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <Reveal direction="up">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl mb-4" style={{ color: '#2C2416' }}>
                  What It Means to Be Part of Camp Alborz
                </h2>
                <p className="text-body-relaxed text-lg max-w-2xl mx-auto" style={{ color: '#4a4a42' }}>
                  {members.benefits.subtitle}
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.benefits.items.map((benefit, index) => {
                const BenefitIcon = getIcon(benefit.icon);
                return (
                  <Reveal key={benefit.title} direction="up" delay={index * 0.08}>
                    <div className="luxury-card p-6">
                      <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 mb-4">
                        <BenefitIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <h3 className="font-display text-lg mb-2" style={{ color: '#2C2416' }}>
                        {benefit.title}
                      </h3>
                      <p className="text-body-relaxed text-sm" style={{ color: '#4a4a42' }}>
                        {benefit.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Member Login — moved below community content */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <div className="luxury-card p-8">
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                    <LogIn className="h-8 w-8" style={{ color: 'var(--color-gold)' }} />
                  </div>
                </div>
                <h2 className="font-display text-2xl text-center mb-2" style={{ color: '#2C2416' }}>
                  {members.loginSection.title}
                </h2>
                <p className="text-body-relaxed text-sm text-center mb-6" style={{ color: '#4a4a42' }}>
                  Already part of the family? Sign in to access your portal.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl" role="alert" aria-live="assertive">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" aria-hidden="true" />
                      <p className="text-amber-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="form-label">
                      {members.loginSection.emailLabel}
                    </label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="form-label mb-0">
                        {members.loginSection.passwordLabel}
                      </label>
                      <Link href="/forgot-password" className="text-sm text-gold hover:text-gold/80 transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input pr-12"
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-gold transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-gold border-line/40 rounded focus:ring-gold"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm" style={{ color: '#4a4a42' }}>
                      Remember me for 30 days
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Signing in...' : members.loginSection.submitButton}</span>
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color: '#4a4a42' }}>
                    Membership is by invitation only.{' '}
                    <Link href="/apply" className="text-gold font-medium hover:text-gold/80 transition-colors">
                      Apply to join
                    </Link>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA Section — config driven */}
        {members.cta && (
          <section className="py-16 section-alt">
            <div className="section-contained text-center">
              <Reveal direction="up">
                <div className="frame-panel max-w-4xl mx-auto">
                  <h2 className="font-display text-3xl mb-4" style={{ color: '#2C2416' }}>
                    {members.cta.title}
                  </h2>
                  <p className="text-body-relaxed text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#4a4a42' }}>
                    {members.cta.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={members.cta.buttons.primary.link} className="cta-primary">
                      <span>{members.cta.buttons.primary.text}</span>
                      <span><ArrowRight className="ml-2 h-5 w-5" /></span>
                    </Link>
                    <Link href={members.cta.buttons.secondary.link} className="cta-secondary">
                      <span>{members.cta.buttons.secondary.text}</span>
                      <span><ArrowRight className="ml-2 h-5 w-5" /></span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Not a member yet? — warm welcome CTA */}
        <section className="py-16">
          <div className="section-contained text-center">
            <Reveal direction="up">
              <div className="max-w-3xl mx-auto">
                <Sparkles className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
                <h2 className="font-display text-3xl md:text-4xl mb-4" style={{ color: '#2C2416' }}>
                  Not a Member Yet?
                </h2>
                <p className="text-body-relaxed text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#4a4a42' }}>
                  Everyone&apos;s welcome. Start with an event, explore our culture, or apply to join.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/events" className="cta-secondary">
                    <span><Calendar className="mr-2 h-5 w-5" aria-hidden="true" /></span>
                    <span>Upcoming Events</span>
                  </Link>
                  <Link href="/culture" className="cta-secondary">
                    <span><Globe className="mr-2 h-5 w-5" aria-hidden="true" /></span>
                    <span>Our Culture</span>
                  </Link>
                  <Link href="/apply" className="cta-primary">
                    <span>Apply to Join</span>
                    <span><ArrowRight className="ml-2 h-5 w-5" /></span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
  );
}
