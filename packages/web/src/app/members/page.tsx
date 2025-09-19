"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  UserIcon,
  HeartIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  MusicalNoteIcon,
  PaintBrushIcon
} from "@heroicons/react/24/outline";

const memberTypes = [
  {
    title: "Core Members",
    description: "Long-term camp family who help with year-round planning",
    icon: HeartIcon,
    count: 15,
    color: "bg-red-100 text-red-600"
  },
  {
    title: "Active Members",
    description: "Regular participants who contribute to camp activities",
    icon: UserIcon,
    count: 25,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Artists & Makers",
    description: "Creative minds behind our installations and workshops",
    icon: PaintBrushIcon,
    count: 12,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Technical Crew",
    description: "Engineers and builders who make the magic happen",
    icon: WrenchScrewdriverIcon,
    count: 8,
    color: "bg-green-100 text-green-600"
  }
];

const spotlightMembers = [
  {
    name: "Amir Jalali",
    role: "Camp Founder & Lead",
    bio: "Software engineer by day, camp organizer by passion. Founded Camp Alborz in 2016 to share Persian culture with the Burning Man community.",
    skills: ["Leadership", "Persian Culture", "Technology"],
    yearsWithCamp: 8
  },
  {
    name: "Sara Mohammadi",
    role: "Art Director",
    bio: "Visual artist specializing in large-scale installations that blend traditional Persian motifs with contemporary desert aesthetics.",
    skills: ["Art Direction", "Installation Design", "Persian Calligraphy"],
    yearsWithCamp: 6
  },
  {
    name: "David Chen",
    role: "Operations Manager",
    bio: "Logistics expert who ensures our camp runs smoothly. Has been organizing festival events for over a decade.",
    skills: ["Operations", "Logistics", "Project Management"],
    yearsWithCamp: 4
  },
  {
    name: "Maryam Hosseini",
    role: "Cultural Ambassador",
    bio: "Poet and cultural educator who leads our Persian language workshops and poetry nights at camp.",
    skills: ["Persian Poetry", "Cultural Education", "Event Planning"],
    yearsWithCamp: 5
  }
];

export default function MembersPage() {
  return (
    <MainLayout>
      <div className="py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            Our Camp Family
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Meet the amazing people who make Camp Alborz a vibrant community of 
            creators, builders, and culture enthusiasts
          </p>
        </div>

        {/* Member Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {memberTypes.map((type) => (
            <Card key={type.title}>
              <CardHeader>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${type.color} mr-3`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <div className="text-2xl font-bold text-primary-600">{type.count}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-sm">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Member Spotlight */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Member Spotlight
            </h2>
            <p className="text-lg text-secondary-600">
              Get to know some of our core team members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {spotlightMembers.map((member) => (
              <Card key={member.name} className="h-full">
                <CardHeader>
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <UserIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <p className="text-primary-600 font-medium">{member.role}</p>
                      <p className="text-sm text-secondary-500">{member.yearsWithCamp} years with camp</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-700 mb-4">{member.bio}</p>
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What Our Members Do */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">What Our Members Contribute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <PaintBrushIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Art & Installations</h4>
                  <p className="text-secondary-600 text-sm">Creating beautiful installations that celebrate Persian art and culture</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <MusicalNoteIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Music & Performance</h4>
                  <p className="text-secondary-600 text-sm">DJs, musicians, and performers who create unforgettable experiences</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Infrastructure</h4>
                  <p className="text-secondary-600 text-sm">Building and maintaining camp structures, power, and logistics</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <AcademicCapIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Education & Workshops</h4>
                  <p className="text-secondary-600 text-sm">Teaching Persian language, cooking, crafts, and cultural traditions</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <HeartIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Community Building</h4>
                  <p className="text-secondary-600 text-sm">Organizing events, facilitating connections, and nurturing relationships</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-1">Mentorship</h4>
                  <p className="text-secondary-600 text-sm">Helping new members integrate and find their place in the community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Benefits */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Why Join Our Community?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">At Burning Man</h4>
                <ul className="space-y-1 text-secondary-700">
                  <li>• Shared camp infrastructure and resources</li>
                  <li>• Group meals and Persian tea ceremonies</li>
                  <li>• Collaborative art projects and installations</li>
                  <li>• Cultural workshops and poetry nights</li>
                  <li>• Support system for first-time burners</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">Year-Round</h4>
                <ul className="space-y-1 text-secondary-700">
                  <li>• Monthly social gatherings and potlucks</li>
                  <li>• Art build sessions and workshop days</li>
                  <li>• Cultural events and Persian celebrations</li>
                  <li>• Professional networking opportunities</li>
                  <li>• Lifelong friendships and community</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Ready to Join Our Family?
          </h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate individuals who want to contribute 
            to our community and share in the Camp Alborz experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/apply">Apply for Membership</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/events">Attend an Event</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}