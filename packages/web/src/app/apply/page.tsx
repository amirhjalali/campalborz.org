"use client";

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ApplyPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
    alert("Application submitted! We'll be in touch soon.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron via-desert-gold to-persian-purple">
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
            Join Camp Alborz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            We're excited to learn about you and how you'd like to contribute to our community
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
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
                    <label className="form-label">Email Address *</label>
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
                    <label className="form-label">Phone Number *</label>
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
                    <label className="form-label">Emergency Contact *</label>
                    <input
                      type="text"
                      name="emergency_contact"
                      required
                      className="form-input"
                      placeholder="Name and phone number"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Burning Man Experience */}
              <div>
                <label className="form-label">Burning Man Experience</label>
                <select
                  name="experience"
                  className="form-input"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="">Select your experience level</option>
                  <option value="first-time">First-time Burner</option>
                  <option value="1-3-years">1-3 years</option>
                  <option value="4-7-years">4-7 years</option>
                  <option value="8-plus-years">8+ years</option>
                  <option value="veteran">Veteran (15+ years)</option>
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="form-label">What interests you about Camp Alborz? *</label>
                <textarea
                  name="interests"
                  required
                  rows={4}
                  className="form-input"
                  placeholder="Tell us what draws you to our camp..."
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>

              {/* Contribution */}
              <div>
                <label className="form-label">How would you like to contribute? *</label>
                <textarea
                  name="contribution"
                  required
                  rows={4}
                  className="form-input"
                  placeholder="Skills, time, resources, ideas..."
                  value={formData.contribution}
                  onChange={handleChange}
                />
              </div>

              {/* Dietary Requirements */}
              <div>
                <label className="form-label">Dietary Requirements/Allergies</label>
                <textarea
                  name="dietary"
                  rows={3}
                  className="form-input"
                  placeholder="Any dietary restrictions or allergies we should know about?"
                  value={formData.dietary}
                  onChange={handleChange}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="font-semibold text-secondary-900 mb-2">Before You Apply</h4>
                <ul className="text-sm text-secondary-700 space-y-1">
                  <li>• Membership includes camp dues to cover shared expenses</li>
                  <li>• All members are expected to participate in camp setup and teardown</li>
                  <li>• We operate on the principles of radical inclusion and respect</li>
                  <li>• Camp participation requires commitment to our community values</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-persian-purple to-persian-violet hover:shadow-lg"
                  >
                    Submit Application
                  </Button>
                </motion.div>
                <p className="text-sm text-neutral-600 mt-4 text-center">
                  We'll review your application and get back to you within a week
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900">Application Review</h4>
                  <p className="text-secondary-600">Our camp leads will review your application</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900">Meet & Greet</h4>
                  <p className="text-secondary-600">We&apos;ll invite you to a virtual or in-person meetup</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900">Welcome to the Family</h4>
                  <p className="text-secondary-600">Join our planning activities and camp community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}