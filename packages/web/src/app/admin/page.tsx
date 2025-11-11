"use client";

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MemberManagement } from "@/components/admin/MemberManagement";
import { EventManagement } from "@/components/admin/EventManagement";
import { DonationManagement } from "@/components/admin/DonationManagement";
import MediaLibrary from "@/components/admin/MediaLibrary";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import { StatsGrid } from "@/components/admin/StatsCard";
import { BarChart, LineChart, PieChart, ActivityTimeline } from "@/components/admin/Charts";
import { useTenant } from "@/hooks/useTenant";
import { motion } from "framer-motion";
import { 
  Users,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Calendar,
  Image,
  DollarSign
} from "lucide-react";

const adminSections = [
  {
    id: "overview",
    name: "Overview", 
    icon: BarChart3,
    description: "Dashboard overview and key metrics"
  },
  {
    id: "members",
    name: "Members",
    icon: Users,
    description: "Manage member applications and profiles"
  },
  {
    id: "content",
    name: "Content",
    icon: FileText,
    description: "Manage pages, posts, and site content"
  },
  {
    id: "events",
    name: "Events",
    icon: Calendar,
    description: "Create and manage camp events"
  },
  {
    id: "art",
    name: "Art Gallery",
    icon: Image,
    description: "Manage art portfolio and installations"
  },
  {
    id: "media",
    name: "Media Library",
    icon: Image,
    description: "Manage uploaded files and media assets"
  },
  {
    id: "donations",
    name: "Donations",
    icon: DollarSign,
    description: "Track donations and financial metrics"
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    description: "View detailed analytics and insights"
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    description: "Configure camp settings and preferences"
  }
];

// Mock overview data
const overviewStats = {
  totalMembers: 45,
  pendingApplications: 8,
  upcomingEvents: 3,
  monthlyDonations: "$2,450",
  pageViews: "12.4K",
  recentActivity: [
    { type: "application", message: "New application from Sarah Johnson", time: "2 hours ago" },
    { type: "donation", message: "$150 donation received", time: "4 hours ago" },
    { type: "event", message: "Art Build Weekend RSVP from Mike Chen", time: "6 hours ago" },
    { type: "content", message: "Homepage updated", time: "1 day ago" },
  ]
};

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-600">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-600">
        <Navigation />
        <div className="text-center py-32 px-4 text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Admin Access Required
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            You need admin privileges to access this page.
          </motion.p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Overview Stats with New StatsGrid */}
            <StatsGrid
              stats={[
                {
                  title: "Total Members",
                  value: overviewStats.totalMembers,
                  change: 7.1,
                  changeLabel: "vs last month",
                  icon: <Users className="h-5 w-5" />,
                  variant: "default"
                },
                {
                  title: "Pending Applications",
                  value: overviewStats.pendingApplications,
                  icon: <Bell className="h-5 w-5" />,
                  variant: "warning"
                },
                {
                  title: "Monthly Donations",
                  value: overviewStats.monthlyDonations,
                  change: 15,
                  changeLabel: "vs last month",
                  icon: <DollarSign className="h-5 w-5" />,
                  variant: "success"
                },
                {
                  title: "Page Views",
                  value: overviewStats.pageViews,
                  change: 23.4,
                  changeLabel: "vs last month",
                  icon: <BarChart3 className="h-5 w-5" />,
                  variant: "primary"
                },
              ]}
              columns={4}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                title="Member Growth"
                data={[
                  { label: "Jan", value: 32 },
                  { label: "Feb", value: 35 },
                  { label: "Mar", value: 38 },
                  { label: "Apr", value: 41 },
                  { label: "May", value: 43 },
                  { label: "Jun", value: 45 },
                ]}
                height={250}
              />

              <PieChart
                title="Donation Sources"
                data={[
                  { label: "One-time", value: 1250, color: "#3b82f6" },
                  { label: "Recurring", value: 800, color: "#10b981" },
                  { label: "Events", value: 400, color: "#f59e0b" },
                ]}
                size={180}
              />
            </div>

            {/* Activity Timeline */}
            <ActivityTimeline
              title="Recent Activity"
              events={overviewStats.recentActivity.map((activity, index) => ({
                id: String(index),
                title: activity.message,
                timestamp: activity.time,
                type: activity.type === 'donation' ? 'success' :
                      activity.type === 'application' ? 'info' :
                      'info',
              }))}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveSection("members")} className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Review Applications
                  </Button>
                  <Button onClick={() => setActiveSection("events")} variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button onClick={() => setActiveSection("content")} variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "members":
        return <MemberManagement tenantId={tenant.id} />;

      case "events":
        return <EventManagement tenantId={tenant.id} />;

      case "donations":
        return <DonationManagement tenantId={tenant.id} />;

      case "media":
        return <MediaLibrary />;

      case "analytics":
        return <AnalyticsDashboard tenantId={tenant.id} />;

      case "content":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <p className="text-gray-600">Manage your website pages and content</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Management System</h3>
                <p className="text-gray-600 mb-4">
                  The CMS interface will be implemented here, allowing you to:
                </p>
                <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto mb-6">
                  <li>• Edit page content and layouts</li>
                  <li>• Manage blog posts and announcements</li>
                  <li>• Update images and media</li>
                  <li>• Configure navigation menus</li>
                </ul>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        );

      case "events":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <p className="text-gray-600">Create and manage camp events</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Management System</h3>
                <p className="text-gray-600 mb-4">
                  The event management interface will be implemented here, allowing you to:
                </p>
                <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto mb-6">
                  <li>• Create and edit events</li>
                  <li>• Manage RSVPs and attendance</li>
                  <li>• Send event notifications</li>
                  <li>• Track event analytics</li>
                </ul>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        );

      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Camp Settings</CardTitle>
              <p className="text-gray-600">Configure your camp's settings and preferences</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                <p className="text-gray-600 mb-4">
                  The settings interface will be implemented here, allowing you to:
                </p>
                <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto mb-6">
                  <li>• Update camp information</li>
                  <li>• Configure branding and themes</li>
                  <li>• Manage user permissions</li>
                  <li>• Set up integrations</li>
                </ul>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Section Coming Soon</h3>
              <p className="text-gray-600">This admin section is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-600">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Manage your camp's members, content, and settings
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {adminSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 flex items-center hover:bg-gray-50 transition-colors ${
                          activeSection === section.id 
                            ? "bg-primary-50 border-r-2 border-primary-500 text-primary-700" 
                            : "text-gray-700"
                        }`}
                      >
                        <section.icon className="h-5 w-5 mr-3" />
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs text-gray-500">{section.description}</div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}