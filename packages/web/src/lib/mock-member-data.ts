/**
 * Mock Data Service for the Member Portal
 *
 * This module provides mock data that simulates API responses.
 * When the real API is ready, replace these functions with actual fetch calls.
 */

// ============================================================
// Types
// ============================================================

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  playaName?: string;
  phone?: string;
  bio?: string;
  profilePhoto?: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  joinedDate: string;
  memberSince: string;
}

export interface MembershipStatus {
  season: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'GRACE_PERIOD';
  duesPaid: boolean;
  duesAmount: number;
  duesPaidDate?: string;
  duesDueDate: string;
  nextRenewal: string;
  housingType?: string;
  gridPower?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'general' | 'urgent' | 'event' | 'logistics';
  pinned: boolean;
}

export interface MemberEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'fundraiser' | 'meeting' | 'social' | 'build' | 'playa';
  rsvpCount: number;
  maxAttendees?: number;
}

export interface CampResource {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'form' | 'document' | 'link';
  url: string;
  updatedAt: string;
  icon: string;
}

export interface DirectoryMember {
  id: string;
  name: string;
  playaName?: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  joinedYear: string;
  bio?: string;
  skills?: string[];
  profilePhoto?: string;
}

// ============================================================
// Mock Data
// ============================================================

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '2026 Season Kickoff Meeting',
    content: 'Join us for the official 2026 season kickoff meeting! We will be discussing camp layout, art projects, and volunteer opportunities. All returning and new members are encouraged to attend.',
    author: 'Camp Leadership',
    date: '2026-02-20',
    category: 'general',
    pinned: true,
  },
  {
    id: 'ann-2',
    title: 'Dues Deadline Approaching',
    content: 'Reminder: Camp dues for the 2026 season are due by March 15th. Please make sure to submit your dues via Venmo or Zelle to secure your placement. Contact the treasurer if you need to arrange a payment plan.',
    author: 'Treasurer',
    date: '2026-02-18',
    category: 'urgent',
    pinned: true,
  },
  {
    id: 'ann-3',
    title: 'Spring Fundraiser - Persian Night at Brooklyn Warehouse',
    content: 'Our annual spring fundraiser is confirmed for March 22nd at the Brooklyn warehouse. Expect live DJs, Persian food, and special art installations. Members get free entry and can bring +1.',
    author: 'Events Team',
    date: '2026-02-15',
    category: 'event',
    pinned: false,
  },
  {
    id: 'ann-4',
    title: 'Build Week Volunteer Sign-Up Open',
    content: 'Build week is scheduled for August 18-23. We need volunteers for structure assembly, shade installation, kitchen setup, and art car prep. Sign up using the link in the resources section.',
    author: 'Build Lead',
    date: '2026-02-10',
    category: 'logistics',
    pinned: false,
  },
  {
    id: 'ann-5',
    title: 'HOMA Art Car Update',
    content: 'Exciting progress on HOMA! The new LED panels have arrived and we are starting integration testing this weekend. Check the art channel in Discord for photos and updates.',
    author: 'Art Director',
    date: '2026-02-05',
    category: 'general',
    pinned: false,
  },
  {
    id: 'ann-6',
    title: 'New Member Orientation',
    content: 'Welcome to all new members! We are hosting an orientation session on February 28th at 7pm via Zoom. You will meet camp leadership, learn about our culture and expectations, and get all your questions answered.',
    author: 'Camp Leadership',
    date: '2026-02-01',
    category: 'general',
    pinned: false,
  },
];

const MOCK_EVENTS: MemberEvent[] = [
  {
    id: 'evt-1',
    title: 'Season Kickoff Meeting',
    date: '2026-03-01',
    time: '7:00 PM EST',
    location: 'Zoom (link in Discord)',
    description: 'Annual kickoff meeting to discuss the 2026 season plans, camp layout, and art projects.',
    type: 'meeting',
    rsvpCount: 28,
    maxAttendees: 50,
  },
  {
    id: 'evt-2',
    title: 'Spring Fundraiser - Persian Night',
    date: '2026-03-22',
    time: '8:00 PM EST',
    location: 'Brooklyn Warehouse, 45 Main St',
    description: 'Annual spring fundraiser with live DJs, Persian food, hookah lounge, and art installations. Members get free entry + 1 guest.',
    type: 'fundraiser',
    rsvpCount: 45,
    maxAttendees: 200,
  },
  {
    id: 'evt-3',
    title: 'HOMA Workshop Day',
    date: '2026-04-12',
    time: '10:00 AM EST',
    location: 'Camp Workshop, Jersey City',
    description: 'Hands-on workshop for HOMA art car LED installation and sound system setup. Lunch provided.',
    type: 'build',
    rsvpCount: 12,
    maxAttendees: 20,
  },
  {
    id: 'evt-4',
    title: 'May Day Social BBQ',
    date: '2026-05-03',
    time: '2:00 PM EST',
    location: 'Prospect Park, Brooklyn',
    description: 'Casual BBQ and hangout for camp members and friends. Bring a dish to share!',
    type: 'social',
    rsvpCount: 32,
  },
  {
    id: 'evt-5',
    title: 'Build Week',
    date: '2026-08-18',
    time: 'All Week',
    location: 'Black Rock City, Nevada',
    description: 'Camp infrastructure setup including shade structures, kitchen, tea house, and art cars. All hands on deck!',
    type: 'playa',
    rsvpCount: 18,
    maxAttendees: 25,
  },
  {
    id: 'evt-6',
    title: 'Burning Man 2026',
    date: '2026-08-24',
    time: 'Full Burn',
    location: 'Black Rock City, Nevada',
    description: 'The main event! Camp Alborz returns to the playa for another year of art, music, tea, and community.',
    type: 'playa',
    rsvpCount: 42,
  },
];

