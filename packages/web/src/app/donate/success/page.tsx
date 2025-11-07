'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  HeartIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const [donationDetails, setDonationDetails] = useState({
    amount: searchParams.get('amount') || '0',
    email: searchParams.get('email') || '',
    paymentIntentId: searchParams.get('payment_intent') || '',
    donationType: searchParams.get('type') || 'one-time',
  });

  useEffect(() => {
    // In production, verify the payment with Stripe
    // const verifyPayment = async () => {
    //   const response = await fetch('/api/verify-payment', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ paymentIntentId: donationDetails.paymentIntentId }),
    //   });
    //   const data = await response.json();
    //   setDonationDetails(prev => ({ ...prev, ...data }));
    // };
    // verifyPayment();
  }, []);

  const formattedAmount = parseFloat(donationDetails.amount) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Generosity!
          </h1>
          <p className="text-xl text-gray-600">
            Your donation has been received successfully
          </p>
        </div>

        {/* Donation Details Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Amount */}
              <div className="text-center border-b pb-6">
                <p className="text-sm text-gray-600 mb-2">Donation Amount</p>
                <p className="text-5xl font-bold text-primary-600">
                  ${formattedAmount.toFixed(2)}
                </p>
                {donationDetails.donationType === 'recurring' && (
                  <p className="text-sm text-gray-500 mt-2">Monthly recurring donation</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Confirmation</p>
                    <p className="text-sm text-gray-600">
                      {donationDetails.email || 'Receipt sent to your email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Transaction ID</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {donationDetails.paymentIntentId.substring(0, 20)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <HeartIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tax Deductible</p>
                    <p className="text-sm text-gray-600">501(c)(3) eligible</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Receipt Email</p>
                  <p className="text-sm text-gray-600">
                    You'll receive a detailed receipt via email within the next few minutes.
                    Save this for your tax records.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Impact Updates</p>
                  <p className="text-sm text-gray-600">
                    We'll keep you informed about how your donation is making a difference in
                    our community.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tax Documentation</p>
                  <p className="text-sm text-gray-600">
                    Your donation is tax-deductible. Keep the receipt for your tax filing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card className="mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <HeartIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              You're Making a Difference
            </h3>
            <p className="text-gray-700 mb-4">
              Your generous contribution helps us build and nurture our vibrant community. Together,
              we create unforgettable experiences that celebrate art, culture, and connection.
            </p>
            <p className="text-sm text-gray-600 italic">
              "Alone we can do so little; together we can do so much."
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="primary">
            <Link href="/" className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2" />
              Return Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/donate">
              <HeartIcon className="h-5 w-5 mr-2" />
              Make Another Donation
            </Link>
          </Button>
        </div>

        {/* Support Contact */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Questions about your donation?{' '}
            <a href="mailto:donations@campalborz.org" className="text-primary-600 hover:text-primary-700 underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
