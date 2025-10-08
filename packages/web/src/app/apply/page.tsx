"use client";

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useContentConfig } from "../../hooks/useConfig";

export default function ApplyPage() {
  const { apply } = useContentConfig();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    interests: "",
    contribution: "",
    dietary: "",
    emergency_contact: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
    alert(apply.form.successMessage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-secondary to-primary">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-midnight bg-clip-text text-transparent"
          >
            {apply.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            {apply.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                  >
                    {apply.form.submitButton}
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
