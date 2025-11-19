'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function MembersPage() {
  const { members } = useContentConfig();
  const [showPassword, setShowPassword] = useState(false);
  const portalInfo = members?.portalInfo;

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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-hero animate-gradient-x">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-burnt-sienna mb-6">
              {members.title}
            </h1>
            <p className="text-xl text-desert-night max-w-3xl mx-auto">
              {members.subtitle}
            </p>
          </motion.div>
        </section>

        {/* Login Section */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-midnight-light rounded-2xl p-8 shadow-lg"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-6">
                {members.loginSection.title}
              </h2>
              <form className="space-y-5">
                <div>
                  <label className="form-label">
                    {members.loginSection.emailLabel}
                  </label>
                  <input
                    type="email"
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
                    <Link href="#" className="text-sm text-primary hover:text-secondary transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {members.loginSection.submitButton}
                </motion.button>
              </form>
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">or</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {members.loginSection.notMemberText}{' '}
                    <Link href="/apply" className="text-primary font-medium hover:text-secondary transition-colors">
                      {members.loginSection.applyLinkText}
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                {members.benefits.title}
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                {members.benefits.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.benefits.items.map((benefit, index) => {
                const BenefitIcon = getIcon(benefit.icon);
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${benefit.gradient} mb-4`}>
                      <BenefitIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                {members.spotlight.title}
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                {members.spotlight.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {members.spotlight.members.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.gradient}`} />
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary dark:text-persian-light font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3">
                    Member for {member.years}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {member.contribution}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 bg-gradient-to-br from-persian-purple/10 to-desert-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {members.communityStats.map((stat, index) => {
                const StatIcon = getIcon(stat.icon);
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <StatIcon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {portalInfo && (
          <>
            {/* Portal Highlights */}
            <section className="py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-10"
                >
                  <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-3">
                    {portalInfo.welcomeTitle}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Two simple steps to lock in your placement.
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portalInfo.highlights.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800"
                    >
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">{item.description}</p>
                      {item.linkUrl && item.linkText && (
                        <Link
                          href={item.linkUrl}
                          target={item.linkUrl.startsWith("http") ? "_blank" : undefined}
                          rel={item.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center text-primary hover:text-secondary mt-4 font-medium"
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
            <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-midnight rounded-2xl p-8 shadow-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2">Dues</p>
                      <h3 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-3">
                        {portalInfo.dues.amountLabel}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-4">{portalInfo.dues.description}</p>
                      <ul className="space-y-2 text-neutral-600 dark:text-neutral-300">
                        {portalInfo.dues.breakdown.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Grid Fees</p>
                      <div className="space-y-3">
                        {portalInfo.dues.gridFees.map((fee) => (
                          <div
                            key={fee.label}
                            className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-white/60 dark:bg-midnight-light/40"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-neutral-900 dark:text-white">{fee.label}</p>
                              <span className="text-primary font-semibold">{fee.amount}</span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{fee.description}</p>
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                      How to Send Your Dues
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Choose the option that works best for you—just like we outlined on campalborz.org.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {portalInfo.paymentOptions.map((option, index) => {
                      const OptionIcon = getIcon(option.icon || "heart");
                      return (
                        <motion.div
                          key={option.method}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800"
                        >
                          <div className="flex items-center mb-3">
                            <div className="p-3 bg-primary-100 rounded-lg mr-3">
                              <OptionIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 dark:text-white">{option.method}</p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">{option.description}</p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {option.details.map((detail, detailIdx) => (
                              <li key={detailIdx} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                          {option.linkUrl && option.linkText && (
                            <Link
                              href={option.linkUrl}
                              target={option.linkUrl.startsWith("http") ? "_blank" : undefined}
                              rel={option.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                              className="inline-flex items-center text-primary hover:text-secondary font-medium text-sm mt-4"
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
            <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-2">
                <div className="bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-2xl font-display font-semibold text-neutral-900 dark:text-white mb-4">Key Resources</h3>
                  <div className="space-y-4">
                    {portalInfo.resources.map((resource) => (
                      <div key={resource.title}>
                        <p className="font-semibold text-neutral-800 dark:text-white">{resource.title}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{resource.description}</p>
                        <Link
                          href={resource.linkUrl}
                          target={resource.linkUrl.startsWith("http") ? "_blank" : undefined}
                          rel={resource.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center text-primary hover:text-secondary text-sm font-medium mt-2"
                        >
                          {resource.linkText}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-2xl font-display font-semibold text-neutral-900 dark:text-white mb-4">Upcoming Fundraisers</h3>
                  <div className="space-y-4">
                    {portalInfo.fundraisers.map((fundraiser) => (
                      <div key={fundraiser.title} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                        <p className="text-sm uppercase tracking-[0.3em] text-primary mb-1">{fundraiser.date}</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{fundraiser.title}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{fundraiser.description}</p>
                        {fundraiser.linkUrl && fundraiser.linkText && (
                          <Link
                            href={fundraiser.linkUrl}
                            target={fundraiser.linkUrl.startsWith("http") ? "_blank" : undefined}
                            rel={fundraiser.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                            className="inline-flex items-center text-primary hover:text-secondary text-sm font-medium mt-2"
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

        {/* CTA Section */}
        {members.cta && (
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            >
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                {members.cta.title}
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                {members.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={members.cta.buttons.primary.link}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {members.cta.buttons.primary.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href={members.cta.buttons.secondary.link}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-midnight text-neutral-900 dark:text-white font-semibold rounded-lg border-2 border-persian-purple hover:bg-persian-purple/10 transition-all duration-300"
                >
                  {members.cta.buttons.secondary.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </section>
        )}
      </main>
    </>
  );
}
