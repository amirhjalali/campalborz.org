"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  PhotoIcon,
  FireIcon,
  SparklesIcon,
  EyeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MapPinIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

const featuredInstallations = [
  {
    id: 1,
    title: "Mount Alborz Rising",
    year: "2023",
    artist: "Camp Alborz Collective",
    description: "A 20-foot tall interactive sculpture representing the highest peak in Iran, featuring LED lights that respond to music and movement.",
    image: "/api/placeholder/400/300",
    location: "7:30 & Esplanade",
    participants: "15 artists",
    materials: "Steel, LED strips, Arduino sensors",
    category: "Large Installation",
    status: "Completed",
    impact: "Visited by 5,000+ burners"
  },
  {
    id: 2,
    title: "Persian Garden Oasis",
    year: "2022",
    artist: "Maryam Hosseini & David Chen",
    description: "An immersive garden space featuring traditional Persian architecture elements and interactive water features.",
    image: "/api/placeholder/400/300",
    location: "Camp Alborz",
    participants: "8 artists",
    materials: "Recycled wood, mirrors, solar pumps",
    category: "Environmental Art",
    status: "Archived",
    impact: "Featured in Burning Man Journal"
  },
  {
    id: 3,
    title: "Calligraphy Wind Chimes",
    year: "2024",
    artist: "Sara Mohammadi",
    description: "Large-scale wind chimes featuring Persian poetry that creates both visual and auditory art as desert winds pass through.",
    image: "/api/placeholder/400/300",
    location: "In Development",
    participants: "12 artists",
    materials: "Copper, aluminum, laser-cut steel",
    category: "Sound Art",
    status: "In Progress",
    impact: "Expected completion July 2024"
  }
];

const artCategories = [
  {
    name: "Large Installations",
    count: 8,
    description: "Monumental pieces that define our camp's visual presence",
    icon: FireIcon,
    color: "bg-red-100 text-red-600"
  },
  {
    name: "Interactive Art",
    count: 12,
    description: "Pieces that invite participation and engagement",
    icon: SparklesIcon,
    color: "bg-purple-100 text-purple-600"
  },
  {
    name: "Cultural Expressions",
    count: 15,
    description: "Art celebrating Persian heritage and traditions",
    icon: AcademicCapIcon,
    color: "bg-blue-100 text-blue-600"
  },
  {
    name: "Community Collaborations",
    count: 20,
    description: "Projects involving multiple camp members",
    icon: UserGroupIcon,
    color: "bg-green-100 text-green-600"
  }
];

const artworkGallery = [
  {
    title: "Mirrors of Isfahan",
    artist: "Collective Work",
    year: "2021",
    type: "Installation",
    description: "Mirror work inspired by traditional Persian architecture"
  },
  {
    title: "Desert Roses",
    artist: "Amir Jalali",
    year: "2020",
    type: "Sculpture",
    description: "Steel sculptures representing the resilience of Persian culture"
  },
  {
    title: "Poetry in Motion",
    artist: "Maryam Hosseini",
    year: "2023",
    type: "Performance Art",
    description: "Live calligraphy combined with spoken word poetry"
  },
  {
    title: "Nomad's Journey",
    artist: "David Chen",
    year: "2022",
    type: "Mixed Media",
    description: "Interactive map showing historical Persian trade routes"
  },
  {
    title: "Rumi's Wisdom",
    artist: "Sara Mohammadi",
    year: "2021",
    type: "Typography",
    description: "Large-scale installation of illuminated Rumi quotes"
  },
  {
    title: "Persepolis Dreams",
    artist: "Community Build",
    year: "2023",
    type: "Architecture",
    description: "Temporary structures inspired by ancient Persian palaces"
  }
];

const artProcess = [
  {
    phase: "Ideation",
    description: "Community brainstorming sessions to develop concepts",
    timeline: "November - December"
  },
  {
    phase: "Design",
    description: "Detailed planning, sketches, and 3D modeling",
    timeline: "January - February"
  },
  {
    phase: "Fundraising",
    description: "Securing materials and funding for the project",
    timeline: "February - March"
  },
  {
    phase: "Build Season",
    description: "Collaborative construction at our workshop space",
    timeline: "April - July"
  },
  {
    phase: "Installation",
    description: "Setting up the art on the playa during Burning Man",
    timeline: "August"
  },
  {
    phase: "Legacy",
    description: "Documentation, archiving, and planning future iterations",
    timeline: "September - October"
  }
];

export default function ArtPage() {
  return (
    <MainLayout>
      <div className="py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            Art & Installations
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Explore our collaborative artistic journey, blending Persian cultural heritage 
            with contemporary desert art and community creativity
          </p>
        </div>

        {/* Art Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {artCategories.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${category.color} mr-3`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div className="text-sm text-secondary-500">{category.count} pieces</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-sm">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Installations */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Featured Installations
            </h2>
            <p className="text-lg text-secondary-600">
              Our most significant artistic contributions to the playa
            </p>
          </div>

          <div className="space-y-8">
            {featuredInstallations.map((installation, index) => (
              <Card key={installation.id} className="overflow-hidden">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  <div className={`bg-secondary-100 flex items-center justify-center p-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="w-full h-64 bg-secondary-300 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-secondary-500" />
                      <span className="ml-3 text-secondary-600">Installation Photo</span>
                    </div>
                  </div>
                  <div className={`p-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-secondary-900 mb-2">{installation.title}</h3>
                        <p className="text-primary-600 font-medium">{installation.artist} • {installation.year}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        installation.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        installation.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-secondary-100 text-secondary-600'
                      }`}>
                        {installation.status}
                      </span>
                    </div>
                    
                    <p className="text-secondary-700 mb-6">{installation.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-secondary-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-primary-600" />
                        <span className="text-sm">{installation.location}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-primary-600" />
                        <span className="text-sm">{installation.participants}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <span className="text-sm"><strong>Materials:</strong> {installation.materials}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <EyeIcon className="h-4 w-4 mr-2 text-primary-600" />
                        <span className="text-sm">{installation.impact}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium mr-2">
                        {installation.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Community Art Gallery
            </h2>
            <p className="text-lg text-secondary-600">
              A showcase of artwork created by our talented community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworkGallery.map((artwork, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-secondary-100 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-secondary-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{artwork.title}</CardTitle>
                  <p className="text-primary-600 font-medium">{artwork.artist}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600 text-sm mb-3">{artwork.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-500">{artwork.year}</span>
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs">
                      {artwork.type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Art Creation Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Our Art Creation Process</CardTitle>
            <p className="text-secondary-600">
              How we collaborate to bring artistic visions to life
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artProcess.map((phase, index) => (
                <div key={phase.phase} className="relative">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-secondary-900">{phase.phase}</h4>
                  </div>
                  <p className="text-secondary-700 mb-2">{phase.description}</p>
                  <div className="flex items-center text-primary-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{phase.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Get Involved */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Get Involved in Camp Art</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">For Artists</h4>
                <ul className="space-y-2 text-secondary-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Submit your art proposals for community consideration
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Lead workshops to teach your artistic skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Collaborate with other artists on larger installations
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Access to camp art budget and workshop space
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">For Builders & Supporters</h4>
                <ul className="space-y-2 text-secondary-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Join weekend art build sessions (no experience needed)
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Contribute materials, tools, or funding for projects
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Help with transportation and playa installation
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Document the art creation process and final pieces
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Create Art With Us
          </h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
            Whether you're an experienced artist or just curious about creating, 
            there's a place for you in our artistic community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/apply">Join Our Artists</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/events">Attend Art Build</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}