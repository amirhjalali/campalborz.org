'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MemberPortalLayout } from '../../../components/members/MemberPortalLayout';
import {
  Users,
  User,
  Search,
  Loader2,
  AlertCircle,
  Shield,
  Star,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDirectory, type DirectoryMember } from '../../../lib/mock-member-data';

const roleConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  ADMIN: { label: 'Camp Lead', color: 'bg-gold/10 text-gold border-gold/20', icon: Star },
  MANAGER: { label: 'Manager', color: 'bg-sage/10 text-sage border-sage/20', icon: Shield },
  MEMBER: { label: 'Member', color: 'bg-cream text-ink-soft border-line/30', icon: User },
};

export default function DirectoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [directory, setDirectory] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/members');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDirectory().then((data) => {
        setDirectory(data);
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

  const filtered = directory.filter((member) => {
    const matchesSearch =
      searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.playaName && member.playaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.skills && member.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Sort: ADMIN first, then MANAGER, then MEMBER
  const sortOrder: Record<string, number> = { ADMIN: 0, MANAGER: 1, MEMBER: 2 };
  const sorted = [...filtered].sort((a, b) => (sortOrder[a.role] ?? 3) - (sortOrder[b.role] ?? 3));

  return (
    <MemberPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-display-thin text-3xl text-ink mb-2">Member Directory</h1>
          <p className="text-body-relaxed text-ink-soft">
            Connect with fellow Camp Alborz members. {directory.length} members in our community.
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
              placeholder="Search by name, playa name, or skill..."
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-input w-auto min-w-[140px] text-sm"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Camp Leads</option>
            <option value="MANAGER">Managers</option>
            <option value="MEMBER">Members</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="luxury-card p-12 text-center hover:translate-y-0">
            <Users className="h-10 w-10 text-ink-soft/40 mx-auto mb-4" />
            <h3 className="text-display-thin text-xl text-ink mb-2">No Members Found</h3>
            <p className="text-body-relaxed text-sm text-ink-soft">
              {searchQuery || filterRole !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'The member directory is empty.'}
            </p>
            {(searchQuery || filterRole !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setFilterRole('all'); }}
                className="mt-4 text-sm text-gold hover:text-gold/80 font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </MemberPortalLayout>
  );
}

function MemberCard({ member }: { member: DirectoryMember }) {
  const role = roleConfig[member.role] || roleConfig.MEMBER;

  return (
    <div className="luxury-card p-5 hover:translate-y-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-sage/10 border-2 border-gold/30 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-gold/70" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-ink truncate">{member.name}</h3>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${role.color}`}>
              <role.icon className="h-2.5 w-2.5" />
              {role.label}
            </span>
          </div>

          {member.playaName && (
            <p className="text-xs text-gold font-medium mb-1">
              &ldquo;{member.playaName}&rdquo;
            </p>
          )}

          <p className="text-xs text-ink-soft mb-2">
            Member since {member.joinedYear}
          </p>

          {member.bio && (
            <p className="text-xs text-ink-soft line-clamp-2 mb-2">{member.bio}</p>
          )}

          {member.skills && member.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream text-[10px] font-medium text-ink-soft border border-line/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
