'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Image,
  DollarSign,
  LogOut,
  Shield,
  Loader2,
} from 'lucide-react';

const adminSections = [
  { id: 'overview', name: 'Overview', icon: BarChart3, description: 'Dashboard overview and key metrics' },
  { id: 'members', name: 'Members', icon: Users, description: 'Manage member applications and profiles' },
  { id: 'events', name: 'Events', icon: Calendar, description: 'Create and manage camp events' },
  { id: 'content', name: 'Content', icon: FileText, description: 'Manage pages, posts, and site content' },
  { id: 'media', name: 'Media Library', icon: Image, description: 'Manage uploaded files and media assets' },
  { id: 'donations', name: 'Donations', icon: DollarSign, description: 'Track donations and financial metrics' },
  { id: 'settings', name: 'Settings', icon: Settings, description: 'Configure camp settings and preferences' },
];

const overviewStats = [
  { label: 'Total Members', value: '45', icon: Users },
  { label: 'Pending Applications', value: '8', icon: FileText },
  { label: 'Upcoming Events', value: '3', icon: Calendar },
  { label: 'Monthly Donations', value: '$2,450', icon: DollarSign },
];

const recentActivity = [
  { message: 'New application from Sarah Johnson', time: '2 hours ago' },
  { message: '$150 donation received', time: '4 hours ago' },
  { message: 'Art Build Weekend RSVP from Mike Chen', time: '6 hours ago' },
  { message: 'Homepage content updated', time: '1 day ago' },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </main>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  if (user.role !== 'ADMIN') {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <motion.div
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center section-contained"
          >
            <div className="inline-flex p-4 rounded-full bg-red-50 border border-red-200 mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-display-thin text-3xl text-ink mb-4">Access Denied</h1>
            <p className="text-body-relaxed text-ink-soft mb-8">
              You need admin privileges to access this page.
            </p>
            <button onClick={() => router.push('/')} className="cta-primary">
              Go to Homepage
            </button>
          </motion.div>
        </main>
      </>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="luxury-card p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
                      <stat.icon className="h-5 w-5 text-gold" />
                    </div>
                    <p className="text-sm text-ink-soft">{stat.label}</p>
                  </div>
                  <p className="text-display-thin text-3xl text-ink">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="luxury-card p-6">
              <h3 className="text-display-thin text-xl text-ink mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between border-b border-line/40 pb-3 last:border-0 last:pb-0">
                    <p className="text-body-relaxed text-sm text-ink">{activity.message}</p>
                    <span className="text-xs text-ink-soft whitespace-nowrap ml-4">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="luxury-card p-6">
              <h3 className="text-display-thin text-xl text-ink mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setActiveSection('members')} className="cta-secondary text-sm">
                  <Users className="h-4 w-4" />
                  Review Applications
                </button>
                <button onClick={() => setActiveSection('events')} className="cta-secondary text-sm">
                  <Calendar className="h-4 w-4" />
                  Create Event
                </button>
                <button onClick={() => setActiveSection('content')} className="cta-secondary text-sm">
                  <FileText className="h-4 w-4" />
                  Edit Content
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="luxury-card p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-gold/10 border border-gold/20 mb-4">
              {(() => {
                const section = adminSections.find(s => s.id === activeSection);
                const Icon = section?.icon || Settings;
                return <Icon className="h-8 w-8 text-gold" />;
              })()}
            </div>
            <h3 className="text-display-thin text-2xl text-ink mb-2">
              {adminSections.find(s => s.id === activeSection)?.name}
            </h3>
            <p className="text-body-relaxed text-ink-soft mb-6">
              This section is under development and will be available soon.
            </p>
            <button onClick={() => setActiveSection('overview')} className="cta-secondary">
              Back to Overview
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        {/* Header */}
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="pattern-persian opacity-20 absolute inset-0" />
          <motion.div
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative section-contained"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full border border-gold/30">
                  <Shield className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <p className="text-display-wide text-xs tracking-[0.4em] text-ink-soft/80">ADMIN DASHBOARD</p>
                  <h1 className="text-display-thin text-3xl text-ink">{user.name}</h1>
                  <p className="text-body-relaxed text-sm text-ink-soft">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="cta-secondary flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </section>

        {/* Dashboard */}
        <section className="py-10">
          <div className="section-contained">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <nav className="luxury-card p-2 space-y-1">
                  {adminSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                        activeSection === section.id
                          ? 'bg-gold/10 text-gold border border-gold/20'
                          : 'text-ink-soft hover:bg-cream hover:text-ink'
                      }`}
                    >
                      <section.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-4">
                {renderSection()}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