const MOCK_RESOURCES: CampResource[] = [
  {
    id: 'res-1',
    title: 'Camp Alborz Survival Guide',
    description: 'Everything you need to know about camping with Alborz, from packing lists to playa etiquette.',
    category: 'guide',
    url: '#',
    updatedAt: '2026-01-15',
    icon: 'book-open',
  },
  {
    id: 'res-2',
    title: 'Build Week Volunteer Sign-Up',
    description: 'Sign up for build week shifts including structure, kitchen, sound, and art car setup.',
    category: 'form',
    url: '#',
    updatedAt: '2026-02-10',
    icon: 'wrench',
  },
  {
    id: 'res-3',
    title: '2026 Camp Layout Map',
    description: 'Interactive map of our camp layout for the 2026 season including tent placements and common areas.',
    category: 'document',
    url: '#',
    updatedAt: '2026-02-05',
    icon: 'map-pin',
  },
  {
    id: 'res-4',
    title: 'Packing Checklist',
    description: 'Comprehensive packing list for Burning Man, including camp-specific items and recommendations.',
    category: 'guide',
    url: '#',
    updatedAt: '2025-12-20',
    icon: 'check-circle',
  },
  {
    id: 'res-5',
    title: 'Camp Discord Server',
    description: 'Join our Discord server for real-time communication, updates, and community chat.',
    category: 'link',
    url: '#',
    updatedAt: '2026-01-01',
    icon: 'users',
  },
  {
    id: 'res-6',
    title: 'Medical & Emergency Info',
    description: 'Emergency procedures, medical resources, and safety protocols for the playa.',
    category: 'document',
    url: '#',
    updatedAt: '2026-01-20',
    icon: 'shield',
  },
  {
    id: 'res-7',
    title: 'Meal Plan & Kitchen Schedule',
    description: 'Communal meal schedule, kitchen duty sign-ups, and dietary accommodation info.',
    category: 'form',
    url: '#',
    updatedAt: '2026-02-12',
    icon: 'coffee',
  },
  {
    id: 'res-8',
    title: 'Art Car Operation Guide',
    description: 'Safety and operation guidelines for HOMA and DAMAVAND art cars, including driving shifts.',
    category: 'guide',
    url: '#',
    updatedAt: '2026-01-25',
    icon: 'truck',
  },
];

