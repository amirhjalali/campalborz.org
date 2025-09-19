"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { 
  UserGroupIcon,
  CalendarDaysIcon,
  PhotoIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Community",
    description: "Connect with fellow campers and build lasting friendships",
    icon: UserGroupIcon,
    href: "/members",
  },
  {
    name: "Events",
    description: "Join our workshops, art builds, and social gatherings",
    icon: CalendarDaysIcon,
    href: "/events",
  },
  {
    name: "Art Gallery",
    description: "Explore our collective artistic creations and installations",
    icon: PhotoIcon,
    href: "/art",
  },
  {
    name: "Persian Culture",
    description: "Celebrate and learn about rich Persian heritage",
    icon: AcademicCapIcon,
    href: "/culture",
  },
  {
    name: "Support Us",
    description: "Help us create amazing experiences for everyone",
    icon: HeartIcon,
    href: "/donate",
  },
  {
    name: "Global Community",
    description: "Part of the worldwide Burning Man movement",
    icon: GlobeAltIcon,
    href: "/about",
  },
];

export default function HomePage() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
            Welcome to {tenant?.name || "Camp Platform"}
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
            A Burning Man theme camp focused on Persian culture, community building, 
            and creating transformative experiences in the desert and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/apply">Join Our Community</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            What We Offer
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Discover the many ways to get involved and be part of our vibrant community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.name} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <feature.icon className="h-8 w-8 text-primary-600 mr-3" />
                  <CardTitle>{feature.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 mb-4">{feature.description}</p>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={feature.href}>Learn More →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-primary-50 rounded-2xl my-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re new to Burning Man or a seasoned veteran, 
            there&apos;s a place for you in our camp family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/apply">Apply to Join</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/donate">Support Our Mission</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-lg text-secondary-600">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">8</div>
            <div className="text-lg text-secondary-600">Years at Burning Man</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">25+</div>
            <div className="text-lg text-secondary-600">Art Installations</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}