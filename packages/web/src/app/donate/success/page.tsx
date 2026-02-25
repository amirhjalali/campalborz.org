'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Reveal } from '../../../components/reveal';
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
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Success Confirmation */}
      <section className="pt-32 pb-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 text-center">
          <Reveal direction="none">
            <div className="inline-flex p-5 rounded-full mb-8" style={{ backgroundColor: 'rgba(90, 107, 90, 0.12)', border: '1px solid rgba(90, 107, 90, 0.25)' }}>
              <CheckCircle className="h-14 w-14" style={{ color: 'var(--color-sage)' }} />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="text-display-thin text-4xl md:text-5xl mb-4">
              Thank You for Your Generosity
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="text-body-relaxed text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
              Your donation has been received successfully. Your support helps us build a stronger community.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Donation Details */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          <Reveal direction="none" delay={0.1}>
            <div className="frame-panel">
              {/* Amount Display */}
              <div className="text-center pb-8 mb-8" style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)' }}>
                <p className="text-eyebrow mb-3">
                  DONATION AMOUNT
                </p>
                <p className="text-5xl font-display" style={{ color: 'var(--color-gold)' }}>
                  ${formattedAmount.toFixed(2)}
                </p>
                {donationType === 'recurring' && (
                  <p className="text-sm mt-2" style={{ color: 'var(--color-ink-soft)' }}>Monthly recurring donation</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)' }}>
                    <Mail className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Email Confirmation</p>
                    <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                      {email || 'Receipt sent to your email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)' }}>
                    <FileText className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Transaction ID</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--color-ink-soft)' }}>
                      {paymentIntentId ? `${paymentIntentId.substring(0, 20)}...` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(90, 107, 90, 0.12)' }}>
                    <CheckCircle className="h-5 w-5" style={{ color: 'var(--color-sage)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Status</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-sage)' }}>Completed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)' }}>
                    <Heart className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Tax Deductible</p>
                    <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>501(c)(3) eligible</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* What Happens Next */}
      <section className="section-alt">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          <Reveal>
            <div className="luxury-card">
              <p className="text-eyebrow mb-3">NEXT STEPS</p>
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                      <span className="text-sm font-display" style={{ color: 'var(--color-gold)' }}>{item.step}</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-ink)' }}>{item.title}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          <Reveal direction="none">
            <div className="luxury-card text-center">
              <div className="inline-flex p-4 rounded-full mb-6" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)', border: '1px solid rgba(var(--color-gold-rgb), 0.25)' }}>
                <Heart className="h-10 w-10" style={{ color: 'var(--color-gold)' }} />
              </div>
              <h3 className="text-display-thin text-xl mb-3">
                You Are Making a Difference
              </h3>
              <p className="text-body-relaxed mb-6 max-w-lg mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Your generous contribution helps us build and nurture our vibrant community.
                Together, we create unforgettable experiences that celebrate art, culture, and connection.
              </p>
              <div className="ornate-divider" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Actions */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="cta-primary">
                <span><Home className="h-5 w-5" /></span>
                <span>Return Home</span>
              </Link>
              <Link href="/donate" className="cta-secondary">
                <span><Heart className="h-5 w-5" /></span>
                <span>Make Another Donation</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Support Contact */}
      <section className="pb-16">
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            Questions about your donation?{' '}
            <a
              href="mailto:donations@campalborz.org"
              className="underline transition-colors"
              style={{ color: 'var(--color-gold)' }}
            >
              Contact our support team
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
