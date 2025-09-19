"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            About Camp Alborz
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            A celebration of Persian culture, community, and creativity in the heart of Black Rock City
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle as="h2">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-secondary-700 mb-4">
              Camp Alborz brings together the rich traditions of Persian culture with the transformative 
              spirit of Burning Man. We create a space where ancient wisdom meets radical self-expression, 
              fostering community, creativity, and cultural exchange.
            </p>
            <p className="text-lg text-secondary-700">
              Named after Mount Alborz, the highest peak in Iran, our camp stands as a beacon of 
              Persian heritage while embracing the diversity and inclusivity that makes the Burning Man 
              community so special.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Community First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                We believe in the power of community to transform lives and create lasting bonds 
                that extend far beyond the playa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cultural Bridge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                We serve as a bridge between Persian culture and the global Burning Man community, 
                sharing our heritage while learning from others.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radical Inclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Everyone is welcome in our camp, regardless of background, experience, or 
                connection to Persian culture.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Art & Expression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                We encourage creative expression through art, music, poetry, and performance, 
                blending traditional and contemporary forms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gifting Economy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                We practice the gift economy through sharing food, art, knowledge, and experiences 
                without expectation of return.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave No Trace</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                We are committed to environmental stewardship and leaving the playa better 
                than we found it.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle as="h2">Our History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">2016 - The Beginning</h3>
                <p className="text-secondary-700">
                  Camp Alborz was founded by a small group of Persian-American friends who wanted to 
                  share their culture with the Burning Man community while creating a home away from home.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">2017-2019 - Growing Community</h3>
                <p className="text-secondary-700">
                  Our camp grew from 15 to 40 members, establishing traditions like Persian tea ceremonies, 
                  poetry nights, and collaborative art projects that blend Eastern and Western aesthetics.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">2020-2021 - Virtual Connection</h3>
                <p className="text-secondary-700">
                  During the pandemic, we maintained our community through virtual events, online 
                  art collaborations, and regional gatherings, proving that our bonds transcend physical space.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">2022-Present - Renaissance</h3>
                <p className="text-secondary-700">
                  Returning to the playa stronger than ever, we&apos;ve expanded our offerings to include 
                  workshops on Persian crafts, cooking classes, and larger-scale art installations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Join Our Story
          </h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re Persian, curious about the culture, or simply looking for a 
            welcoming community, we&apos;d love to have you as part of our camp family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/apply">Apply to Join</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/members">Meet Our Members</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}