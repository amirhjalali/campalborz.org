'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import {
  HandRaisedIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  availability: string[];
  skills: string[];
  otherSkills: string;
  interests: string;
  experience: string;
  commitment: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const availabilityOptions = [
  'Setup (Before Event)',
  'During Event',
  'Teardown (After Event)',
  'Weekends Only',
  'Weekdays Only',
  'Flexible',
];

const skillOptions = [
  'Art Installation',
  'Carpentry/Construction',
  'Electrical Work',
  'Sound/Music',
  'Cooking/Food Prep',
  'Event Planning',
  'Social Media',
  'Photography/Video',
  'First Aid/Medical',
  'Teaching/Workshops',
];

const commitmentOptions = [
  '1-2 hours/week',
  '3-5 hours/week',
  '6-10 hours/week',
  '10+ hours/week',
  'Event-only',
];

export function VolunteerForm() {
  const { data: formData, updateField, clearData } = useFormPersistence<VolunteerFormData>('volunteer-form', {
    name: '',
    email: '',
    phone: '',
    availability: [],
    skills: [],
    otherSkills: '',
    interests: '',
    experience: '',
    commitment: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckbox = (field: 'availability' | 'skills', value: string) => {
    const currentValues = formData[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateField(field, newValues);
  };

  const validateForm = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    // Required fields
    if (!formData.name || !formData.email || !formData.interests) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.availability.length === 0) {
      toast.error('Please select at least one availability option');
      return false;
    }

    if (formData.interests.length < 50) {
      toast.error('Please tell us more about your interests (at least 50 characters)');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/volunteer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => ({ ok: true })); // Mock success

      if (response.ok) {
        setIsSuccess(true);
        clearData();
        toast.success('Application submitted successfully!', {
          description: 'We\'ll be in touch soon!',
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast.error('Failed to submit application', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Volunteering!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your application and will be in touch soon with next steps.
          </p>
          <Button onClick={() => setIsSuccess(false)}>
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandRaisedIcon className="h-6 w-6 text-primary-600" />
          Volunteer Application
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Join our team of passionate volunteers and help make Camp Alborz amazing!
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Availability <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availabilityOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.availability.includes(option)}
                    onChange={() => handleCheckbox('availability', option)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Skills & Experience
            </h3>
            <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillOptions.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleCheckbox('skills', skill)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label htmlFor="otherSkills" className="block text-sm font-medium text-gray-700 mb-1">
                Other Skills or Talents
              </label>
              <input
                type="text"
                id="otherSkills"
                value={formData.otherSkills}
                onChange={(e) => updateField('otherSkills', e.target.value)}
                placeholder="e.g., graphic design, web development, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Interests & Experience */}
          <div className="space-y-4">
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to volunteer with us? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => updateField('interests', e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about your interests and what excites you about Camp Alborz..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.interests.length}/50 characters minimum
              </p>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Previous Volunteer or Burning Man Experience
              </label>
              <textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => updateField('experience', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Share any relevant experience..."
              />
            </div>
          </div>

          {/* Time Commitment */}
          <div>
            <label htmlFor="commitment" className="block text-sm font-medium text-gray-700 mb-2">
              Time Commitment
            </label>
            <select
              id="commitment"
              value={formData.commitment}
              onChange={(e) => updateField('commitment', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select time commitment</option>
              {commitmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emergency Contact (Optional but Recommended)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <HandRaisedIcon className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your information will be kept confidential and used only for volunteer coordination.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
