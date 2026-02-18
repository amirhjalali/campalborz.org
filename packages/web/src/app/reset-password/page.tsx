'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/trpc/auth.resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error?.json?.message || data.error?.message || 'Failed to reset password'
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-error/10 rounded-full border border-error/20">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
        </div>
        <h2 className="text-display-thin text-xl text-ink mb-3">
          Invalid Link
        </h2>
        <p className="text-body-relaxed text-sm text-ink-soft mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="cta-primary inline-flex text-sm">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="luxury-card p-8">
      {success ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-success/10 rounded-full border border-success/20">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <h2 className="text-display-thin text-xl text-ink mb-3">
            Password Updated
          </h2>
          <p className="text-body-relaxed text-sm text-ink-soft">
            Your password has been reset successfully. Redirecting to login...
          </p>
          <div className="mt-4">
            <Loader2 className="h-5 w-5 text-gold animate-spin mx-auto" />
          </div>
        </div>
      ) : (
        <>
          <p className="text-body-relaxed text-sm text-ink-soft text-center mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error mt-0.5 flex-shrink-0" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  disabled={isSubmitting}
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

            <div>
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Confirm your new password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-gold transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Camp name and tagline */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-wider text-ink mb-2">
            CAMP ALBORZ
          </h1>
          <p className="font-accent italic text-lg text-sage">
            Reset Password
          </p>
        </div>

        <Suspense
          fallback={
            <div className="luxury-card p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-gold animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-ink-soft hover:text-gold transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
