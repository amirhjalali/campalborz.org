"use client";

import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DonationForm } from "@/components/donation/DonationForm";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart,
  DollarSign,
  Truck,
  Wrench,
  Users,
  BarChart3,
  CheckCircle,
  Gift
} from "lucide-react";

const donationTiers = [
  {
    amount: 25,
    title: "Tea Ceremony Supporter",
    description: "Helps fund our daily Persian tea ceremonies",
    perks: ["Camp sticker", "Thank you email"],
    popular: false
  },
  {
    amount: 75,
    title: "Art Build Contributor",
    description: "Supports materials for community art projects",
    perks: ["Camp sticker", "Thank you email", "Progress updates"],
    popular: false
  },
  {
    amount: 150,
    title: "Community Builder",
    description: "Funds workshops and community events",
    perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup"],
    popular: true
  },
  {
    amount: 300,
    title: "Infrastructure Champion",
    description: "Helps with camp setup and infrastructure",
    perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup", "Camp t-shirt"],
    popular: false
  },
  {
    amount: 500,
    title: "Cultural Ambassador",
    description: "Sponsors cultural education programs",
    perks: ["All previous perks", "Recognition on camp website", "Camp hoodie"],
    popular: false
  }
];

const fundingPriorities = [
  {
    title: "Art Installations",
    percentage: 35,
    amount: 12250,
    goal: 35000,
    description: "Materials and tools for our 2024 art projects",
    icon: Wrench,
    color: "bg-orange-500"
  },
  {
    title: "Infrastructure",
    percentage: 28,
    amount: 9800,
    goal: 35000,
    description: "Shade structures, lighting, and camp facilities",
    icon: Truck,
    color: "bg-blue-500"
  },
  {
    title: "Community Programs",
    percentage: 20,
    amount: 7000,
    goal: 35000,
    description: "Workshops, cultural events, and education",
    icon: Users,
    color: "bg-green-500"
  },
  {
    title: "Emergency Fund",
    percentage: 17,
    amount: 5950,
    goal: 35000,
    description: "Unexpected costs and contingency planning",
    icon: Heart,
    color: "bg-purple-500"
  }
];

const impactStats = [
  {
    number: "$45,000",
    label: "Raised in 2023",
    icon: DollarSign
  },
  {
    number: "125",
    label: "Individual Donors",
    icon: UserGroupIcon
  },
  {
    number: "8",
    label: "Art Projects Funded",
    icon: WrenchScrewdriverIcon
  },
  {
    number: "500+",
    label: "Community Members Served",
    icon: HeartIcon
  }
];

const transparencyItems = [
  {
    category: "Art & Installations",
    percentage: 40,
    amount: "$18,000",
    description: "Materials, tools, transportation for art projects"
  },
  {
    category: "Camp Infrastructure",
    percentage: 30,
    amount: "$13,500",
    description: "Shade structures, lighting, kitchen, utilities"
  },
  {
    category: "Community Events",
    percentage: 15,
    amount: "$6,750",
    description: "Workshops, cultural events, food for gatherings"
  },
  {
    category: "Transportation",
    percentage: 10,
    amount: "$4,500",
    description: "Truck rental, fuel, logistics"
  },
  {
    category: "Administrative",
    percentage: 5,
    amount: "$2,250",
    description: "Registration fees, permits, insurance"
  }
];

const otherWaysToHelp = [
  {
    title: "Sponsor a Workshop",
    description: "Fund specific cultural or artistic workshops",
    icon: Gift,
    amount: "$200-500"
  },
  {
    title: "Adopt an Art Project",
    description: "Fully sponsor a community art installation",
    icon: Wrench,
    amount: "$1,000-3,000"
  },
  {
    title: "Corporate Sponsorship",
    description: "Partner with us for larger initiatives",
    icon: BarChart3,
    amount: "$2,500+"
  },
  {
    title: "In-Kind Donations",
    description: "Donate materials, tools, or services",
    icon: Truck,
    amount: "Various"
  }
];

export default function DonatePage() {
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
            Support Camp Alborz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
          >
            Help us create transformative experiences, build beautiful art, 
            and share Persian culture with the Burning Man community
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary-900 mb-2">{stat.number}</div>
                <div className="text-secondary-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
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
            {donationTiers.map((tier) => (
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
              {fundingPriorities.map((priority) => (
                <div key={priority.title} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-secondary-100 rounded-lg mr-3">
                        <priority.icon className="h-5 w-5 text-secondary-600" />
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
              ))}
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
              {transparencyItems.map((item) => (
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
            {otherWaysToHelp.map((option) => (
              <Card key={option.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-3 bg-primary-100 rounded-lg mr-4 group-hover:bg-primary-200 transition-colors">
                      <option.icon className="h-6 w-6 text-primary-600" />
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
            ))}
          </div>
        </div>

        {/* Donor Recognition */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Thank You to Our 2023 Supporters</CardTitle>
            <p className="text-secondary-600">
              We're grateful to everyone who made our vision possible
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-secondary-50 rounded-lg p-8">
                <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h4 className="font-semibold text-secondary-900 mb-2">Cultural Ambassadors ($500+)</h4>
                <p className="text-secondary-600 mb-6">
                  Special thanks to our major donors who enable our largest initiatives
                </p>
                
                <h4 className="font-semibold text-secondary-900 mb-2">Community Builders ($150+)</h4>
                <p className="text-secondary-600 mb-6">
                  And to all our community builders who support our regular programming
                </p>
                
                <p className="text-sm text-secondary-500">
                  Full donor recognition list available upon request. 
                  We respect donor privacy preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle as="h2">Tax Deductible Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-secondary-700 mb-2">
                    <strong>Camp Alborz is a registered 501(c)(3) non-profit organization.</strong> 
                    All donations are tax-deductible to the full extent allowed by law.
                  </p>
                  <p className="text-secondary-600 text-sm">
                    EIN: XX-XXXXXXX | You will receive a tax receipt via email after your donation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Form */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Make a Difference Today
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Your support helps us continue sharing Persian culture, building incredible art, 
              and creating transformative experiences for our community.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <DonationForm 
              campaigns={[
                "Art & Installations",
                "Camp Infrastructure", 
                "Community Events",
                "Transportation",
                "Burning Man 2024"
              ]}
              onSuccess={(donationId) => {
                console.log("Donation successful:", donationId);
              }}
            />
          </div>
        </div>

        {/* Additional Support Options */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-persian-purple/5 to-desert-gold/5 rounded-2xl p-12"
        >
          <h3 className="text-3xl font-bold text-midnight mb-6">
            Other Ways to Support
          </h3>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Beyond donations, you can support our mission by joining our community and volunteering
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-gradient-to-r from-persian-purple to-persian-violet hover:shadow-lg" asChild>
                <Link href="/apply">Join Our Community</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="border-2 border-persian-purple text-persian-purple hover:bg-persian-purple hover:text-white" asChild>
                <Link href="/events">Volunteer at Events</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}