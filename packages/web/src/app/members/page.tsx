'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';

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
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="pt-32 pb-16">
          <div className="section-contained text-center">
            <h1 className="text-display-thin text-4xl md:text-5xl text-ink mb-4">
              {members.title}
            </h1>
            <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
              {members.subtitle}
            </p>
          </div>
        </section>

        {/* Login Section */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="luxury-card p-8">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                  <LogIn className="h-8 w-8 text-gold" />
                </div>
              </div>
              <h2 className="text-display-thin text-2xl text-center text-ink mb-6">
                {members.loginSection.title}
              </h2>

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
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-ink-soft">
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
                <p className="text-sm text-ink-soft">
                  Membership is by invitation only.{' '}
                  <Link href="/apply" className="text-gold font-medium hover:text-gold/80 transition-colors">
                    Apply to join
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <div className="text-center mb-12">
              <h2 className="text-display-thin text-3xl text-ink mb-4">
                {members.benefits.title}
              </h2>
              <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
                {members.benefits.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.benefits.items.map((benefit) => {
                const BenefitIcon = getIcon(benefit.icon);
                return (
                  <div
                    key={benefit.title}
                    className="luxury-card p-6"
                  >
                    <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 mb-4">
                      <BenefitIcon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="text-display-thin text-lg text-ink mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-body-relaxed text-sm text-ink-soft">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Member Spotlight */}
        <section className="py-16">
          <div className="section-contained">
            <div className="text-center mb-12">
              <h2 className="text-display-thin text-3xl text-ink mb-4">
                {members.spotlight.title}
              </h2>
              <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
                {members.spotlight.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.spotlight.members.map((member) => (
                <div
                  key={member.name}
                  className="text-center"
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/30 to-sage-light/30 border-2 border-gold/30" />
                  <h3 className="text-display-thin text-xl text-ink mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gold font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-ink-soft mb-3">
                    Member for {member.years}
                  </p>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {member.contribution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {members.communityStats.map((stat) => {
                const StatIcon = getIcon(stat.icon);
                return (
                  <div key={stat.label}>
                    <StatIcon className="h-8 w-8 text-gold mx-auto mb-3" />
                    <div className="text-display-thin text-4xl text-gold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-body-relaxed text-ink-soft">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {members.cta && (
          <section className="py-16">
            <div className="section-contained text-center">
              <div className="frame-panel max-w-4xl mx-auto">
                <h2 className="text-display-thin text-3xl text-ink mb-4">
                  {members.cta.title}
                </h2>
                <p className="text-body-relaxed text-lg text-ink-soft mb-8 max-w-2xl mx-auto">
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
            </div>
          </section>
        )}
      </main>
  );
}
