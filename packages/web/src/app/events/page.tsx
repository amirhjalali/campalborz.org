"use client";

import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function EventsPage() {
  const { events } = useContentConfig();
  const campConfig = useCampConfig();

  if (!events) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Events page configuration not found</p>
        </main>
      </>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-persian-purple via-midnight to-desert-gold">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-desert-gold bg-clip-text text-transparent"
          >
            {events.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            {events.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{/* Rest of content goes here */}

        {/* Event Types Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-4">Event Categories</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover the diverse range of experiences we offer year-round
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.eventTypes.map((type, index) => {
              const TypeIcon = getIcon(type.icon);
              return (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full border-2 border-transparent hover:border-persian-purple/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl ${type.color} mr-4`}>
                          <TypeIcon className="h-7 w-7" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-midnight">{type.name}</CardTitle>
                          <div className="text-sm text-persian-purple font-medium">{type.count} events yearly</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600">{type.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-secondary-600">
              Mark your calendars for these exciting upcoming activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.upcomingEvents.map((event) => {
              const EventIcon = getIcon(event.icon);
              return (
                <Card key={event.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg ${event.color} mr-3 flex-shrink-0`}>
                          <EventIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <span className="inline-block px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs font-medium">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-secondary-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.attendees}/{event.maxAttendees} attending</span>
                      </div>
                    </div>

                    <p className="text-secondary-700 mb-4">{event.description}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-secondary-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        ></div>
                      </div>
                      <Button size="sm" variant="outline">
                        RSVP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Burning Man Schedule */}
        {events.burningManSchedule && events.burningManSchedule.length > 0 && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle as="h2">Burning Man 2024 Camp Schedule</CardTitle>
              <p className="text-secondary-600">
                Daily activities and workshops during our time on the playa
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {events.burningManSchedule.map((day) => (
                  <div key={day.day}>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4 border-l-4 border-primary-600 pl-4">
                      {day.day}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {day.events.map((event, index) => (
                        <div key={index} className="border-l-2 border-secondary-200 pl-4">
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-primary-600">{event.time}</span>
                          </div>
                          <h4 className="font-semibold text-secondary-900 mb-1">{event.title}</h4>
                          <p className="text-sm text-secondary-600">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Guidelines */}
        {events.guidelines && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle as="h2">Event Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Before Attending</h4>
                  <ul className="space-y-2 text-secondary-700">
                    {events.guidelines.beforeAttending.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Community Values</h4>
                  <ul className="space-y-2 text-secondary-700">
                    {events.guidelines.communityValues.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {events.cta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-persian-purple/5 to-saffron/5 rounded-2xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
              {events.cta.title}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {events.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-persian-purple to-persian-violet hover:shadow-lg" asChild>
                  <Link href={events.cta.buttons.primary.link}>{events.cta.buttons.primary.text}</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-2 border-persian-purple text-persian-purple hover:bg-persian-purple hover:text-white" asChild>
                  <Link href={events.cta.buttons.secondary.link}>{events.cta.buttons.secondary.text}</Link>
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