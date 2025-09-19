"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MemberManagement } from "@/components/admin/MemberManagement";
import { EventManagement } from "@/components/admin/EventManagement";
import { DonationManagement } from "@/components/admin/DonationManagement";
import { useTenant } from "@/hooks/useTenant";
import { 
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  CalendarDaysIcon,
  PhotoIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const adminSections = [
  {
    id: "overview",
    name: "Overview", 
    icon: ChartBarIcon,
    description: "Dashboard overview and key metrics"
  },
  {
    id: "members",
    name: "Members",
    icon: UserGroupIcon,
    description: "Manage member applications and profiles"
  },
  {
    id: "content",
    name: "Content",
    icon: DocumentTextIcon,
    description: "Manage pages, posts, and site content"
  },
  {
    id: "events",
    name: "Events",
    icon: CalendarDaysIcon,
    description: "Create and manage camp events"
  },
  {
    id: "art",
    name: "Art Gallery",
    icon: PhotoIcon,
    description: "Manage art portfolio and installations"
  },
  {
    id: "donations",
    name: "Donations",
    icon: CurrencyDollarIcon,
    description: "Track donations and financial metrics"
  },
  {
    id: "settings",
    name: "Settings",
    icon: CogIcon,
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
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!tenant) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Admin Access Required</h1>
          <p className="text-secondary-600">You need admin privileges to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalMembers}</div>
                  <p className="text-xs text-green-600">+3 this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
                    <BellIcon className="h-4 w-4 text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{overviewStats.pendingApplications}</div>
                  <p className="text-xs text-gray-600">Needs attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Monthly Donations</CardTitle>
                    <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{overviewStats.monthlyDonations}</div>
                  <p className="text-xs text-green-600">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Page Views</CardTitle>
                    <ChartBarIcon className="h-4 w-4 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.pageViews}</div>
                  <p className="text-xs text-blue-600">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === 'application' ? 'bg-blue-500' :
                          activity.type === 'donation' ? 'bg-green-500' :
                          activity.type === 'event' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{activity.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveSection("members")} className="justify-start">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Review Applications
                  </Button>
                  <Button onClick={() => setActiveSection("events")} variant="outline" className="justify-start">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button onClick={() => setActiveSection("content")} variant="outline" className="justify-start">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
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

      case "content":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <p className="text-gray-600">Manage your website pages and content</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-secondary-600">
              Manage your camp's members, content, and settings
            </p>
          </div>

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
    </MainLayout>
  );
}