const MOCK_DIRECTORY: DirectoryMember[] = [
  {
    id: 'mem-1',
    name: 'Arash Mehraban',
    playaName: 'Sage Fox',
    role: 'ADMIN',
    joinedYear: '2008',
    bio: 'Founding member and camp lead. Passionate about building community through Persian culture and art.',
    skills: ['Leadership', 'Event Planning', 'Sound Engineering'],
  },
  {
    id: 'mem-2',
    name: 'Shirin Kamali',
    playaName: 'Desert Rose',
    role: 'ADMIN',
    joinedYear: '2009',
    bio: 'Co-lead and art director. Oversees HOMA and DAMAVAND art car projects.',
    skills: ['Art Direction', 'LED Design', 'Fabrication'],
  },
  {
    id: 'mem-3',
    name: 'Dariush Tehrani',
    playaName: 'The Alchemist',
    role: 'MANAGER',
    joinedYear: '2012',
    bio: 'Camp treasurer and logistics coordinator. Keeps the camp running smoothly behind the scenes.',
    skills: ['Finance', 'Logistics', 'Construction'],
  },
  {
    id: 'mem-4',
    name: 'Leila Mohammadi',
    role: 'MANAGER',
    joinedYear: '2014',
    bio: 'Kitchen lead and tea house coordinator. Known for the best Persian rice on the playa.',
    skills: ['Cooking', 'Event Coordination', 'Community Building'],
  },
  {
    id: 'mem-5',
    name: 'Reza Bahrami',
    playaName: 'Cosmic Reza',
    role: 'MEMBER',
    joinedYear: '2016',
    bio: 'DJ and sound engineer. Brings the beats to every Alborz event.',
    skills: ['DJing', 'Sound Engineering', 'Music Production'],
  },
  {
    id: 'mem-6',
    name: 'Maryam Hosseini',
    playaName: 'Star Weaver',
    role: 'MEMBER',
    joinedYear: '2018',
    bio: 'Visual artist and workshop facilitator. Leads Persian calligraphy workshops at the camp.',
    skills: ['Calligraphy', 'Visual Art', 'Teaching'],
  },
  {
    id: 'mem-7',
    name: 'Babak Nassiri',
    role: 'MEMBER',
    joinedYear: '2019',
    bio: 'Build crew lead and structural engineer. Designs and builds camp shade structures.',
    skills: ['Engineering', 'Construction', 'Design'],
  },
  {
    id: 'mem-8',
    name: 'Parisa Azimi',
    playaName: 'Persia',
    role: 'MEMBER',
    joinedYear: '2020',
    bio: 'Photographer and social media manager. Captures the magic of Alborz for the world to see.',
    skills: ['Photography', 'Social Media', 'Videography'],
  },
  {
    id: 'mem-9',
    name: 'Kaveh Soltani',
    role: 'MEMBER',
    joinedYear: '2021',
    bio: 'MOOP marshal and environmental lead. Keeps our camp footprint minimal on the playa.',
    skills: ['Environmental Planning', 'MOOP Management', 'Recycling'],
  },
  {
    id: 'mem-10',
    name: 'Nasim Farahani',
    playaName: 'Breeze',
    role: 'MEMBER',
    joinedYear: '2022',
    bio: 'First aid responder and wellness coordinator. Takes care of the camp family on and off the playa.',
    skills: ['First Aid', 'Wellness', 'Yoga'],
  },
  {
    id: 'mem-11',
    name: 'Omid Rahmani',
    role: 'MEMBER',
    joinedYear: '2023',
    bio: 'Electrician and grid power specialist. Manages the camp power infrastructure.',
    skills: ['Electrical', 'Solar', 'Generator Maintenance'],
  },
  {
    id: 'mem-12',
    name: 'Sara Eslami',
    playaName: 'Moonlight',
    role: 'MEMBER',
    joinedYear: '2024',
    bio: 'New member and enthusiastic volunteer. Eager to contribute to build week and events.',
    skills: ['Volunteer Coordination', 'Cooking', 'Decorating'],
  },
];

const MOCK_MEMBERSHIP_STATUS: MembershipStatus = {
  season: '2026',
  status: 'ACTIVE',
  duesPaid: true,
  duesAmount: 350,
  duesPaidDate: '2026-01-20',
  duesDueDate: '2026-03-15',
  nextRenewal: '2027-01-01',
  housingType: 'Shiftpod',
  gridPower: '30 Amp',
};

// ============================================================
// Mock Data Service Functions
// ============================================================

/** Simulates API latency */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await delay(400);
  return MOCK_ANNOUNCEMENTS;
}

export async function fetchMemberEvents(): Promise<MemberEvent[]> {
  await delay(350);
  return MOCK_EVENTS;
}

export async function fetchResources(): Promise<CampResource[]> {
  await delay(300);
  return MOCK_RESOURCES;
}

export async function fetchDirectory(): Promise<DirectoryMember[]> {
  await delay(500);
  return MOCK_DIRECTORY;
}

export async function fetchMembershipStatus(): Promise<MembershipStatus> {
  await delay(250);
  return MOCK_MEMBERSHIP_STATUS;
}

export async function fetchMemberProfile(): Promise<MemberProfile> {
  await delay(300);
  return {
    id: 'current-user',
    name: 'Current User',
    email: 'user@campalborz.org',
    playaName: '',
    phone: '',
    bio: '',
    role: 'MEMBER',
    joinedDate: '2022-03-15',
    memberSince: '3 years',
  };
}

export async function updateMemberProfile(
  _profile: Partial<MemberProfile>
): Promise<MemberProfile> {
  await delay(600);
  // In a real app, this would POST to the API and return the updated profile
  return {
    id: 'current-user',
    name: 'Current User',
    email: 'user@campalborz.org',
    playaName: '',
    phone: '',
    bio: '',
    role: 'MEMBER',
    joinedDate: '2022-03-15',
    memberSince: '3 years',
    ..._profile,
  };
}
