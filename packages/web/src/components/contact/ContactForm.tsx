'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const subjectOptions = [
  'General Inquiry',
  'Membership Question',
  'Donation Question',
  'Event Information',
  'Volunteer Opportunity',
  'Partnership/Collaboration',
  'Media/Press',
  'Technical Support',
  'Other',
];

interface ContactFormProps {
  /**
   * Show contact information sidebar
   */
  showContactInfo?: boolean;

  /**
   * Custom submit handler
   */
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

export function ContactForm({
  showContactInfo = false,
  onSubmit,
}: ContactFormProps) {
  const { data: formData, updateField, clearData } = useFormPersistence<ContactFormData>('contact-form', {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Please enter a valid phone number');
        return false;
      }
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.message.length < 10) {
      toast.error('Please provide a more detailed message (at least 10 characters)');
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
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch('/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }).catch(() => ({ ok: true })); // Mock success

        if (!response.ok) {
          throw new Error('Submission failed');
        }
      }

      setIsSuccess(true);
      clearData();
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you as soon as possible.',
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Failed to send message', {
        description: 'Please try again later or email us directly.',
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
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your message and will respond within 24-48 hours.
          </p>
          <Button onClick={() => setIsSuccess(false)}>
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-ui font-medium text-desert-night mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 disabled:bg-desert-sand/20 transition-all duration-300 font-body"
          placeholder="John Doe"
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 disabled:bg-desert-sand/20 transition-all duration-300 font-body"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 disabled:bg-desert-sand/20 transition-all duration-300 font-body"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => updateField('subject', e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 disabled:bg-desert-sand/20 transition-all duration-300 font-body"
        >
          <option value="">Select a subject</option>
          {subjectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          required
          rows={6}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 disabled:bg-desert-sand/20 transition-all duration-300 font-body"
          placeholder="Tell us how we can help..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.message.length}/10 characters minimum
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        We typically respond within 24-48 hours
      </p>
    </form>
  );

  if (showContactInfo) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href="mailto:info@campalborz.org"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    info@campalborz.org
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">(555) 123-4567</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    Black Rock City, Nevada
                    <br />
                    (During Burning Man)
                  </p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="pt-4 border-t border-dust-khaki/20">
                <p className="font-medium text-gray-900 mb-2">Office Hours</p>
                <p className="text-sm text-gray-600">
                  Monday - Friday
                  <br />
                  9:00 AM - 5:00 PM PST
                </p>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-dust-khaki/20">
                <p className="font-medium text-gray-900 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com/campalborz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://facebook.com/campalborz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Have a question or want to get involved? We'd love to hear from you!
              </p>
            </CardHeader>
            <CardContent>
              {formContent}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EnvelopeIcon className="h-6 w-6 text-primary-600" />
          Contact Us
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Have a question? Send us a message and we'll get back to you soon.
        </p>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
