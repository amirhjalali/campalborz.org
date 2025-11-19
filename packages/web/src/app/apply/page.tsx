"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useContentConfig } from "../../hooks/useConfig";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  interests: string;
  contribution: string;
  dietary: string;
  emergency_contact: string;
}

export default function ApplyPage() {
  const { apply } = useContentConfig();
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    phone: "",
    experience: "",
    interests: "",
    contribution: "",
    dietary: "",
    emergency_contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!apply) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Apply page configuration not found</p>
        </main>
      </>
    );
  }

  const validateForm = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Check required text fields have minimum length
    if (formData.interests.length < 50) {
      toast.error("Please tell us more about your interests (at least 50 characters)");
      return false;
    }

    if (formData.contribution.length < 50) {
      toast.error("Please tell us more about how you'd like to contribute (at least 50 characters)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual tRPC call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate API call
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).catch(() => {
        // If API not available, still show success (mock mode)
        return { ok: true };
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success(apply.form.successMessage || "Application submitted successfully!", {
          description: "We'll review your application and get back to you soon.",
          duration: 5000,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          experience: "",
          interests: "",
          contribution: "",
          dietary: "",
          emergency_contact: "",
        });

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error("Failed to submit application", {
        description: "Please try again or contact us directly if the problem persists.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero animate-gradient-x">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-burnt-sienna"
          >
            {apply.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-desert-night max-w-3xl mx-auto leading-relaxed"
          >
            {apply.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success Message */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg"
          >
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Application Submitted Successfully!
                </h3>
                <p className="text-green-700">
                  Thank you for your interest in joining our camp! We've received your application
                  and will review it carefully. You should receive a confirmation email shortly.
                  We'll be in touch within 1-2 weeks.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legacy Google Form Link */}
        {apply.externalApplication && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-dust-khaki/40 rounded-2xl bg-gradient-to-br from-cream-50 to-white p-6 text-left"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-primary mb-2">Legacy Form</p>
            <h3 className="text-2xl font-display font-semibold text-midnight mb-3">
              Prefer the Google Form?
            </h3>
            <p className="text-neutral-700 mb-4">{apply.externalApplication.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary">
                <Link
                  href={apply.externalApplication.linkUrl}
                  target={apply.externalApplication.linkUrl.startsWith("http") ? "_blank" : undefined}
                  rel={apply.externalApplication.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                >
                  {apply.externalApplication.linkText}
                </Link>
              </Button>
              {apply.externalApplication.note && (
                <p className="text-sm text-neutral-500">{apply.externalApplication.note}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>{apply.form.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  {apply.form.fields.personalInfo.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {apply.form.fields.personalInfo.nameLabel}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {apply.form.fields.personalInfo.emailLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {apply.form.fields.personalInfo.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {apply.form.fields.personalInfo.emergencyContactLabel}
                    </label>
                    <input
                      type="text"
                      name="emergency_contact"
                      required
                      className="form-input"
                      placeholder={apply.form.fields.personalInfo.emergencyContactPlaceholder}
                      value={formData.emergency_contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Burning Man Experience */}
              <div>
                <label className="form-label">{apply.form.fields.experienceLabel}</label>
                <select
                  name="experience"
                  className="form-input"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  {apply.form.fields.experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="form-label">{apply.form.fields.interestsLabel}</label>
                <textarea
                  name="interests"
                  required
                  rows={4}
                  className="form-input"
                  placeholder={apply.form.fields.interestsPlaceholder}
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>

              {/* Contribution */}
              <div>
                <label className="form-label">{apply.form.fields.contributionLabel}</label>
                <textarea
                  name="contribution"
                  required
                  rows={4}
                  className="form-input"
                  placeholder={apply.form.fields.contributionPlaceholder}
                  value={formData.contribution}
                  onChange={handleChange}
                />
              </div>

              {/* Dietary Requirements */}
              <div>
                <label className="form-label">{apply.form.fields.dietaryLabel}</label>
                <textarea
                  name="dietary"
                  rows={3}
                  className="form-input"
                  placeholder={apply.form.fields.dietaryPlaceholder}
                  value={formData.dietary}
                  onChange={handleChange}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  {apply.form.beforeYouApply.title}
                </h4>
                <ul className="text-sm text-secondary-700 space-y-1">
                  {apply.form.beforeYouApply.items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.div whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      apply.form.submitButton
                    )}
                  </Button>
                </motion.div>
                <p className="text-sm text-neutral-600 mt-4 text-center">
                  {apply.form.reviewMessage}
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{apply.process.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apply.process.steps.map((step) => (
                <div key={step.stepNumber} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">{step.stepNumber}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900">{step.title}</h4>
                    <p className="text-secondary-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
