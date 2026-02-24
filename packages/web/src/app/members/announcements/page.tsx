'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MemberPortalLayout } from '../../../components/members/MemberPortalLayout';
import {
  Megaphone,
  Pin,
  Loader2,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchAnnouncements, type Announcement } from '../../../lib/mock-member-data';
import { formatDate } from '../../../lib/utils';

const categoryConfig: Record<string, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-sage/10 text-sage border-sage/20' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-200' },
  event: { label: 'Event', color: 'bg-gold/10 text-gold border-gold/20' },
  logistics: { label: 'Logistics', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/members');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements().then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  const filtered = announcements.filter((ann) => {
    const matchesSearch =
      searchQuery === '' ||
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ann.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const unpinned = filtered.filter((a) => !a.pinned);

  return (
    <MemberPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-display-thin text-3xl text-ink mb-2">Announcements</h1>
          <p className="text-body-relaxed text-ink-soft">
            Stay up to date with the latest news and updates from Camp Alborz.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input w-auto min-w-[140px] text-sm"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="event">Events</option>
            <option value="logistics">Logistics</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="luxury-card p-12 text-center hover:translate-y-0">
            <AlertCircle className="h-10 w-10 text-ink-soft/40 mx-auto mb-4" />
            <h3 className="text-display-thin text-xl text-ink mb-2">No Announcements Found</h3>
            <p className="text-body-relaxed text-sm text-ink-soft">
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no announcements at this time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Announcements */}
            {pinned.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gold uppercase tracking-wider">
                  <Pin className="h-3.5 w-3.5" />
                  Pinned
                </div>
                {pinned.map((ann) => (
                  <AnnouncementCard key={ann.id} announcement={ann} />
                ))}
              </div>
            )}

            {/* Regular Announcements */}
            {unpinned.length > 0 && (
              <div className="space-y-3">
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-soft uppercase tracking-wider pt-2">
                    Recent
                  </div>
                )}
                {unpinned.map((ann) => (
                  <AnnouncementCard key={ann.id} announcement={ann} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MemberPortalLayout>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const config = categoryConfig[announcement.category] || categoryConfig.general;

  return (
    <div className="luxury-card p-6 hover:translate-y-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          {announcement.pinned && (
            <Pin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          )}
          <h3 className="text-lg font-semibold text-ink leading-snug">
            {announcement.title}
          </h3>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
          {config.label}
        </span>
      </div>
      <p className="text-body-relaxed text-sm text-ink-soft mb-4 leading-relaxed">
        {announcement.content}
      </p>
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="font-medium">{announcement.author}</span>
        <span className="text-ink-soft/40">|</span>
        <span>{formatDate(announcement.date)}</span>
      </div>
    </div>
  );
}
