'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Sparkles, Users, Calendar, DollarSign, Palette, Shield } from 'lucide-react';

interface CampData {
  name: string;
  subdomain: string;
  type: 'burning-man' | 'festival' | 'community' | 'other';
  description: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  theme: 'default' | 'desert' | 'forest' | 'ocean' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    members: 50,
    features: ['Basic features', 'Email support', 'Community forums'],
    color: 'bg-gray-100',
    recommended: false
  },
  starter: {
    name: 'Starter',
    price: 49,
    members: 200,
    features: ['All Free features', 'Custom domain', 'Priority support', 'Advanced analytics'],
    color: 'bg-antique-gold/20',
    recommended: true
  },
  growth: {
    name: 'Growth',
    price: 149,
    members: 1000,
    features: ['All Starter features', 'API access', 'White-label options', 'Dedicated account manager'],
    color: 'bg-burnt-sienna/20',
    recommended: false
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    members: 'Unlimited',
    features: ['All features', 'Custom development', 'SLA guarantee', '24/7 phone support'],
    color: 'bg-desert-night/10',
    recommended: false
  }
};

const THEMES = {
  default: {
    name: 'Classic Camp',
    primary: '#C75D00',
    secondary: '#8B4513',
    preview: 'bg-gradient-to-br from-burnt-sienna to-saddle-brown'
  },
  desert: {
    name: 'Desert Oasis',
    primary: '#D4A574',
    secondary: '#EDC9AF',
    preview: 'bg-gradient-to-br from-antique-gold to-desert-sand'
  },
  forest: {
    name: 'Forest Retreat',
    primary: '#228B22',
    secondary: '#8B7355',
    preview: 'bg-gradient-to-br from-green-600 to-amber-700'
  },
  ocean: {
    name: 'Ocean Breeze',
    primary: '#006994',
    secondary: '#40E0D0',
    preview: 'bg-gradient-to-br from-blue-600 to-teal-400'
  },
  custom: {
    name: 'Custom Theme',
    primary: '#000000',
    secondary: '#FFFFFF',
    preview: 'bg-gradient-to-br from-gray-400 to-gray-600'
  }
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campData, setCampData] = useState<CampData>({
    name: '',
    subdomain: '',
    type: 'burning-man',
    description: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
    theme: 'default',
    primaryColor: THEMES.default.primary,
    secondaryColor: THEMES.default.secondary,
    plan: 'free'
  });

  const updateCampData = (data: Partial<CampData>) => {
    setCampData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create camp');
      }
      
      const { tenant } = await response.json();
      
      // Redirect to new tenant subdomain
      window.location.href = `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'campplatform.org'}`;
    } catch (error) {
      console.error('Failed to create camp:', error);
      alert('Failed to create camp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Camp Information',
      icon: Users,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camp Name *
            </label>
            <input
              type="text"
              value={campData.name}
              onChange={(e) => updateCampData({ name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
              placeholder="e.g., Camp Harmony"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain *
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={campData.subdomain}
                onChange={(e) => updateCampData({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
                placeholder="harmony"
                required
              />
              <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                .campplatform.org
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camp Type *
            </label>
            <select
              value={campData.type}
              onChange={(e) => updateCampData({ type: e.target.value as CampData['type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
            >
              <option value="burning-man">Burning Man Camp</option>
              <option value="festival">Festival Camp</option>
              <option value="community">Community Organization</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={campData.description}
              onChange={(e) => updateCampData({ description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
              rows={4}
              placeholder="Tell us about your camp..."
            />
          </div>
        </div>
      )
    },
    {
      title: 'Choose Theme',
      icon: Palette,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  updateCampData({
                    theme: key as CampData['theme'],
                    primaryColor: theme.primary,
                    secondaryColor: theme.secondary
                  });
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  campData.theme === key
                    ? 'border-burnt-sienna shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`h-24 rounded-lg mb-3 ${theme.preview}`} />
                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                <div className="flex gap-2 mt-2 justify-center">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
              </button>
            ))}
          </div>
          
          {campData.theme === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={campData.primaryColor}
                  onChange={(e) => updateCampData({ primaryColor: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={campData.secondaryColor}
                  onChange={(e) => updateCampData({ secondaryColor: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Admin Account',
      icon: Shield,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={campData.adminFirstName}
                onChange={(e) => updateCampData({ adminFirstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={campData.adminLastName}
                onChange={(e) => updateCampData({ adminLastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={campData.adminEmail}
              onChange={(e) => updateCampData({ adminEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={campData.adminPassword}
              onChange={(e) => updateCampData({ adminPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burnt-sienna focus:border-burnt-sienna"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This account will have full ownership privileges for your camp platform.
              You can add more administrators later.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Select Plan',
      icon: DollarSign,
      component: (
        <div className="space-y-4">
          {Object.entries(PLANS).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => updateCampData({ plan: key as CampData['plan'] })}
              className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                campData.plan === key
                  ? 'border-burnt-sienna shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.color}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.recommended && (
                    <span className="inline-block mt-1 px-2 py-1 bg-burnt-sienna text-white text-xs rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">Custom pricing</span>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Up to <strong>{plan.members}</strong> members
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Review & Launch',
      icon: Sparkles,
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Camp Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd className="font-medium">{campData.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">URL:</dt>
                <dd className="font-medium">{campData.subdomain}.campplatform.org</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Type:</dt>
                <dd className="font-medium capitalize">{campData.type.replace('-', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Theme:</dt>
                <dd className="font-medium">{THEMES[campData.theme].name}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Admin Account</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd className="font-medium">{campData.adminFirstName} {campData.adminLastName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt>
                <dd className="font-medium">{campData.adminEmail}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Subscription Plan</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Plan:</dt>
                <dd className="font-medium">{PLANS[campData.plan].name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Price:</dt>
                <dd className="font-medium">
                  {typeof PLANS[campData.plan].price === 'number' 
                    ? `$${PLANS[campData.plan].price}/month`
                    : 'Custom pricing'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Members:</dt>
                <dd className="font-medium">{PLANS[campData.plan].members}</dd>
              </div>
            </dl>
          </div>
          
          {campData.plan !== 'free' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>14-day free trial:</strong> Your subscription will start after the trial period ends.
                You can cancel anytime.
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];
  const StepIcon = currentStep.icon;
  const progress = (step / steps.length) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return campData.name && campData.subdomain;
      case 2:
        return campData.theme;
      case 3:
        return campData.adminEmail && campData.adminPassword && campData.adminFirstName && campData.adminLastName;
      case 4:
        return campData.plan;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand via-warm-white to-desert-sand">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-burnt-sienna mb-2">
            Create Your Camp Platform
          </h1>
          <p className="text-gray-600">
            Get your community online in minutes
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, i) => (
              <div 
                key={i} 
                className={`flex items-center ${i <= step - 1 ? 'text-burnt-sienna' : 'text-gray-400'}`}
              >
                {i <= step - 1 ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-current" />
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-burnt-sienna to-antique-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-burnt-sienna to-antique-gold p-6 text-white">
            <div className="flex items-center">
              <StepIcon className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Step {step} of {steps.length}</p>
                <h2 className="text-2xl font-bold">{currentStep.title}</h2>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep.component}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center px-8 py-4 bg-gray-50 border-t">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                step === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            {step === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-burnt-sienna to-antique-gold text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Launch Platform
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center px-6 py-2 bg-burnt-sienna text-white rounded-lg hover:bg-saddle-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}