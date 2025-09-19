'use client';

import React, { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: (user: any) => void;
  onLogin?: () => void;
  inviteToken?: string;
  tenantId?: string;
}

export default function RegisterForm({ 
  onSuccess, 
  onLogin, 
  inviteToken,
  tenantId 
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      
      if (onSuccess) {
        onSuccess(data.user);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validatePasswordMutation = trpc.security.validatePassword.useMutation({
    onSuccess: (data) => {
      setPasswordStrength({
        score: data.strength === 'very_strong' ? 4 : 
               data.strength === 'strong' ? 3 :
               data.strength === 'medium' ? 2 : 1,
        feedback: data.errors,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength.feedback.length > 0) {
      toast.error("Please fix password validation errors");
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      tenantId,
      inviteToken,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validate password strength when password changes
    if (field === 'password' && value.length > 0) {
      validatePasswordMutation.mutate({ password: value });
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 4: return 'bg-green-500';
      case 3: return 'bg-blue-500';
      case 2: return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 4: return 'Very Strong';
      case 3: return 'Strong';
      case 2: return 'Medium';
      default: return 'Weak';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">
            {inviteToken ? 'Accept your invitation' : 'Join our community'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
                disabled={registerMutation.isLoading}
              />
            </div>
          </div>

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
                placeholder="Enter your email"
                required
                disabled={registerMutation.isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a strong password"
                required
                disabled={registerMutation.isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={registerMutation.isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.score >= 3 ? 'text-green-600' :
                    passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                
                {/* Password Feedback */}
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-start text-xs text-red-600">
                        <XCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{feedback}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Confirm your password"
                required
                disabled={registerMutation.isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={registerMutation.isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-1 flex items-center text-xs">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1 text-red-600" />
                    <span className="text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isLoading || passwordStrength.feedback.length > 0}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          {onLogin && (
            <div className="text-center border-t pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onLogin}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={registerMutation.isLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>

        {/* Terms Notice */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p>
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Email Verification Required</p>
              <p>We'll send you a verification email to activate your account.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}