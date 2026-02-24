'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MemberPortalLayout } from '../../../components/members/MemberPortalLayout';
import {
  FolderOpen,
  Search,
  Loader2,
  ExternalLink,
  BookOpen,
  FileText,
  Link2,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchResources, type CampResource } from '../../../lib/mock-member-data';
import { getIcon } from '../../../lib/icons';
import { formatDate } from '../../../lib/utils';

const categoryConfig: Record<string, { label: string; color: string; icon: typeof BookOpen }> = {
  guide: { label: 'Guide', color: 'bg-green-50 text-green-700 border-green-200', icon: BookOpen },
  form: { label: 'Form', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ClipboardList },
  document: { label: 'Document', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileText },
  link: { label: 'Link', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Link2 },
};

export default function ResourcesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [resources, setResources] = useState<CampResource[]>([]);
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
      fetchResources().then((data) => {
        setResources(data);
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

  const filtered = resources.filter((res) => {
    const matchesSearch =
      searchQuery === '' ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || res.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, CampResource[]>>((acc, res) => {
    if (!acc[res.category]) acc[res.category] = [];
    acc[res.category].push(res);
    return acc;
  }, {});

  const categoryOrder = ['guide', 'form', 'document', 'link'];

  return (
    <MemberPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-display-thin text-3xl text-ink mb-2">Camp Resources</h1>
          <p className="text-body-relaxed text-ink-soft">
            Guides, documents, forms, and useful links for Camp Alborz members.
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
              placeholder="Search resources..."
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input w-auto min-w-[140px] text-sm"
          >
            <option value="all">All Types</option>
            <option value="guide">Guides</option>
            <option value="form">Forms</option>
            <option value="document">Documents</option>
            <option value="link">Links</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="luxury-card p-12 text-center hover:translate-y-0">
            <FolderOpen className="h-10 w-10 text-ink-soft/40 mx-auto mb-4" />
            <h3 className="text-display-thin text-xl text-ink mb-2">No Resources Found</h3>
            <p className="text-body-relaxed text-sm text-ink-soft">
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No resources are available at this time.'}
            </p>
            {(searchQuery || filterCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}
                className="mt-4 text-sm text-gold hover:text-gold/80 font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : filterCategory !== 'all' ? (
          // Flat list when filtering
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        ) : (
          // Grouped view
          <div className="space-y-8">
            {categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              const config = categoryConfig[cat] || categoryConfig.guide;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <config.icon className="h-4 w-4 text-gold" />
                    <h2 className="text-display-thin text-lg text-ink">{config.label}s</h2>
                    <span className="text-xs text-ink-soft ml-1">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((res) => (
                      <ResourceCard key={res.id} resource={res} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberPortalLayout>
  );
}

function ResourceCard({ resource }: { resource: CampResource }) {
  const config = categoryConfig[resource.category] || categoryConfig.guide;
  const IconComponent = getIcon(resource.icon);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="luxury-card p-5 group block"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 shrink-0 group-hover:bg-gold/20 transition-colors">
          <IconComponent className="h-5 w-5 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold transition-colors leading-snug">
              {resource.title}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 text-ink-soft/40 group-hover:text-gold shrink-0 mt-0.5 transition-colors" />
          </div>
          <p className="text-xs text-ink-soft mb-2 line-clamp-2">{resource.description}</p>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-ink-soft">
              Updated {formatDate(resource.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
