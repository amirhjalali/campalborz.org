"use client";

import { Navigation } from "../../components/navigation";
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
    <div className="min-h-screen bg-gradient-hero animate-gradient-x">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-burnt-sienna"
          >
            {events.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-desert-night max-w-4xl mx-auto leading-relaxed"
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
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                  className="h-full border-2 border-neutral-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 bg-white backdrop-blur-sm rounded-lg p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-center">
                      <motion.div
                        className={`p-3 rounded-xl ${type.color} mr-4`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TypeIcon className="h-7 w-7" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-midnight">{type.name}</h3>
                        <div className="text-sm text-primary font-medium">{type.count} events yearly</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-600">{type.description}</p>
                  </div>
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
            {events.upcomingEvents.map((event, idx) => {
              const EventIcon = getIcon(event.icon);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="h-full border border-neutral-200 hover:border-primary/40 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-neutral-50 rounded-lg p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <motion.div
                          className={`p-2 rounded-lg ${event.color} mr-3 flex-shrink-0`}
                          whileHover={{ rotate: 10, scale: 1.15 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EventIcon className="h-5 w-5" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-midnight mb-2">{event.title}</h3>
                          <span className="inline-block px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs font-medium">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
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
                      <button className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                        RSVP
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Burning Man Schedule */}
        {events.burningManSchedule && events.burningManSchedule.length > 0 && (
          <div className="mb-16 border border-neutral-200 rounded-lg bg-white p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-midnight mb-2">Burning Man 2024 Camp Schedule</h2>
              <p className="text-secondary-600">
                Daily activities and workshops during our time on the playa
              </p>
            </div>
            <div>
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
            </div>
          </div>
        )}

        {/* Event Guidelines */}
        {events.guidelines && (
          <div className="mb-16 border border-neutral-200 rounded-lg bg-white p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-midnight">Event Guidelines</h2>
            </div>
            <div>
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
            </div>
          </div>
        )}

        {/* Call to Action */}
        {events.cta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
              {events.cta.title}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {events.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={events.cta.buttons.primary.link}
                  className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg transition-shadow"
                >
                  {events.cta.buttons.primary.text}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={events.cta.buttons.secondary.link}
                  className="inline-block px-8 py-4 text-lg font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  {events.cta.buttons.secondary.text}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}