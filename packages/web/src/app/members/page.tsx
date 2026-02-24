'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn, Eye, EyeOff, User, LogOut, AlertCircle } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { OnlineMembers } from '../../components/notifications/OnlineMembers';
import { ChatRoom } from '../../components/chat/ChatRoom';

export default function MembersPage() {
  const { members } = useContentConfig();
  const { user, isAuthenticated, isLoading: authLoading, error, login, logout, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portalInfo = members?.portalInfo;

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

  const handleLogout = () => {
    logout();
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

  // Authenticated member view
  if (isAuthenticated && user) {
    return (
      <main className="min-h-screen bg-cream">
        {/* Member Dashboard Header */}
        <section className="pt-32 pb-16">
            <div className="section-contained">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/40 flex items-center justify-center">
                    <User className="h-8 w-8 text-gold" />
                  </div>
                  <div>
                    <h1 className="text-display-thin text-3xl text-ink">{user.name}</h1>
                    <p className="text-body-relaxed text-sm text-ink-soft">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <OnlineMembers compact />
                  <button
                    onClick={handleLogout}
                    className="cta-secondary flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </section>

          {portalInfo && (
            <>
              {/* Portal Highlights */}
              <section className="py-16">
                <div className="section-contained">
                  <div className="text-center mb-10">
                    <h2 className="text-display-thin text-3xl text-ink mb-3">
                      {portalInfo.welcomeTitle}
                    </h2>
                    <p className="text-body-relaxed text-ink-soft">
                      Two simple steps to lock in your placement.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portalInfo.highlights.map((item) => (
                      <div
                        key={item.title}
                        className="luxury-card p-6"
                      >
                        <h3 className="text-display-thin text-xl text-ink mb-2">{item.title}</h3>
                        <p className="text-body-relaxed text-ink-soft">{item.description}</p>
                        {item.linkUrl && item.linkText && (
                          <Link
                            href={item.linkUrl}
                            target={item.linkUrl.startsWith('http') ? '_blank' : undefined}
                            rel={item.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                            className="inline-flex items-center text-gold hover:text-gold/80 mt-4 font-medium transition-colors"
                          >
                            {item.linkText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Dues & Grid Fees */}
              <section className="py-16 section-alt">
                <div className="section-contained">
                  <div className="luxury-card p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                      <div className="flex-1">
                        <p className="text-display-wide text-xs tracking-[0.4em] text-gold mb-2">DUES</p>
                        <h3 className="text-display-thin text-3xl text-ink mb-3">
                          {portalInfo.dues.amountLabel}
                        </h3>
                        <p className="text-body-relaxed text-ink-soft mb-4">{portalInfo.dues.description}</p>
                        <ul className="space-y-2 text-body-relaxed text-ink-soft">
                          {portalInfo.dues.breakdown.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-gold mr-2">&#8226;</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex-1">
                        <p className="text-display-wide text-xs tracking-[0.4em] text-gold mb-3">GRID FEES</p>
                        <div className="space-y-3">
                          {portalInfo.dues.gridFees.map((fee) => (
                            <div
                              key={fee.label}
                              className="border border-line/40 rounded-xl p-4 bg-cream/50"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-ink">{fee.label}</p>
                                <span className="text-gold font-semibold">{fee.amount}</span>
                              </div>
                              <p className="text-sm text-ink-soft">{fee.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Options */}
              {portalInfo.paymentOptions && portalInfo.paymentOptions.length > 0 && (
                <section className="py-16">
                  <div className="section-contained">
                    <div className="text-center mb-10">
                      <h3 className="text-display-thin text-3xl text-ink mb-2">
                        How to Send Your Dues
                      </h3>
                      <p className="text-body-relaxed text-ink-soft">
                        Choose the option that works best for you.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {portalInfo.paymentOptions.map((option) => {
                        const OptionIcon = getIcon(option.icon || 'heart');
                        return (
                          <div
                            key={option.method}
                            className="luxury-card p-6"
                          >
                            <div className="flex items-center mb-3">
                              <div className="p-3 bg-gold/10 rounded-lg mr-3 border border-gold/20">
                                <OptionIcon className="h-5 w-5 text-gold" />
                              </div>
                              <div>
                                <p className="font-semibold text-ink">{option.method}</p>
                                <p className="text-sm text-ink-soft">{option.description}</p>
                              </div>
                            </div>
                            <ul className="space-y-2 text-sm text-ink-soft">
                              {option.details.map((detail, detailIdx) => (
                                <li key={detailIdx} className="flex items-start">
                                  <span className="text-gold mr-2">&#8226;</span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                            {option.linkUrl && option.linkText && (
                              <Link
                                href={option.linkUrl}
                                target={option.linkUrl.startsWith('http') ? '_blank' : undefined}
                                rel={option.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                                className="inline-flex items-center text-gold hover:text-gold/80 font-medium text-sm mt-4 transition-colors"
                              >
                                {option.linkText}
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* Resources & Fundraisers */}
              <section className="py-16 section-alt">
                <div className="section-contained grid gap-8 lg:grid-cols-2">
                  <div className="luxury-card p-6">
                    <h3 className="text-display-thin text-2xl text-ink mb-4">Key Resources</h3>
                    <div className="space-y-4">
                      {portalInfo.resources.map((resource) => (
                        <div key={resource.title}>
                          <p className="font-semibold text-ink">{resource.title}</p>
                          <p className="text-sm text-ink-soft">{resource.description}</p>
                          <Link
                            href={resource.linkUrl}
                            target={resource.linkUrl.startsWith('http') ? '_blank' : undefined}
                            rel={resource.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                            className="inline-flex items-center text-gold hover:text-gold/80 text-sm font-medium mt-2 transition-colors"
                          >
                            {resource.linkText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="luxury-card p-6">
                    <h3 className="text-display-thin text-2xl text-ink mb-4">Upcoming Fundraisers</h3>
                    <div className="space-y-4">
                      {portalInfo.fundraisers.map((fundraiser) => (
                        <div key={fundraiser.title} className="border border-line/40 rounded-xl p-4">
                          <p className="text-display-wide text-xs tracking-[0.3em] text-gold mb-1">{fundraiser.date}</p>
                          <p className="font-semibold text-ink">{fundraiser.title}</p>
                          <p className="text-sm text-ink-soft">{fundraiser.description}</p>
                          {fundraiser.linkUrl && fundraiser.linkText && (
                            <Link
                              href={fundraiser.linkUrl}
                              target={fundraiser.linkUrl.startsWith('http') ? '_blank' : undefined}
                              rel={fundraiser.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                              className="inline-flex items-center text-gold hover:text-gold/80 text-sm font-medium mt-2 transition-colors"
                            >
                              {fundraiser.linkText}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Camp Chat & Online Members */}
              <section className="py-16">
                <div className="section-contained">
                  <div className="text-center mb-10">
                    <h2 className="text-display-thin text-3xl text-ink mb-3">
                      Camp Community
                    </h2>
                    <p className="text-body-relaxed text-ink-soft">
                      Chat with your campmates and see who is online.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ChatRoom />
                    </div>
                    <div>
                      <OnlineMembers />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
    );
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
