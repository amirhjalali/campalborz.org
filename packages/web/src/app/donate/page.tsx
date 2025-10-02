"use client";

import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DonationForm } from "@/components/donation/DonationForm";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  CheckCircle
} from "lucide-react";
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function DonatePage() {
  const { donate } = useContentConfig();
  const campConfig = useCampConfig();

  if (!donate) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Donate page configuration not found</p>
        </main>
      </>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-gold via-saffron to-persian-purple">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-midnight bg-clip-text text-transparent"
          >
            {donate.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            {donate.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {donate.impactStats.map((stat) => {
            const StatIcon = getIcon(stat.icon);
            return (
              <Card key={stat.label} className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <StatIcon className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary-900 mb-2">{stat.number}</div>
                  <div className="text-secondary-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Donation Tiers */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Choose Your Support Level
            </h2>
            <p className="text-lg text-secondary-600">
              Every contribution helps us build a stronger, more vibrant community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donate.donationTiers.map((tier) => (
              <Card key={tier.amount} className={`relative ${tier.popular ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary-900 mb-2">
                      ${tier.amount}
                    </div>
                    <CardTitle className="text-lg">{tier.title}</CardTitle>
                    <p className="text-secondary-600 text-sm mt-2">{tier.description}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk, index) => (
                      <li key={index} className="flex items-center text-sm text-secondary-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={tier.popular ? "primary" : "outline"}>
                    Donate ${tier.amount}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-secondary-600 mb-4">Want to contribute a different amount?</p>
            <Button size="lg" variant="outline">
              Custom Donation
            </Button>
          </div>
        </div>

        {/* Funding Priorities */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">2024 Funding Priorities</CardTitle>
            <p className="text-secondary-600">
              See how your donations will be allocated across our key initiatives
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {donate.fundingPriorities.map((priority) => {
                const PriorityIcon = getIcon(priority.icon);
                return (
                  <div key={priority.title} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-secondary-100 rounded-lg mr-3">
                          <PriorityIcon className="h-5 w-5 text-secondary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-secondary-900">{priority.title}</h4>
                          <p className="text-sm text-secondary-600">{priority.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-secondary-900">{priority.percentage}%</div>
                        <div className="text-sm text-secondary-600">${priority.amount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${priority.color}`}
                        style={{ width: `${priority.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Financial Transparency */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Financial Transparency</CardTitle>
            <p className="text-secondary-600">
              2023 budget breakdown - see exactly how donations were used
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donate.transparencyItems.map((item) => (
                <div key={item.category} className="flex items-center justify-between py-3 border-b border-secondary-200 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-secondary-900">{item.category}</h4>
                      <div className="flex items-center">
                        <span className="text-sm text-secondary-500 mr-3">{item.percentage}%</span>
                        <span className="font-semibold text-secondary-900">{item.amount}</span>
                      </div>
                    </div>
                    <p className="text-sm text-secondary-600">{item.description}</p>
                    <div className="w-full bg-secondary-200 rounded-full h-1 mt-2">
                      <div
                        className="bg-primary-600 h-1 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Ways to Help */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Other Ways to Support Us
            </h2>
            <p className="text-lg text-secondary-600">
              Beyond monetary donations, there are many ways to contribute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donate.otherWaysToHelp.map((option) => {
              const OptionIcon = getIcon(option.icon);
              return (
                <Card key={option.title} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="p-3 bg-primary-100 rounded-lg mr-4 group-hover:bg-primary-200 transition-colors">
                        <OptionIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                        <p className="text-primary-600 font-medium">{option.amount}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600 mb-4">{option.description}</p>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Donor Recognition */}
        {donate.donorRecognition && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle as="h2">{donate.donorRecognition.title}</CardTitle>
              <p className="text-secondary-600">
                {donate.donorRecognition.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="bg-secondary-50 rounded-lg p-8">
                  <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  {donate.donorRecognition.tiers.map((tier, index) => (
                    <div key={tier.title} className={index < donate.donorRecognition!.tiers.length - 1 ? "mb-6" : ""}>
                      <h4 className="font-semibold text-secondary-900 mb-2">{tier.title}</h4>
                      <p className="text-secondary-600">
                        {tier.description}
                      </p>
                    </div>
                  ))}

                  <p className="text-sm text-secondary-500 mt-6">
                    Full donor recognition list available upon request.
                    We respect donor privacy preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Information */}
        {donate.taxInfo && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle as="h2">{donate.taxInfo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-secondary-700 mb-2">
                      <strong>{campConfig.name} is a registered 501(c)(3) non-profit organization.</strong>
                      {' '}{donate.taxInfo.description}
                    </p>
                    {donate.taxInfo.ein && (
                      <p className="text-secondary-600 text-sm">
                        EIN: {donate.taxInfo.ein} | You will receive a tax receipt via email after your donation.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Donation Form */}
        {donate.donationForm && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                {donate.donationForm.title}
              </h2>
              <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                {donate.donationForm.description}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <DonationForm
                campaigns={donate.donationForm.campaigns}
                onSuccess={(donationId) => {
                  console.log("Donation successful:", donationId);
                }}
              />
            </div>
          </div>
        )}

        {/* Additional Support Options */}
        {donate.cta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-persian-purple/5 to-desert-gold/5 rounded-2xl p-12"
          >
            <h3 className="text-3xl font-bold text-midnight mb-6">
              {donate.cta.title}
            </h3>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              {donate.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-persian-purple to-persian-violet hover:shadow-lg" asChild>
                  <Link href={donate.cta.buttons.primary.link}>{donate.cta.buttons.primary.text}</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-2 border-persian-purple text-persian-purple hover:bg-persian-purple hover:text-white" asChild>
                  <Link href={donate.cta.buttons.secondary.link}>{donate.cta.buttons.secondary.text}</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}