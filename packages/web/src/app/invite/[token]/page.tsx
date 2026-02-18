'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle, Eye, EyeOff, PartyPopper } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteToken = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/trpc/auth.acceptInvite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteToken, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error?.json?.message || data.error?.message || 'Failed to accept invitation'
        );
      }

      const result = data.result?.data;

      if (result?.accessToken && result?.user) {
        // Auto-login: store tokens
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        // Redirect to portal
        router.push('/portal');
      } else {
        // If API doesn't return tokens, redirect to login
        router.push('/login');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Camp name */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-wider text-ink mb-2">
            CAMP ALBORZ
          </h1>
          <p className="font-accent italic text-lg text-sage">
            Welcome Aboard
          </p>
        </div>

        {/* Invite card */}
        <div className="luxury-card p-8">
          {/* Welcome icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gold/10 rounded-full border border-gold/30">
              <PartyPopper className="h-8 w-8 text-gold" />
            </div>
          </div>

          <h2 className="text-display-thin text-xl text-center text-ink mb-2">
            You&apos;ve Been Invited
          </h2>
          <p className="text-body-relaxed text-sm text-ink-soft text-center mb-6">
            Welcome to Camp Alborz! Set your password below to activate your account.
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
              <label htmlFor="invite-password" className="form-label">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="invite-password"
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
              <label htmlFor="invite-confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="invite-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Confirm your password"
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
                  Setting up...
                </>
              ) : (
                'Join Camp Alborz'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
