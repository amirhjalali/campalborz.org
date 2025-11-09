'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  role: 'member' | 'volunteer' | 'admin' | 'organizer';
  status: 'active' | 'pending' | 'inactive';
  skills?: string[];
  interests?: string[];
  verified?: boolean;
  stats?: {
    eventsAttended: number;
    volunteeredHours: number;
    donationsCount: number;
  };
}

interface MemberProfileCardProps {
  member: Member;
  onEdit?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
}

/**
 * Member Profile Card
 *
 * Displays member information in a card format
 */
export function MemberProfileCard({
  member,
  onEdit,
  onMessage,
  showActions = true,
}: MemberProfileCardProps) {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    organizer: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
    volunteer: 'bg-yellow-100 text-yellow-700',
  };

  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header with avatar and basic info */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary-600">
                {member.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Name and role */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              {member.verified && (
                <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Verified member" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn('px-3 py-1 rounded-full text-xs font-medium', roleColors[member.role])}>
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <span className={cn('w-2 h-2 rounded-full', statusColors[member.status])}></span>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>

            {member.bio && (
              <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <a href={`mailto:${member.email}`} className="text-primary-600 hover:text-primary-700">
              {member.email}
            </a>
          </div>

          {member.phone && (
            <div className="flex items-center gap-3 text-sm">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <a href={`tel:${member.phone}`} className="text-gray-700">
                {member.phone}
              </a>
            </div>
          )}

          {member.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{member.location}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">
              Joined {new Date(member.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Skills and interests */}
        {(member.skills?.length || member.interests?.length) && (
          <div className="space-y-3 mb-6">
            {member.skills && member.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.interests && member.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {member.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {member.stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{member.stats.eventsAttended}</p>
              <p className="text-xs text-gray-600">Events Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{member.stats.volunteeredHours}</p>
              <p className="text-xs text-gray-600">Hours Volunteered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{member.stats.donationsCount}</p>
              <p className="text-xs text-gray-600">Donations</p>
            </div>
          </div>
        )}

        {/* Message button */}
        {showActions && onMessage && (
          <div className="mt-6">
            <Button variant="primary" fullWidth onClick={onMessage}>
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Member Card (for lists)
 */
interface CompactMemberCardProps {
  member: Member;
  onClick?: () => void;
}

export function CompactMemberCard({ member, onClick }: CompactMemberCardProps) {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    organizer: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
    volunteer: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Card
      className={cn(
        'transition-all',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-primary-600">
                {member.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
              {member.verified && (
                <CheckBadgeIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{member.email}</p>
          </div>

          {/* Role badge */}
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex-shrink-0', roleColors[member.role])}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Member Grid
 *
 * Grid layout for multiple members
 */
interface MemberGridProps {
  members: Member[];
  onMemberClick?: (member: Member) => void;
  columns?: 2 | 3 | 4;
}

export function MemberGrid({ members, onMemberClick, columns = 3 }: MemberGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns])}>
      {members.map((member) => (
        <CompactMemberCard
          key={member.id}
          member={member}
          onClick={onMemberClick ? () => onMemberClick(member) : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Sample member data
 */
export const sampleMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    avatar: undefined,
    bio: 'Art installation lead with 5 years of Burning Man experience. Passionate about community building and creative expression.',
    location: 'San Francisco, CA',
    joinDate: '2020-03-15',
    role: 'organizer',
    status: 'active',
    verified: true,
    skills: ['Art Installation', 'Carpentry', 'Event Planning'],
    interests: ['Sculpture', 'Community', 'Sustainability'],
    stats: {
      eventsAttended: 12,
      volunteeredHours: 145,
      donationsCount: 8,
    },
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    bio: 'First-time burner eager to learn and contribute to the community.',
    location: 'Oakland, CA',
    joinDate: '2023-06-20',
    role: 'member',
    status: 'active',
    verified: false,
    interests: ['Photography', 'Music', 'Camping'],
    stats: {
      eventsAttended: 2,
      volunteeredHours: 12,
      donationsCount: 1,
    },
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    joinDate: '2021-09-10',
    role: 'volunteer',
    status: 'active',
    verified: true,
    skills: ['Cooking', 'First Aid', 'Spanish'],
    interests: ['Culinary Arts', 'Wellness', 'Dance'],
    stats: {
      eventsAttended: 8,
      volunteeredHours: 89,
      donationsCount: 4,
    },
  },
];
