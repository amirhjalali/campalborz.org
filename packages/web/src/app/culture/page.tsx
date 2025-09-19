"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  BookOpenIcon,
  MusicalNoteIcon,
  AcademicCapIcon,
  SparklesIcon,
  GlobeAltIcon,
  HeartIcon,
  UserGroupIcon,
  PaintBrushIcon
} from "@heroicons/react/24/outline";

const culturalElements = [
  {
    title: "Persian Poetry",
    description: "Explore the works of Rumi, Hafez, and contemporary Persian poets",
    icon: BookOpenIcon,
    activities: ["Poetry readings", "Calligraphy workshops", "Translation circles"],
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Traditional Music",
    description: "Experience the rich musical heritage of Iran",
    icon: MusicalNoteIcon,
    activities: ["Tar and setar performances", "Folk singing", "Music appreciation"],
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Persian Cuisine",
    description: "Learn about traditional cooking and food culture",
    icon: SparklesIcon,
    activities: ["Cooking classes", "Tea ceremonies", "Spice workshops"],
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Art & Crafts",
    description: "Traditional Persian arts and contemporary interpretations",
    icon: PaintBrushIcon,
    activities: ["Miniature painting", "Carpet weaving", "Metalwork"],
    color: "bg-orange-100 text-orange-600"
  }
];

const workshops = [
  {
    title: "Persian Calligraphy",
    instructor: "Maryam Hosseini",
    level: "Beginner Friendly",
    duration: "2 hours",
    description: "Learn the beautiful art of Persian script writing using traditional techniques and modern tools.",
    materials: "Provided",
    frequency: "Monthly"
  },
  {
    title: "Traditional Cooking",
    instructor: "Community Chefs",
    level: "All Levels",
    duration: "3 hours",
    description: "Master classic Persian dishes like fesenjan, tahdig, and baklava in our communal kitchen.",
    materials: "Included",
    frequency: "Bi-weekly"
  },
  {
    title: "Poetry & Storytelling",
    instructor: "Various Members",
    level: "All Levels",
    duration: "90 minutes",
    description: "Share and discuss Persian poetry, both classical and contemporary, in English and Farsi.",
    materials: "Books provided",
    frequency: "Weekly"
  },
  {
    title: "Traditional Dance",
    instructor: "Sara Mohammadi",
    level: "Beginner",
    duration: "1.5 hours",
    description: "Learn folk dances from different regions of Iran in a welcoming, inclusive environment.",
    materials: "Comfortable clothing",
    frequency: "Monthly"
  }
];

const culturalValues = [
  {
    title: "Hospitality (Mehmān-navāzī)",
    description: "The Persian tradition of welcoming guests with warmth and generosity",
    example: "Our camp opens its doors to all, offering tea and conversation to any visitor",
    icon: HeartIcon
  },
  {
    title: "Respect for Elders",
    description: "Honoring the wisdom and experience of our community elders",
    example: "We seek guidance from experienced burners and Persian cultural experts",
    icon: UserGroupIcon
  },
  {
    title: "Education & Learning",
    description: "The high value placed on knowledge, wisdom, and intellectual growth",
    example: "Our workshops and discussions encourage continuous learning and curiosity",
    icon: AcademicCapIcon
  },
  {
    title: "Artistic Expression",
    description: "The celebration of beauty in all its forms through art and creativity",
    example: "We integrate traditional Persian aesthetics into our Burning Man installations",
    icon: PaintBrushIcon
  }
];

const persianCelebrations = [
  {
    name: "Nowruz (Persian New Year)",
    date: "March 20",
    description: "Celebrating the spring equinox with traditional ceremonies, foods, and renewal rituals",
    traditions: ["Haft-sin table", "Spring cleaning", "Family gatherings", "Gift giving"]
  },
  {
    name: "Yalda Night",
    date: "December 21",
    description: "The longest night of the year celebrated with poetry, pomegranates, and community",
    traditions: ["Poetry reading", "Pomegranate sharing", "Staying up all night", "Storytelling"]
  },
  {
    name: "Chaharshanbe Suri",
    date: "Last Wednesday before Nowruz",
    description: "Fire jumping festival to cleanse the past year and welcome the new",
    traditions: ["Jumping over fires", "Cleansing rituals", "Community bonfires", "Wish making"]
  }
];

const learningResources = [
  {
    category: "Language",
    resources: [
      "Basic Farsi phrases for camp",
      "Poetry reading in original Farsi",
      "Cultural context for language use"
    ]
  },
  {
    category: "History",
    resources: [
      "Ancient Persian empires",
      "Modern Iranian culture",
      "Persian contributions to world civilization"
    ]
  },
  {
    category: "Arts",
    resources: [
      "Traditional Persian music instruments",
      "Calligraphy and miniature painting",
      "Carpet patterns and their meanings"
    ]
  },
  {
    category: "Literature",
    resources: [
      "Classical poets: Rumi, Hafez, Ferdowsi",
      "Contemporary Persian writers",
      "Translation and interpretation techniques"
    ]
  }
];

export default function CulturePage() {
  return (
    <MainLayout>
      <div className="py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            Persian Culture & Heritage
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Discover the rich traditions, values, and artistic heritage of Persian culture 
            through immersive experiences and community learning
          </p>
        </div>

        {/* Cultural Elements Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {culturalElements.map((element) => (
            <Card key={element.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${element.color} mr-3`}>
                    <element.icon className="h-6 w-6" />
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
          ))}
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
              {culturalValues.map((value) => (
                <div key={value.title} className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <value.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">{value.title}</h4>
                    <p className="text-secondary-700 mb-2">{value.description}</p>
                    <p className="text-sm text-primary-600 font-medium">
                      In Practice: {value.example}
                    </p>
                  </div>
                </div>
              ))}
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
            {workshops.map((workshop) => (
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
              {persianCelebrations.map((celebration) => (
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
              {learningResources.map((section) => (
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
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Building Cultural Bridges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">Our Mission</h4>
                <p className="text-secondary-700 mb-4">
                  We believe in the power of cultural exchange to build understanding, 
                  break down barriers, and create meaningful connections between people 
                  from all backgrounds.
                </p>
                <p className="text-secondary-700">
                  Through our cultural programs, we share the beauty of Persian heritage 
                  while learning from and celebrating the diversity of the Burning Man community.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">How We Do It</h4>
                <ul className="space-y-2 text-secondary-700">
                  <li className="flex items-start">
                    <GlobeAltIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    Welcoming people of all backgrounds to explore Persian culture
                  </li>
                  <li className="flex items-start">
                    <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    Creating inclusive spaces for cultural dialogue and learning
                  </li>
                  <li className="flex items-start">
                    <BookOpenIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    Sharing stories, traditions, and values through interactive experiences
                  </li>
                  <li className="flex items-start">
                    <HeartIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    Building lasting friendships across cultural boundaries
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Explore Persian Culture With Us
          </h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
            Whether you have Persian heritage or are simply curious about the culture, 
            you're welcome to join our learning community and cultural celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/events">Attend Cultural Events</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/apply">Join Our Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}