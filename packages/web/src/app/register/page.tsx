'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { UserPlus, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationErrors([]);

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      setSuccess(true);
    } catch {
      // Error is handled by the context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto px-4 text-center"
          >
            <div className="luxury-card p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                  <CheckCircle className="h-12 w-12 text-gold" />
                </div>
              </div>
              <h2 className="text-display-thin text-2xl text-ink mb-4">Registration Successful!</h2>
              <p className="text-body-relaxed text-ink-soft mb-6">
                Welcome to the Camp Alborz community! Please check your email to verify your account before signing in.
              </p>
              <Link href="/members" className="cta-primary inline-flex">
                Go to Sign In
              </Link>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="pattern-persian opacity-20 absolute inset-0" />
          <motion.div
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative section-contained text-center"
          >
            <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-4">
              JOIN THE COMMUNITY
            </p>
            <h1 className="text-display-thin text-4xl md:text-5xl text-ink mb-4">
              Create Your Account
            </h1>
            <p className="text-body-relaxed text-lg text-ink-soft max-w-2xl mx-auto">
              Join Camp Alborz and become part of our Persian hospitality community at Burning Man.
            </p>
          </motion.div>
        </section>

        {/* Registration Form */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 14 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="luxury-card p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                  <UserPlus className="h-8 w-8 text-gold" />
                </div>
              </div>
              <h2 className="text-display-thin text-2xl text-center text-ink mb-6">
                Register for Camp Alborz
              </h2>

              {(error || validationErrors.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      {error && <p className="text-red-700 text-sm">{error}</p>}
                      {validationErrors.map((err, index) => (
                        <p key={index} className="text-red-700 text-sm">{err}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input pr-12"
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
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
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input pr-12"
                      placeholder="Confirm your password"
                      required
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

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full cta-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line/40" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-ink-soft">or</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-ink-soft">
                    Already have an account?{' '}
                    <Link href="/members" className="text-gold font-medium hover:text-gold/80 transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
