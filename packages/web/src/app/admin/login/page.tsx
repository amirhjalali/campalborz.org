'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, error, clearError, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 mb-6">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-display-thin text-3xl text-ink mb-2">
            Admin Login
          </h1>
          <p className="text-body-relaxed text-ink-soft">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="luxury-card p-8">
          <h2 className="text-display-thin text-xl text-center text-ink mb-6">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <p className="text-amber-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ink-soft/50" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="form-input pl-12"
                  placeholder="admin@campalborz.org"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ink-soft/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="form-input pl-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-soft hover:text-gold transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-ink-soft hover:text-gold transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-ink-soft">
          <p>
            Not an admin?{' '}
            <Link href="/" className="text-gold font-medium hover:text-gold/80 transition-colors">
              Go to homepage
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-ink-soft/70 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Secured with SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
