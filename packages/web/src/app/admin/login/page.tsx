'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // In production, call authentication API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      }).catch(() => ({
        ok: true,
        json: () => Promise.resolve({
          user: { id: '1', name: 'Admin User', email },
          token: 'mock_token_' + Date.now(),
        }),
      }));

      if (response.ok) {
        const data = await response.json();
        login(data.user, data.token);

        toast.success('Login successful!');
        router.push('/admin');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="absolute inset-0 pattern-persian opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex p-4 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 mb-6"
          >
            <Shield className="w-10 h-10 text-gold" />
          </motion.div>
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
                  disabled={isLoading}
                  className="form-input pl-12"
                  placeholder="admin@campalborz.org"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="form-label mb-0">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-gold hover:text-gold/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  disabled={isLoading}
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-gold border-line/40 rounded focus:ring-gold"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-ink-soft">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
            </motion.button>
          </form>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
            <p className="text-sm text-ink font-medium mb-1">
              Demo Mode
            </p>
            <p className="text-xs text-ink-soft">
              This is a demo login. In production, this would connect to your authentication system.
            </p>
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
          <p className="text-xs text-ink-soft/60 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Secured with SSL encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
