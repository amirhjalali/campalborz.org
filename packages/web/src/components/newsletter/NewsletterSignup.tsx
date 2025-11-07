'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  /**
   * Display variant
   */
  variant?: 'default' | 'inline' | 'minimal' | 'card';

  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;

  /**
   * Show name field
   */
  showName?: boolean;

  /**
   * Button text
   */
  buttonText?: string;

  /**
   * Success callback
   */
  onSuccess?: (email: string, name?: string) => void;
}

/**
 * Newsletter Signup Component
 *
 * Allows users to subscribe to the newsletter
 */
export function NewsletterSignup({
  variant = 'default',
  title = 'Stay Connected',
  description = 'Get updates about our events, workshops, and community news.',
  showName = false,
  buttonText = 'Subscribe',
  onSuccess,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, send to email service (Mailchimp, SendGrid, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock API call
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      }).catch(() => ({ ok: true })); // Mock success

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Successfully subscribed!', {
          description: 'Check your email for a confirmation link.',
        });

        if (onSuccess) {
          onSuccess(email, name);
        }

        // Reset form after 3 seconds
        setTimeout(() => {
          setEmail('');
          setName('');
          setIsSuccess(false);
        }, 3000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      toast.error('Failed to subscribe', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimal variant - just email input and button
  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={isSubmitting || isSuccess}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        />
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          variant="primary"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            buttonText
          )}
        </Button>
      </form>
    );
  }

  // Inline variant - horizontal layout
  if (variant === 'inline') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting || isSuccess}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                variant="primary"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  buttonText
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
              <EnvelopeIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700">{description}</p>
          </div>

          {isSuccess ? (
            <div className="text-center py-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-1">
                You're subscribed!
              </p>
              <p className="text-sm text-gray-600">
                Check your email for confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {showName && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                    {buttonText}
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <EnvelopeIcon className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {isSuccess ? (
        <div className="text-center py-6 bg-green-50 border border-green-200 rounded-md">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-green-800 font-medium">Successfully subscribed!</p>
          <p className="text-sm text-green-600 mt-1">Check your email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {showName && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              buttonText
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            We'll never share your email. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}

/**
 * Newsletter Footer
 *
 * Full-width newsletter signup for page footers
 */
export function NewsletterFooter() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Join Our Community
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Get the latest updates on events, workshops, and community news delivered to your inbox.
        </p>
        <div className="flex justify-center">
          <NewsletterSignup
            variant="minimal"
            buttonText="Join Now"
          />
        </div>
        <p className="text-sm text-white/75 mt-4">
          Join 1,000+ community members. No spam, ever.
        </p>
      </div>
    </section>
  );
}
