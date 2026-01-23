'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { ArrowRight, LogIn, Eye, EyeOff, User, LogOut, AlertCircle } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';

export default function MembersPage() {
  const { members } = useContentConfig();
  const { user, isAuthenticated, isLoading: authLoading, error, login, logout, clearError } = useAuth();
  const router = useRouter();

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
      await login(formData.email, formData.password, rememberMe);
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Members page configuration not found</p>
        </main>
      </>
    );
  }

  // Authenticated member view
  if (isAuthenticated && user) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-cream">
          {/* Member Dashboard Header */}
          <section className="relative pt-32 pb-16 overflow-hidden">
            <div className="pattern-persian opacity-20 absolute inset-0" />
            <motion.div
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative section-contained"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/40 flex items-center justify-center">
                    <User className="h-8 w-8 text-gold" />
                  </div>
                  <div>
                    <p className="text-display-wide text-xs tracking-[0.4em] text-ink-soft/80">WELCOME BACK</p>
                    <h1 className="text-display-thin text-3xl text-ink">{user.name}</h1>
                    <p className="text-body-relaxed text-sm text-ink-soft">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="cta-secondary flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </section>

          {portalInfo && (
            <>
              {/* Portal Highlights */}
              <section className="py-16">
                <div className="section-contained">
                  <motion.div
                    initial={{ y: 14 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                  >
                    <h2 className="text-display-thin text-3xl text-ink mb-3">
                      {portalInfo.welcomeTitle}
                    </h2>
                    <p className="text-body-relaxed text-ink-soft">
                      Two simple steps to lock in your placement.
                    </p>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portalInfo.highlights.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ y: 14 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      </motion.div>
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
                              <span className="text-gold mr-2">•</span>
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
                      {portalInfo.paymentOptions.map((option, index) => {
                        const OptionIcon = getIcon(option.icon || 'heart');
                        return (
                          <motion.div
                            key={option.method}
                            initial={{ y: 14 }}
                            whileInView={{ y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
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
                                  <span className="text-gold mr-2">•</span>
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
                          </motion.div>
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
            </>
          )}
        </main>
      </>
    );
  }

  // Login view (not authenticated)
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="pattern-persian opacity-20 absolute inset-0" />
          <motion.div
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative section-contained text-center"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-4">
              MEMBER PORTAL
            </p>
            <h1 className="text-display-thin text-4xl md:text-5xl text-ink mb-4">
              {members.title}
            </h1>
            <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
              {members.subtitle}
            </p>
          </motion.div>
        </section>

        {/* Login Section */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 14 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="luxury-card p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                  <LogIn className="h-8 w-8 text-gold" />
                </div>
              </div>
              <h2 className="text-display-thin text-2xl text-center text-ink mb-6">
                {members.loginSection.title}
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="form-label">
                    {members.loginSection.emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label mb-0">
                      {members.loginSection.passwordLabel}
                    </label>
                    <Link href="#" className="text-sm text-gold hover:text-gold/80 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input pr-12"
                      placeholder="••••••••"
                      required
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

                <motion.button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in...' : members.loginSection.submitButton}
                </motion.button>
              </form>
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line/40" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-ink-soft">or</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-ink-soft">
                    {members.loginSection.notMemberText}{' '}
                    <Link href="/register" className="text-gold font-medium hover:text-gold/80 transition-colors">
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <motion.div
              initial={{ y: 14 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-4">
                WHY JOIN
              </p>
              <h2 className="text-display-thin text-3xl text-ink mb-4">
                {members.benefits.title}
              </h2>
              <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
                {members.benefits.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.benefits.items.map((benefit, index) => {
                const BenefitIcon = getIcon(benefit.icon);
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ y: 14 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="luxury-card p-6 group"
                  >
                    <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 mb-4 group-hover:border-gold/50 transition-colors">
                      <BenefitIcon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="text-display-thin text-lg text-ink mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-body-relaxed text-sm text-ink-soft">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Member Spotlight */}
        <section className="py-16">
          <div className="section-contained">
            <motion.div
              initial={{ y: 14 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-4">
                OUR COMMUNITY
              </p>
              <h2 className="text-display-thin text-3xl text-ink mb-4">
                {members.spotlight.title}
              </h2>
              <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
                {members.spotlight.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.spotlight.members.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ y: 14 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/30 to-sage-mist/30 border-2 border-gold/30" />
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 section-alt">
          <div className="section-contained">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {members.communityStats.map((stat, index) => {
                const StatIcon = getIcon(stat.icon);
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <StatIcon className="h-8 w-8 text-gold mx-auto mb-3" />
                    <div className="text-display-thin text-4xl text-gold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-body-relaxed text-ink-soft">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {members.cta && (
          <section className="py-16">
            <motion.div
              initial={{ y: 14 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-contained text-center"
            >
              <div className="frame-panel max-w-4xl mx-auto">
                <h2 className="text-display-thin text-3xl text-ink mb-4">
                  {members.cta.title}
                </h2>
                <p className="text-body-relaxed text-lg text-ink-soft mb-8 max-w-2xl mx-auto">
                  {members.cta.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={members.cta.buttons.primary.link} className="cta-primary">
                    {members.cta.buttons.primary.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link href={members.cta.buttons.secondary.link} className="cta-secondary">
                    {members.cta.buttons.secondary.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </main>
    </>
  );
}
