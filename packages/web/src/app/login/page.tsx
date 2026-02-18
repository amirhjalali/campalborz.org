'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        router.replace('/admin');
      } else {
        router.replace('/portal');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect handled by useEffect above after user state updates
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render form if already authenticated (will redirect)
  if (!authLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Camp name and tagline */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-wider text-ink mb-2">
            CAMP ALBORZ
          </h1>
          <p className="font-accent italic text-lg text-sage">
            Member Portal
          </p>
        </div>

        {/* Login card */}
        <div className="luxury-card p-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error mt-0.5 flex-shrink-0" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot password link */}
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-sage hover:text-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-ink-soft hover:text-gold transition-colors"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
