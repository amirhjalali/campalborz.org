'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '../../../components/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Mail,
  FileText,
  Heart,
  Home,
} from 'lucide-react';

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const email = searchParams.get('email') || '';
  const paymentIntentId = searchParams.get('payment_intent') || '';
  const donationType = searchParams.get('type') || 'one-time';

  const formattedAmount = parseFloat(amount) / 100;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        {/* Hero / Success Confirmation */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="pattern-persian opacity-20 absolute inset-0" />
          <motion.div
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative section-contained text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="inline-flex p-5 rounded-full bg-sage-100 border border-sage-300 mb-8"
            >
              <CheckCircle className="h-14 w-14 text-sage-600" />
            </motion.div>
            <motion.h1
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-display-thin text-4xl md:text-5xl mb-4"
            >
              Thank You for Your Generosity
            </motion.h1>
            <motion.p
              initial={{ y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto"
            >
              Your donation has been received successfully. Your support helps us build a stronger community.
            </motion.p>
          </motion.div>
        </section>

        {/* Donation Details */}
        <section className="section-base">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="frame-panel"
            >
              {/* Amount Display */}
              <div className="text-center pb-8 mb-8 border-b border-line/30">
                <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-3">
                  DONATION AMOUNT
                </p>
                <p className="text-5xl font-display text-gold-600">
                  ${formattedAmount.toFixed(2)}
                </p>
                {donationType === 'recurring' && (
                  <p className="text-sm text-ink-soft mt-2">Monthly recurring donation</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/20">
                    <Mail className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Email Confirmation</p>
                    <p className="text-sm text-ink-soft">
                      {email || 'Receipt sent to your email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/20">
                    <FileText className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Transaction ID</p>
                    <p className="text-sm text-ink-soft font-mono">
                      {paymentIntentId ? `${paymentIntentId.substring(0, 20)}...` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sage-100">
                    <CheckCircle className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Status</p>
                    <p className="text-sm text-sage-600 font-medium">Completed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-500/20">
                    <Heart className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Tax Deductible</p>
                    <p className="text-sm text-ink-soft">501(c)(3) eligible</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Happens Next */}
        <section className="section-alt">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="luxury-card"
            >
              <h2 className="text-display-thin text-2xl mb-6">What Happens Next</h2>
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Receipt Email',
                    description: 'You will receive a detailed receipt via email within the next few minutes. Save this for your tax records.',
                  },
                  {
                    step: '2',
                    title: 'Impact Updates',
                    description: 'We will keep you informed about how your donation is making a difference in our community.',
                  },
                  {
                    step: '3',
                    title: 'Tax Documentation',
                    description: 'Your donation is tax-deductible. Keep the receipt for your tax filing.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                      <span className="text-sm font-display text-gold-600">{item.step}</span>
                    </div>
                    <div>
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="text-sm text-ink-soft mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Community Impact */}
        <section className="section-base">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="luxury-card text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
                <Heart className="h-10 w-10 text-gold-500" />
              </div>
              <h3 className="text-display-thin text-xl mb-3">
                You Are Making a Difference
              </h3>
              <p className="text-body-relaxed text-ink-soft mb-6 max-w-lg mx-auto">
                Your generous contribution helps us build and nurture our vibrant community.
                Together, we create unforgettable experiences that celebrate art, culture, and connection.
              </p>
              <div className="ornate-divider" />
            </motion.div>
          </div>
        </section>

        {/* Actions */}
        <section className="section-base">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="cta-primary">
                <Home className="h-5 w-5" />
                Return Home
              </Link>
              <Link href="/donate" className="cta-secondary">
                <Heart className="h-5 w-5" />
                Make Another Donation
              </Link>
            </div>
          </div>
        </section>

        {/* Support Contact */}
        <section className="pb-16">
          <div className="text-center">
            <p className="text-sm text-ink-soft">
              Questions about your donation?{' '}
              <a
                href="mailto:donations@campalborz.org"
                className="text-gold-600 hover:text-gold-500 underline transition-colors"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
