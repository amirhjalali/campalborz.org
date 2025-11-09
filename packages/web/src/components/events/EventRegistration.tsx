'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { toast } from 'sonner';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  capacity?: number;
  registered?: number;
  image?: string;
  price?: number;
  category?: string;
  organizer?: string;
  requirements?: string[];
}

interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  dietaryRestrictions: string;
  emergencyContact: string;
  emergencyPhone: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

interface EventRegistrationProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Event Registration Component
 *
 * Multi-step event registration flow
 */
export function EventRegistration({
  event,
  onSuccess,
  onCancel,
}: EventRegistrationProps) {
  const [step, setStep] = useState<'details' | 'form' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const { data: formData, updateField, clearData } = useFormPersistence<RegistrationFormData>(
    `event-registration-${event.id}`,
    {
      name: '',
      email: '',
      phone: '',
      dietaryRestrictions: '',
      emergencyContact: '',
      emergencyPhone: '',
      specialRequests: '',
      agreeToTerms: false,
    }
  );

  const isFull = event.capacity && event.registered && event.registered >= event.capacity;

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }

    if (!formData.emergencyContact.trim()) {
      toast.error('Emergency contact is required');
      return false;
    }

    if (!formData.emergencyPhone) {
      toast.error('Emergency contact phone is required');
      return false;
    }

    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock registration ID
      const mockId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setRegistrationId(mockId);

      toast.success('Registration successful!');
      clearData();
      setStep('confirmation');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event Details Step
  if (step === 'details') {
    return (
      <Card>
        <CardContent className="p-0">
          {/* Event Image */}
          {event.image && (
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {event.category && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                    {event.category}
                  </span>
                )}
                {isFull && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    Event Full
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {event.endDate && (
                    <p className="text-sm text-gray-600">
                      to{' '}
                      {new Date(event.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-700">{event.location}</p>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-700">
                    {event.registered || 0} / {event.capacity} registered
                  </p>
                </div>
              )}

              {event.price !== undefined && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    ${event.price > 0 ? event.price.toFixed(2) : 'Free'}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">About This Event</h3>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {event.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => setStep('form')}
                disabled={isFull}
                className="flex-1"
              >
                {isFull ? 'Event Full' : 'Register Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration Form Step
  if (step === 'form') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Registration</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Register for: <span className="font-medium text-gray-900">{event.title}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    id="dietary"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="e.g., Vegetarian, Gluten-free"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => updateField('emergencyContact', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateField('emergencyPhone', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests or Accessibility Needs
              </label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => updateField('specialRequests', e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                placeholder="Let us know if you have any special requests..."
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                disabled={isSubmitting}
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                  terms and conditions
                </a>{' '}
                and understand the event requirements. <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('details')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Confirmation Step
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Confirmed!
        </h2>
        <p className="text-gray-600 mb-6">
          You're all set for <span className="font-medium text-gray-900">{event.title}</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-600 mb-2">Registration ID</p>
          <p className="font-mono text-lg font-medium text-gray-900">{registrationId}</p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to <span className="font-medium">{formData.email}</span>
        </p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Confirmation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
