'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface TeamDirectoryProps {
  members: TeamMember[];
  layout?: 'grid' | 'list';
  showDepartments?: boolean;
}

/**
 * Team Directory Component
 *
 * Displays team members/staff in grid or list format
 */
export function TeamDirectory({
  members,
  layout = 'grid',
  showDepartments = false,
}: TeamDirectoryProps) {
  // Group by department if needed
  const grouped = showDepartments
    ? members.reduce((acc, member) => {
        const dept = member.department || 'General';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(member);
        return acc;
      }, {} as Record<string, TeamMember[]>)
    : { All: members };

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([department, deptMembers]) => (
        <div key={department}>
          {showDepartments && (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{department}</h2>
          )}

          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deptMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {deptMembers.map((member) => (
                <TeamMemberListItem key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Team Member Card (for grid layout)
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="text-center overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Avatar */}
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-semibold text-primary-600">
              {member.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Name and Role */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-sm text-primary-600 font-medium mb-3">{member.role}</p>

        {/* Bio */}
        {member.bio && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{member.bio}</p>
        )}

        {/* Contact */}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-3"
          >
            <EnvelopeIcon className="h-4 w-4" />
            Contact
          </a>
        )}

        {/* Social Links */}
        {member.social && (
          <div className="flex justify-center gap-3 pt-3 border-t border-gray-200">
            {member.social.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            )}
            {member.social.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            )}
            {member.social.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Team Member List Item (for list layout)
 */
function TeamMemberListItem({ member }: { member: TeamMember }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary-600">
                {member.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-sm text-primary-600 font-medium mb-2">{member.role}</p>
            {member.bio && (
              <p className="text-gray-600 mb-3">{member.bio}</p>
            )}

            <div className="flex items-center gap-4">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  Contact
                </a>
              )}

              {/* Social Links */}
              {member.social && (
                <div className="flex gap-3">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600"
                    >
                      LinkedIn
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600"
                    >
                      Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Sample team data
 */
export const sampleTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Camp Director',
    department: 'Leadership',
    bio: 'Leading Camp Alborz since 2020, Sarah brings 10 years of Burning Man experience and a passion for community building.',
    email: 'sarah@campalborz.org',
    social: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      instagram: 'https://instagram.com/sarahjohnson',
    },
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Art Installation Coordinator',
    department: 'Art & Culture',
    bio: 'Michael coordinates all art installations and leads our creative initiatives on the playa.',
    email: 'michael@campalborz.org',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Volunteer Coordinator',
    department: 'Operations',
    bio: 'Emma manages volunteer scheduling and ensures everyone has an amazing experience at camp.',
    email: 'emma@campalborz.org',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Events Manager',
    department: 'Programming',
    bio: 'David plans and executes all workshops, performances, and events throughout the year.',
    email: 'david@campalborz.org',
  },
];
