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
  Users,
  Wrench,
  GraduationCap,
  Music,
  Heart
} from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Pre-Burn Art Build Weekend",
    date: "March 15-17, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Community Workshop, Oakland",
    type: "Art Build",
    description: "Join us for a intensive weekend of building our 2024 art installation. All skill levels welcome!",
    attendees: 25,
    maxAttendees: 30,
    icon: Wrench,
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: 2,
    title: "Persian New Year Celebration",
    date: "March 20, 2024",
    time: "6:00 PM - 11:00 PM",
    location: "Persian Cultural Center, SF",
    type: "Cultural",
    description: "Celebrate Nowruz with traditional Persian food, music, and poetry. Open to all community members.",
    attendees: 45,
    maxAttendees: 60,
    icon: Heart,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 3,
    title: "Fundraising Dinner & Auction",
    date: "April 12, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "Private Residence, Berkeley",
    type: "Fundraising",
    description: "Annual fundraising event with silent auction and Persian cuisine to support our 2024 burn.",
    attendees: 38,
    maxAttendees: 50,
    icon: Heart,
    color: "bg-green-100 text-green-600"
  },
  {
    id: 4,
    title: "Burning Man Prep Workshop",
    date: "July 20, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Camp Alborz Warehouse",
    type: "Workshop",
    description: "Essential prep for new burners: packing lists, survival tips, and camp expectations.",
    attendees: 12,
    maxAttendees: 20,
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-600"
  }
];

const eventTypes = [
  {
    name: "Art Builds",
    description: "Collaborative construction of our installations",
    icon: Wrench,
    count: 8,
    color: "bg-saffron/10 text-saffron"
  },
  {
    name: "Cultural Events",
    description: "Persian celebrations and cultural exchanges",
    icon: Heart,
    count: 6,
    color: "bg-persian-purple/10 text-persian-purple"
  },
  {
    name: "Workshops",
    description: "Educational sessions and skill sharing",
    icon: GraduationCap,
    count: 12,
    color: "bg-desert-gold/10 text-desert-gold"
  },
  {
    name: "Social Gatherings",
    description: "Community bonding and networking events",
    icon: Users,
    count: 15,
    color: "bg-midnight/10 text-midnight"
  }
];

const burningManSchedule = [
  {
    day: "Monday",
    events: [
      { time: "4:00 PM", title: "Arrival & Camp Setup", description: "Welcome new members, set up camp infrastructure" },
      { time: "6:00 PM", title: "Persian Tea Ceremony", description: "Traditional welcome ceremony with tea and sweets" },
      { time: "8:00 PM", title: "Community Dinner", description: "First shared meal to bring everyone together" }
    ]
  },
  {
    day: "Tuesday",
    events: [
      { time: "10:00 AM", title: "Persian Calligraphy Workshop", description: "Learn traditional Persian writing arts" },
      { time: "2:00 PM", title: "Art Installation Tour", description: "Visit and learn about our collaborative installations" },
      { time: "7:00 PM", title: "Poetry & Music Night", description: "Share Persian poetry and traditional music" }
    ]
  },
  {
    day: "Wednesday",
    events: [
      { time: "11:00 AM", title: "Persian Cooking Class", description: "Learn to make traditional Persian dishes" },
      { time: "4:00 PM", title: "Mindfulness & Meditation", description: "Persian-inspired meditation practices" },
      { time: "8:00 PM", title: "Cultural Exchange", description: "Share stories and traditions from different backgrounds" }
    ]
  },
  {
    day: "Thursday",
    events: [
      { time: "9:00 AM", title: "Art Build Continuation", description: "Complete ongoing installation projects" },
      { time: "3:00 PM", title: "Persian Dance Workshop", description: "Learn traditional Persian folk dances" },
      { time: "6:00 PM", title: "Community Potluck", description: "Everyone contributes to a massive shared feast" }
    ]
  }
];

export default function EventsPage() {
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
            Camp Events & Activities
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            Join us throughout the year for art builds, cultural celebrations, 
            workshops, and community gatherings
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
            {eventTypes.map((type, index) => (
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
                        <type.icon className="h-7 w-7" />
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
            ))}
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
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${event.color} mr-3 flex-shrink-0`}>
                        <event.icon className="h-5 w-5" />
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
            ))}
          </div>
        </div>

        {/* Burning Man Schedule */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Burning Man 2024 Camp Schedule</CardTitle>
            <p className="text-secondary-600">
              Daily activities and workshops during our time on the playa
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {burningManSchedule.map((day) => (
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

        {/* Event Guidelines */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Event Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">Before Attending</h4>
                <ul className="space-y-2 text-secondary-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    RSVP in advance to help us plan
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Check event requirements and bring necessary items
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Arrive on time and ready to participate
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Bring a positive attitude and open mind
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">Community Values</h4>
                <ul className="space-y-2 text-secondary-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Respect all participants regardless of background
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Practice radical inclusion and consent
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Clean up after yourself and help others
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Share knowledge and learn from others
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-persian-purple/5 to-saffron/5 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
            Join Our Next Event
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            New to Camp Alborz? Attending an event is the perfect way to meet our 
            community and see if we're a good fit for each other.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-gradient-to-r from-persian-purple to-persian-violet hover:shadow-lg" asChild>
                <Link href="/apply">Join as Member</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="border-2 border-persian-purple text-persian-purple hover:bg-persian-purple hover:text-white" asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}