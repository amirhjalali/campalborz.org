"use client";

import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function CulturePage() {
  const { culture } = useContentConfig();

  if (!culture) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Culture page configuration not found</p>
        </main>
      </>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-persian-purple via-saffron to-desert-gold">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-primary"
          >
            {culture.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            {culture.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cultural Elements Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {culture.culturalElements.map((element) => {
            const ElementIcon = getIcon(element.icon);
            return (
              <Card key={element.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${element.color} mr-3`}>
                      <ElementIcon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{element.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600 text-sm mb-3">{element.description}</p>
                  <div className="space-y-1">
                    {element.activities.map((activity, index) => (
                      <div key={index} className="text-xs text-secondary-500 flex items-center">
                        <span className="w-1 h-1 bg-primary-600 rounded-full mr-2"></span>
                        {activity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cultural Values */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Core Persian Values in Our Community</CardTitle>
            <p className="text-secondary-600">
              How traditional Persian values shape our camp culture and interactions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {culture.culturalValues.map((value) => {
                const ValueIcon = getIcon(value.icon);
                return (
                  <div key={value.title} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <ValueIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">{value.title}</h4>
                      <p className="text-secondary-700 mb-2">{value.description}</p>
                      <p className="text-sm text-primary-600 font-medium">
                        In Practice: {value.example}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Workshops */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Cultural Learning Workshops
            </h2>
            <p className="text-lg text-secondary-600">
              Hands-on experiences to deepen your understanding of Persian culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {culture.workshops.map((workshop) => (
              <Card key={workshop.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workshop.title}</CardTitle>
                    <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                      {workshop.frequency}
                    </span>
                  </div>
                  <p className="text-primary-600 font-medium">Led by {workshop.instructor}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-700 mb-4">{workshop.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-secondary-900">Level:</span>
                      <p className="text-sm text-secondary-600">{workshop.level}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary-900">Duration:</span>
                      <p className="text-sm text-secondary-600">{workshop.duration}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-secondary-900">Materials:</span>
                    <p className="text-sm text-secondary-600">{workshop.materials}</p>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Join Workshop
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Persian Celebrations */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Persian Celebrations We Honor</CardTitle>
            <p className="text-secondary-600">
              Traditional festivals and holidays that bring our community together
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {culture.celebrations.map((celebration) => (
                <div key={celebration.name} className="border-l-4 border-primary-600 pl-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-secondary-900">{celebration.name}</h3>
                    <span className="text-primary-600 font-medium">{celebration.date}</span>
                  </div>
                  <p className="text-secondary-700 mb-4">{celebration.description}</p>
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">Traditions:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {celebration.traditions.map((tradition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm text-center"
                        >
                          {tradition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Cultural Learning Resources</CardTitle>
            <p className="text-secondary-600">
              Educational materials and topics covered in our cultural programs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {culture.learningResources.map((section) => (
                <div key={section.category}>
                  <h4 className="font-semibold text-secondary-900 mb-3 pb-2 border-b border-secondary-200">
                    {section.category}
                  </h4>
                  <ul className="space-y-2">
                    {section.resources.map((resource, index) => (
                      <li key={index} className="text-sm text-secondary-600 flex items-start">
                        <span className="text-primary-600 mr-2 flex-shrink-0">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Bridge Mission */}
        {culture.culturalBridge && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle as="h2">Building Cultural Bridges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">{culture.culturalBridge.missionTitle}</h4>
                  {culture.culturalBridge.mission.map((paragraph, index) => (
                    <p key={index} className="text-secondary-700 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">{culture.culturalBridge.howWeDoItTitle}</h4>
                  <ul className="space-y-2 text-secondary-700">
                    {culture.culturalBridge.howWeDoIt.map((action, index) => {
                      const ActionIcon = getIcon(action.icon);
                      return (
                        <li key={index} className="flex items-start">
                          <ActionIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                          {action.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {culture.cta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-persian-purple/5 to-saffron/5 rounded-2xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
              {culture.cta.title}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {culture.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg" asChild>
                  <Link href={culture.cta.buttons.primary.link}>{culture.cta.buttons.primary.text}</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-2 border-persian-purple text-primary hover:bg-persian-purple hover:text-white" asChild>
                  <Link href={culture.cta.buttons.secondary.link}>{culture.cta.buttons.secondary.text}</Link>
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