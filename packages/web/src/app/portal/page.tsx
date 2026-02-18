'use client';

import Link from 'next/link';
import { Calendar, CreditCard, User, Megaphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const quickLinks = [
  {
    label: 'My Profile',
    href: '/portal/profile',
    icon: User,
    description: 'View and update your member profile',
  },
  {
    label: 'My Payments',
    href: '/portal/payments',
    icon: CreditCard,
    description: 'Track dues and payment history',
  },
  {
    label: 'Season Details',
    href: '/portal/season',
    icon: Calendar,
    description: 'View current season information',
  },
];

export default function PortalDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-display-thin text-3xl text-ink mb-2">
          Welcome back, {user.playaName || user.name}!
        </h1>
        <p className="text-body-relaxed text-ink-soft">
          Here is your Camp Alborz member dashboard.
        </p>
      </div>

      {/* Season status card */}
      <div className="luxury-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-gold" />
          <div>
            <h2 className="text-display-thin text-xl text-ink">Season Status</h2>
            <p className="text-sm text-ink-soft">Burning Man 2026</p>
          </div>
        </div>
        <div className="p-4 bg-cream rounded-xl border border-tan/30">
          <p className="text-body-relaxed text-sm text-ink-soft">
            Season enrollment details will appear here once available. Check back soon for updates on camp registration, dues, and placement.
          </p>
        </div>
      </div>

      {/* Quick links grid */}
      <div>
        <h2 className="text-display-thin text-xl text-ink mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="block">
                <div className="luxury-card p-5 group cursor-pointer hover:shadow-luxury-hover transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gold" />
                    <h3 className="text-display-thin text-lg text-ink">{link.label}</h3>
                  </div>
                  <p className="text-body-relaxed text-sm text-ink-soft">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Announcements placeholder */}
      <div className="luxury-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="h-5 w-5 text-gold" />
          <h2 className="text-display-thin text-xl text-ink">Announcements</h2>
        </div>
        <div className="p-4 bg-cream rounded-xl border border-tan/30">
          <p className="text-body-relaxed text-sm text-ink-soft">
            No announcements at this time. Camp updates and important news will be posted here.
          </p>
        </div>
      </div>
    </div>
  );
}
