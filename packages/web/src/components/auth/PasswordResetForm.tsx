'use client';

import React, { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Lock,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Key,
} from 'lucide-react';

interface PasswordResetFormProps {
  onBack?: () => void;
  resetToken?: string;
}

export default function PasswordResetForm({ onBack, resetToken }: PasswordResetFormProps) {
  const [step, setStep] = useState<'request' | 'reset'>(resetToken ? 'reset' : 'request');
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEmailSent, setIsEmailSent] = useState(false);

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsEmailSent(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Redirect to login or handle success
      if (onBack) {
        setTimeout(() => onBack(), 2000);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validatePasswordMutation = trpc.security.validatePassword.useMutation();

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    requestResetMutation.mutate({
      email: formData.email,
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error("Invalid reset token");
      return;
    }

    resetPasswordMutation.mutate({
      token: resetToken,
      newPassword: formData.newPassword,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validate password when it changes
    if (field === 'newPassword' && value.length > 0) {
      validatePasswordMutation.mutate({ password: value });
    }
  };

  // Request Reset Step
  if (step === 'request') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Key className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          {!isEmailSent ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                    required
                    disabled={requestResetMutation.isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={requestResetMutation.isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestResetMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>

              {/* Back to Login */}
              {onBack && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    disabled={requestResetMutation.isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Email Sent Confirmation */
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600">
                  We've sent a password reset link to <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Different Email
                </button>

                {onBack && (
                  <button
                    onClick={onBack}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Reset Password Step
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-600 mt-2">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
                required
                disabled={resetPasswordMutation.isLoading}
              />
            </div>

            {/* Password Validation Feedback */}
            {validatePasswordMutation.data && formData.newPassword && (
              <div className="mt-2">
                {validatePasswordMutation.data.errors.length > 0 ? (
                  <div className="space-y-1">
                    {validatePasswordMutation.data.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {error}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Password meets security requirements
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Confirm new password"
                required
                disabled={resetPasswordMutation.isLoading}
              />
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.newPassword === formData.confirmPassword ? (
                  <p className="text-xs text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passwords match
                  </p>
                ) : (
                  <p className="text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              resetPasswordMutation.isLoading ||
              !formData.newPassword ||
              !formData.confirmPassword ||
              formData.newPassword !== formData.confirmPassword ||
              (validatePasswordMutation.data?.errors.length || 0) > 0
            }
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPasswordMutation.isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </>
            )}
          </button>

          {/* Back to Login */}
          {onBack && (
            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                disabled={resetPasswordMutation.isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </button>
            </div>
          )}
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Password Security Tips:</p>
            <ul className="space-y-1">
              <li>• Use at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid common words or personal information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}