/**
 * Camp Alborz Database Seed
 *
 * Populates the database with:
 *   - 2 seasons (2025 past, 2026 active)
 *   - 1 admin user + 8 sample regular members with varied statuses
 *   - Season member enrollments for both seasons
 *   - Sample events (past build days, upcoming shifts)
 *   - Sample announcements
 *   - Sample membership applications (various statuses)
 *   - Sample camp inventory / resources
 *   - Sample expenses and budget lines
 *   - Audit log entries
 *
 * Run with:  npx prisma db seed
 *       or:  npm run seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Convert dollar amount to integer cents */
function cents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Create a Date at noon UTC for a given YYYY-MM-DD string */
function d(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00Z');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('========================================');
  console.log(' Camp Alborz Database Seed');
  console.log('========================================\n');

  // ------------------------------------------------------------------
  // 1. HASH PASSWORDS
  // ------------------------------------------------------------------
  console.log('[1/10] Hashing passwords...');
  const adminHash = await bcrypt.hash('admin123', 12);
  const memberHash = await bcrypt.hash('member123', 12);

  // ------------------------------------------------------------------
  // 2. SEASONS
  // ------------------------------------------------------------------
  console.log('[2/10] Creating seasons...');

  const season2025 = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      name: 'Alborz 2025',
      isActive: false,
      duesAmount: cents(1200),
      gridFee30amp: cents(500),
      gridFee50amp: cents(1000),
      startDate: d('2025-08-24'),
      endDate: d('2025-09-01'),
      buildStartDate: d('2025-08-19'),
      strikeEndDate: d('2025-09-03'),
    },
  });

  const season2026 = await prisma.season.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      name: 'Alborz 2026',
      isActive: true,
      duesAmount: cents(1200),
      gridFee30amp: cents(150),
      gridFee50amp: cents(250),
      startDate: d('2026-08-30'),
      endDate: d('2026-09-07'),
      buildStartDate: d('2026-08-24'),
      strikeEndDate: d('2026-09-09'),
    },
  });

  console.log(`  -> Season 2025: ${season2025.id}`);
  console.log(`  -> Season 2026: ${season2026.id}`);

  // ------------------------------------------------------------------
  // 3. ADMIN USER
  // ------------------------------------------------------------------
  console.log('[3/10] Creating admin user...');

  const admin = await prisma.member.upsert({
    where: { email: 'admin@campalborz.org' },
    update: {},
    create: {
      email: 'admin@campalborz.org',
      passwordHash: adminHash,
      name: 'Amir Jalali',
      playaName: 'Amir',
      phone: '(310) 555-0100',
      gender: 'MALE',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      emergencyContactName: 'Ahson Jalali',
      emergencyContactPhone: '(310) 555-0101',
      notes: 'Camp founder and primary administrator',
    },
  });

  console.log(`  -> Admin: ${admin.name} (${admin.email})`);

  // ------------------------------------------------------------------
  // 4. SAMPLE MEMBERS (8 with varied profiles)
  // ------------------------------------------------------------------
  console.log('[4/10] Creating sample members...');

  const membersData = [
    {
      email: 'bita@campalborz.org',
      name: 'Bita Mehrjou',
      playaName: 'Bita',
      phone: '(310) 555-0102',
      gender: 'FEMALE' as const,
      role: 'MANAGER' as const,
      emailVerified: true,
      dietaryRestrictions: null,
    },
    {
      email: 'darius@campalborz.org',
      name: 'Darius Tehrani',
      playaName: 'Dusty D',
      phone: '(818) 555-0103',
      gender: 'MALE' as const,
      role: 'MEMBER' as const,
      emailVerified: true,
      dietaryRestrictions: 'Vegetarian',
    },
    {
      email: 'sara@campalborz.org',
      name: 'Sara Bakhtiari',
      playaName: null,
      phone: '(415) 555-0104',
      gender: 'FEMALE' as const,
      role: 'MEMBER' as const,
      emailVerified: true,
      dietaryRestrictions: null,
    },
    {
      email: 'reza@campalborz.org',
      name: 'Reza Farhangi',
      playaName: 'Rez',
      phone: '(213) 555-0105',
      gender: 'MALE' as const,
      role: 'MEMBER' as const,
      emailVerified: false,
      dietaryRestrictions: 'Gluten Free',
    },
    {
      email: 'yasmin@campalborz.org',
      name: 'Yasmin Khorasani',
      playaName: 'Yaz',
      phone: '(310) 555-0106',
      gender: 'FEMALE' as const,
      role: 'MEMBER' as const,
      emailVerified: true,
      dietaryRestrictions: null,
    },
    {
      email: 'marco@campalborz.org',
      name: 'Marco Costa',
      playaName: 'Cosmo',
      phone: '(323) 555-0107',
      gender: 'MALE' as const,
      role: 'MEMBER' as const,
      emailVerified: true,
      dietaryRestrictions: null,
    },
    {
      email: 'nina@campalborz.org',
      name: 'Nina Svensson',
      playaName: null,
      phone: '(510) 555-0108',
      gender: 'FEMALE' as const,
      role: 'MEMBER' as const,
      emailVerified: false,
      dietaryRestrictions: 'Vegan',
    },
    {
      email: 'alex@campalborz.org',
      name: 'Alex Petrosyan',
      playaName: 'Lex',
      phone: '(818) 555-0109',
      gender: 'MALE' as const,
      role: 'MEMBER' as const,
      emailVerified: true,
      dietaryRestrictions: null,
    },
  ];

  const members: Record<string, { id: string; email: string; name: string }> = {};

  for (const m of membersData) {
    const member = await prisma.member.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        passwordHash: memberHash,
        name: m.name,
        playaName: m.playaName,
        phone: m.phone,
        gender: m.gender,
        role: m.role,
        isActive: true,
        emailVerified: m.emailVerified,
        dietaryRestrictions: m.dietaryRestrictions,
      },
    });
    members[m.email] = { id: member.id, email: member.email, name: member.name };
  }

  // Also store admin in lookup
  members['admin@campalborz.org'] = { id: admin.id, email: admin.email, name: admin.name };

  console.log(`  -> ${Object.keys(members).length} members created/upserted`);

  // ------------------------------------------------------------------
  // 5. SEASON MEMBER ENROLLMENTS
  // ------------------------------------------------------------------
  console.log('[5/10] Enrolling members in seasons...');

  // 2025 enrollments (past season - everyone confirmed or cancelled)
  const enrollments2025 = [
    { email: 'admin@campalborz.org', status: 'CONFIRMED' as const, housing: 'TENT' as const, housingSize: '10x12', buildCrew: true, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-20', departure: '2025-09-01' },
    { email: 'bita@campalborz.org', status: 'CONFIRMED' as const, housing: 'SHIFTPOD' as const, housingSize: '12x12', buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-22', departure: '2025-09-01' },
    { email: 'darius@campalborz.org', status: 'CONFIRMED' as const, housing: 'RV' as const, housingSize: '25ft', buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-23', departure: '2025-09-01' },
    { email: 'sara@campalborz.org', status: 'CONFIRMED' as const, housing: 'DORM' as const, housingSize: null, buildCrew: false, strikeCrew: true, isAlborzVirgin: true, isBMVirgin: true, arrival: '2025-08-24', departure: '2025-08-31' },
    { email: 'reza@campalborz.org', status: 'CANCELLED' as const, housing: null, housingSize: null, buildCrew: false, strikeCrew: false, isAlborzVirgin: true, isBMVirgin: false, arrival: null, departure: null },
    { email: 'yasmin@campalborz.org', status: 'CONFIRMED' as const, housing: 'SHARED' as const, housingSize: null, buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-22', departure: '2025-08-31' },
    { email: 'marco@campalborz.org', status: 'CONFIRMED' as const, housing: 'RV' as const, housingSize: '22ft', buildCrew: true, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-22', departure: '2025-09-01' },
    { email: 'nina@campalborz.org', status: 'CONFIRMED' as const, housing: 'TENT' as const, housingSize: '10x14', buildCrew: false, strikeCrew: false, isAlborzVirgin: true, isBMVirgin: true, arrival: '2025-08-24', departure: '2025-08-31' },
    { email: 'alex@campalborz.org', status: 'CONFIRMED' as const, housing: 'TRAILER' as const, housingSize: '28ft', buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false, arrival: '2025-08-24', departure: '2025-09-01' },
  ];

  const seasonMembers2025: Record<string, string> = {}; // email -> seasonMemberId

  for (const e of enrollments2025) {
    const memberId = members[e.email].id;
    const sm = await prisma.seasonMember.upsert({
      where: { seasonId_memberId: { seasonId: season2025.id, memberId } },
      update: {},
      create: {
        seasonId: season2025.id,
        memberId,
        status: e.status,
        housingType: e.housing,
        housingSize: e.housingSize,
        gridPower: 'NONE',
        buildCrew: e.buildCrew,
        strikeCrew: e.strikeCrew,
        isAlborzVirgin: e.isAlborzVirgin,
        isBMVirgin: e.isBMVirgin,
        preApprovalForm: e.status === 'CONFIRMED' ? 'YES' : null,
        arrivalDate: e.arrival ? d(e.arrival) : null,
        departureDate: e.departure ? d(e.departure) : null,
      },
    });
    seasonMembers2025[e.email] = sm.id;
  }

  // 2026 enrollments (current season - mix of statuses)
  const enrollments2026 = [
    { email: 'admin@campalborz.org', status: 'CONFIRMED' as const, housing: 'TENT' as const, housingSize: '10x12', buildCrew: true, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'bita@campalborz.org', status: 'CONFIRMED' as const, housing: 'SHIFTPOD' as const, housingSize: '12x12', buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'darius@campalborz.org', status: 'MAYBE' as const, housing: null, housingSize: null, buildCrew: false, strikeCrew: false, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'sara@campalborz.org', status: 'INTERESTED' as const, housing: null, housingSize: null, buildCrew: false, strikeCrew: false, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'yasmin@campalborz.org', status: 'CONFIRMED' as const, housing: 'SHARED' as const, housingSize: null, buildCrew: false, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'marco@campalborz.org', status: 'CONFIRMED' as const, housing: 'RV' as const, housingSize: '25ft', buildCrew: true, strikeCrew: true, isAlborzVirgin: false, isBMVirgin: false },
    { email: 'alex@campalborz.org', status: 'WAITLISTED' as const, housing: null, housingSize: null, buildCrew: false, strikeCrew: false, isAlborzVirgin: false, isBMVirgin: false },
  ];

  const seasonMembers2026: Record<string, string> = {};

  for (const e of enrollments2026) {
    const memberId = members[e.email].id;
    const sm = await prisma.seasonMember.upsert({
      where: { seasonId_memberId: { seasonId: season2026.id, memberId } },
      update: {},
      create: {
        seasonId: season2026.id,
        memberId,
        status: e.status,
        housingType: e.housing,
        housingSize: e.housingSize,
        gridPower: 'NONE',
        buildCrew: e.buildCrew,
        strikeCrew: e.strikeCrew,
        isAlborzVirgin: e.isAlborzVirgin,
        isBMVirgin: e.isBMVirgin,
      },
    });
    seasonMembers2026[e.email] = sm.id;
  }

  console.log(`  -> ${Object.keys(seasonMembers2025).length} enrollments for 2025`);
  console.log(`  -> ${Object.keys(seasonMembers2026).length} enrollments for 2026`);

  // ------------------------------------------------------------------
  // 6. SAMPLE EVENTS (Build Days + Shifts)
  // ------------------------------------------------------------------
  console.log('[6/10] Creating sample events...');

  // Past build days for 2025
  const buildDay1 = await prisma.buildDay.create({
    data: {
      seasonId: season2025.id,
      date: d('2025-08-19'),
      name: 'Tuesday Build - Infrastructure',
      notes: 'Focus on shade structures and container placement',
    },
  });

  const buildDay2 = await prisma.buildDay.create({
    data: {
      seasonId: season2025.id,
      date: d('2025-08-20'),
      name: 'Wednesday Build - Kitchen & Sound',
      notes: 'Kitchen assembly, sound system setup, decoration',
    },
  });

  const buildDay3 = await prisma.buildDay.create({
    data: {
      seasonId: season2025.id,
      date: d('2025-08-21'),
      name: 'Thursday Build - Final Details',
      notes: 'Lighting, rugs, final walkthrough',
    },
  });

  // Build assignments for 2025 (admin + marco were on build crew)
  await prisma.buildAssignment.createMany({
    data: [
      { buildDayId: buildDay1.id, seasonMemberId: seasonMembers2025['admin@campalborz.org'] },
      { buildDayId: buildDay1.id, seasonMemberId: seasonMembers2025['marco@campalborz.org'] },
      { buildDayId: buildDay2.id, seasonMemberId: seasonMembers2025['admin@campalborz.org'] },
      { buildDayId: buildDay2.id, seasonMemberId: seasonMembers2025['marco@campalborz.org'] },
      { buildDayId: buildDay3.id, seasonMemberId: seasonMembers2025['admin@campalborz.org'] },
    ],
    skipDuplicates: true,
  });

  // Upcoming build days for 2026
  await prisma.buildDay.createMany({
    data: [
      { seasonId: season2026.id, date: d('2026-08-24'), name: 'Monday Build - Container Drop & Infrastructure' },
      { seasonId: season2026.id, date: d('2026-08-25'), name: 'Tuesday Build - Shade & Kitchen' },
      { seasonId: season2026.id, date: d('2026-08-26'), name: 'Wednesday Build - Sound & Decor' },
      { seasonId: season2026.id, date: d('2026-08-27'), name: 'Thursday Build - Final Touches' },
    ],
    skipDuplicates: true,
  });

  // Shifts for 2025 (past)
  await prisma.shift.createMany({
    data: [
      { seasonId: season2025.id, name: 'Greeter Shift - Morning', description: 'Welcome arriving campers', date: d('2025-08-25'), startTime: '10:00', endTime: '14:00', maxVolunteers: 3, location: 'Front Entrance' },
      { seasonId: season2025.id, name: 'Kitchen Duty - Lunch', description: 'Prep and serve lunch', date: d('2025-08-25'), startTime: '11:00', endTime: '14:00', maxVolunteers: 4, location: 'Kitchen' },
      { seasonId: season2025.id, name: 'Greeter Shift - Afternoon', description: 'Welcome arriving campers', date: d('2025-08-25'), startTime: '14:00', endTime: '18:00', maxVolunteers: 3, location: 'Front Entrance' },
      { seasonId: season2025.id, name: 'Kitchen Duty - Dinner', description: 'Prep and serve dinner', date: d('2025-08-26'), startTime: '16:00', endTime: '20:00', maxVolunteers: 4, location: 'Kitchen' },
      { seasonId: season2025.id, name: 'MOOP Sweep', description: 'Camp-wide MOOP sweep before departure', date: d('2025-09-01'), startTime: '08:00', endTime: '10:00', maxVolunteers: 10, location: 'Entire Camp' },
    ],
    skipDuplicates: true,
  });

  // Shifts for 2026 (upcoming)
  await prisma.shift.createMany({
    data: [
      { seasonId: season2026.id, name: 'Greeter Shift - Morning', description: 'Welcome arriving campers, provide orientation', date: d('2026-08-31'), startTime: '10:00', endTime: '14:00', maxVolunteers: 3, location: 'Front Entrance' },
      { seasonId: season2026.id, name: 'Kitchen Duty - Lunch', description: 'Prep and serve lunch for camp', date: d('2026-08-31'), startTime: '11:00', endTime: '14:00', maxVolunteers: 4, location: 'Kitchen' },
      { seasonId: season2026.id, name: 'Greeter Shift - Afternoon', description: 'Welcome arriving campers', date: d('2026-08-31'), startTime: '14:00', endTime: '18:00', maxVolunteers: 3, location: 'Front Entrance' },
      { seasonId: season2026.id, name: 'Kitchen Duty - Dinner', description: 'Prep and serve dinner', date: d('2026-09-01'), startTime: '16:00', endTime: '20:00', maxVolunteers: 4, location: 'Kitchen' },
      { seasonId: season2026.id, name: 'Tea Service', description: 'Persian tea service for visitors', date: d('2026-09-02'), startTime: '14:00', endTime: '17:00', maxVolunteers: 2, location: 'Tea Lounge' },
      { seasonId: season2026.id, name: 'MOOP Sweep', description: 'Camp-wide MOOP sweep before departure', date: d('2026-09-07'), startTime: '08:00', endTime: '10:00', maxVolunteers: 15, location: 'Entire Camp' },
    ],
    skipDuplicates: true,
  });

  console.log('  -> 3 build days for 2025, 4 build days for 2026');
  console.log('  -> 5 shifts for 2025, 6 shifts for 2026');

  // ------------------------------------------------------------------
  // 7. ANNOUNCEMENTS
  // ------------------------------------------------------------------
  console.log('[7/10] Creating sample announcements...');

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to Alborz 2026!',
        content: 'We are thrilled to announce that Camp Alborz is returning to Black Rock City for 2026! This year, Burning Man runs from August 30 to September 7. We have exciting plans for new art installations, expanded kitchen operations, and our signature Persian hospitality. Stay tuned for more details on dues, housing, and build week scheduling.',
        authorId: admin.id,
        priority: 'HIGH',
        isPublished: true,
        publishedAt: d('2026-01-15'),
        expiresAt: d('2026-09-15'),
      },
      {
        title: 'Dues Payment Reminder',
        content: 'A friendly reminder that camp dues of $1,200 per person are due by June 1, 2026. This covers your share of infrastructure, power grid, water, food contributions, and camp operations. We accept Venmo, Zelle, and PayPal. Please reach out to the treasurer if you need to arrange a payment plan.',
        authorId: admin.id,
        priority: 'URGENT',
        isPublished: true,
        publishedAt: d('2026-02-01'),
        expiresAt: d('2026-06-15'),
      },
      {
        title: 'Build Week Volunteers Needed',
        content: 'We need dedicated volunteers for build week starting August 24. Build crew members will receive early arrival passes. Tasks include shade structure assembly, kitchen setup, sound system installation, and decoration. If you can arrive early, please update your profile or contact the camp leads.',
        authorId: admin.id,
        priority: 'NORMAL',
        isPublished: true,
        publishedAt: d('2026-02-20'),
        expiresAt: d('2026-08-24'),
      },
      {
        title: '2025 Season Wrap-Up',
        content: 'Thank you to everyone who made Alborz 2025 an incredible experience! We had 78 members participate and received wonderful feedback from our playa neighbors. Financial reports and photo galleries have been shared with confirmed members. Looking forward to making 2026 even better!',
        authorId: admin.id,
        priority: 'LOW',
        isPublished: true,
        publishedAt: d('2025-09-15'),
        expiresAt: null,
      },
      {
        title: 'New Member Orientation - Draft',
        content: 'Draft content for the new member orientation session. Topics: camp culture, radical self-reliance, leave no trace, shift expectations, communal kitchen etiquette, quiet hours, and Persian hospitality traditions.',
        authorId: admin.id,
        priority: 'NORMAL',
        isPublished: false,
        publishedAt: null,
        expiresAt: null,
      },
    ],
    skipDuplicates: true,
  });

  console.log('  -> 5 announcements created (4 published, 1 draft)');

  // ------------------------------------------------------------------
  // 8. MEMBERSHIP APPLICATIONS (various statuses)
  // ------------------------------------------------------------------
  console.log('[8/10] Creating sample applications...');

  await prisma.application.createMany({
    data: [
      {
        name: 'Leila Ahmadi',
        email: 'leila.ahmadi@example.com',
        phone: '(310) 555-1001',
        playaName: 'Laleh',
        referredBy: 'Yasmin Khorasani',
        experience: 'BEEN_BEFORE',
        interests: 'Art, cooking, community building. I have experience with large-scale event coordination.',
        contribution: 'I can lead breakfast service and help with decoration. I am also a graphic designer and can help with camp signage.',
        dietaryRestrictions: null,
        emergencyContactName: 'Maryam Ahmadi',
        emergencyContactPhone: '(310) 555-1002',
        housingPreference: 'Tent, 10x12',
        message: 'I have been wanting to join Camp Alborz for two years. Friends have told me amazing things about the Persian tea service and the sense of community.',
        status: 'ACCEPTED',
        reviewedBy: 'Amir Jalali',
        reviewNotes: 'Strong application. Great referral from Yasmin. Cooking skills are a plus.',
      },
      {
        name: 'Jayson Nguyen',
        email: 'jayson.nguyen@example.com',
        phone: '(415) 555-2001',
        playaName: null,
        referredBy: null,
        experience: 'FIRST_TIMER',
        interests: 'Music, photography, meeting new people',
        contribution: 'I am a professional photographer and would love to document camp life. I also DJ house music.',
        dietaryRestrictions: 'No shellfish',
        emergencyContactName: 'Linda Nguyen',
        emergencyContactPhone: '(415) 555-2002',
        housingPreference: 'Dorm',
        message: 'This will be my first Burning Man! I found Camp Alborz through Instagram and love the Persian aesthetic.',
        status: 'PENDING',
        reviewedBy: null,
        reviewNotes: null,
      },
      {
        name: 'Maria Gonzalez',
        email: 'maria.g@example.com',
        phone: '(213) 555-3001',
        playaName: 'Sol',
        referredBy: 'Marco Costa',
        experience: 'VETERAN',
        interests: 'Sound engineering, event production, yoga instruction',
        contribution: 'I can run the sound system and teach morning yoga sessions. I have my own portable yoga mats.',
        dietaryRestrictions: 'Vegan',
        emergencyContactName: 'Carlos Gonzalez',
        emergencyContactPhone: '(213) 555-3002',
        housingPreference: 'Shiftpod',
        message: 'I have been to 6 burns and spent 3 years with a different camp. Looking for a change and Marco speaks very highly of Alborz.',
        status: 'REVIEWED',
        reviewedBy: 'Amir Jalali',
        reviewNotes: 'Experienced burner. Sound skills very valuable. Need to verify with Marco.',
      },
      {
        name: 'Tom Baker',
        email: 'tombaker88@example.com',
        phone: '(323) 555-4001',
        playaName: null,
        referredBy: null,
        experience: 'FIRST_TIMER',
        interests: 'Partying, nightlife',
        contribution: 'I can bring my own drinks',
        dietaryRestrictions: null,
        emergencyContactName: 'Jane Baker',
        emergencyContactPhone: '(323) 555-4002',
        housingPreference: null,
        message: 'Heard Alborz throws the best parties on the playa.',
        status: 'REJECTED',
        reviewedBy: 'Amir Jalali',
        reviewNotes: 'Application does not demonstrate understanding of camp values or willingness to contribute. No referral.',
      },
      {
        name: 'Kiana Shahbazi',
        email: 'kiana.s@example.com',
        phone: '(510) 555-5001',
        playaName: 'Ki',
        referredBy: 'Bita Mehrjou',
        experience: 'BEEN_BEFORE',
        interests: 'Textile art, Persian calligraphy, community meals',
        contribution: 'I create hand-woven textiles and would love to contribute decorative pieces. Also happy to help with kitchen shifts.',
        dietaryRestrictions: 'Halal',
        emergencyContactName: 'Arash Shahbazi',
        emergencyContactPhone: '(510) 555-5002',
        housingPreference: 'Tent or shared',
        message: 'Bita encouraged me to apply. I have been dreaming of bringing my loom to the playa!',
        status: 'WAITLISTED',
        reviewedBy: 'Amir Jalali',
        reviewNotes: 'Wonderful application. Camp is near capacity for 2026 but she is top of waitlist.',
      },
      {
        name: 'Daniel Park',
        email: 'danielpark@example.com',
        phone: '(650) 555-6001',
        playaName: 'Sparky',
        referredBy: 'Alex Petrosyan',
        experience: 'VETERAN',
        interests: 'Electrical engineering, LED installations, fire art',
        contribution: 'I can wire LED installations and help maintain the power grid. Certified electrician.',
        dietaryRestrictions: null,
        emergencyContactName: 'Jenny Park',
        emergencyContactPhone: '(650) 555-6002',
        housingPreference: 'RV - 24ft',
        message: 'Alex and I have camped together before. I specialize in LED art and can bring my latest interactive installation.',
        status: 'PENDING',
        reviewedBy: null,
        reviewNotes: null,
      },
    ],
    skipDuplicates: true,
  });

  console.log('  -> 6 applications (1 accepted, 1 rejected, 1 reviewed, 1 waitlisted, 2 pending)');

  // ------------------------------------------------------------------
  // 9. CAMP RESOURCES (Inventory + Budget + Expenses)
  // ------------------------------------------------------------------
  console.log('[9/10] Creating camp resources...');

  // Inventory items
  await prisma.inventoryItem.createMany({
    data: [
      { category: 'SHADE', name: 'Main Shade Structure', description: 'Large 40x60 shade canopy for communal area', quantity: 1, dimensions: '40x60', condition: 'Good', storageLocation: 'Container A' },
      { category: 'SHADE', name: 'Kitchen Shade', description: 'Kitchen-specific shade canopy', quantity: 1, dimensions: '20x20', condition: 'Good', storageLocation: 'Container A' },
      { category: 'CONTAINER', name: 'Storage Container A', description: 'Primary camp storage - shade, kitchen, infrastructure', quantity: 1, dimensions: '20ft', condition: 'Good', storageLocation: 'Sparks, NV' },
      { category: 'CONTAINER', name: 'Storage Container B', description: 'Secondary storage - decor, sound, misc', quantity: 1, dimensions: '20ft', condition: 'Good', storageLocation: 'Sparks, NV' },
      { category: 'GENERATOR', name: 'Main Generator', description: 'Camp power generator', quantity: 1, dimensions: null, condition: 'Needs maintenance', storageLocation: 'Container B' },
      { category: 'KITCHEN', name: 'Commercial Burner Set', description: 'Propane burner system for camp kitchen', quantity: 2, condition: 'Good', storageLocation: 'Container A' },
      { category: 'KITCHEN', name: 'Camp Coolers', description: 'Large coolers for food storage', quantity: 6, condition: 'Fair', storageLocation: 'Container A' },
      { category: 'RUG', name: 'Persian Rugs - Large', description: 'Decorative Persian rugs for communal spaces', quantity: 8, dimensions: '8x10', condition: 'Good', storageLocation: 'Container B' },
      { category: 'RUG', name: 'Persian Rugs - Small', description: 'Smaller rugs for tent entrances', quantity: 15, dimensions: '4x6', condition: 'Fair', storageLocation: 'Container B' },
      { category: 'AC_UNIT', name: 'Portable AC Unit', description: 'Portable AC for dorm/common areas', quantity: 4, condition: 'Good', storageLocation: 'Container A' },
      { category: 'MATTRESS', name: 'Twin Mattress', description: 'Mattress for dorm sleeping', quantity: 12, condition: 'Good', storageLocation: 'Container B' },
      { category: 'COT', name: 'Camping Cot', description: 'Folding cot for tent campers', quantity: 8, condition: 'Good', storageLocation: 'Container B' },
      { category: 'BIKE', name: 'Camp Bikes', description: 'Shared camp bicycles', quantity: 10, condition: 'Fair - 2 need tire repair', storageLocation: 'Container B' },
    ],
    skipDuplicates: true,
  });

  // Budget lines for 2026
  await prisma.budgetLine.createMany({
    data: [
      { seasonId: season2026.id, category: 'GENERATOR', estimatedAmount: cents(3500), description: 'Generator rental and fuel' },
      { seasonId: season2026.id, category: 'FUEL', estimatedAmount: cents(2000), description: 'Generator fuel for the week' },
      { seasonId: season2026.id, category: 'STORAGE', estimatedAmount: cents(4800), description: 'Annual container storage in Sparks, NV' },
      { seasonId: season2026.id, category: 'TRUCKS', estimatedAmount: cents(6000), description: 'Truck rental for transport to/from playa' },
      { seasonId: season2026.id, category: 'SOUND', estimatedAmount: cents(2500), description: 'Sound system rental and DJ booth' },
      { seasonId: season2026.id, category: 'FOOD', estimatedAmount: cents(20000), description: 'Communal meals for ~130 members, 8 days' },
      { seasonId: season2026.id, category: 'CONTAINERS', estimatedAmount: cents(1200), description: 'Container maintenance and transport' },
      { seasonId: season2026.id, category: 'BATHROOMS', estimatedAmount: cents(3000), description: 'Portable toilet rental' },
      { seasonId: season2026.id, category: 'WATER', estimatedAmount: cents(7000), description: 'Drinking water delivery' },
      { seasonId: season2026.id, category: 'GREY_WATER', estimatedAmount: cents(6000), description: 'Grey water service' },
      { seasonId: season2026.id, category: 'SHOWERS', estimatedAmount: cents(4000), description: 'Shower trailer rental' },
      { seasonId: season2026.id, category: 'DECORATION', estimatedAmount: cents(1500), description: 'Camp decor, lighting, and signage' },
      { seasonId: season2026.id, category: 'TRASH', estimatedAmount: cents(800), description: 'Trash bags, disposal, MOOP supplies' },
      { seasonId: season2026.id, category: 'INFRASTRUCTURE', estimatedAmount: cents(15000), description: 'Shade structures, construction labor' },
      { seasonId: season2026.id, category: 'MISC', estimatedAmount: cents(3000), description: 'Contingency and miscellaneous' },
    ],
    skipDuplicates: true,
  });

  // Sample expenses for 2025 (a few representative ones)
  await prisma.expense.createMany({
    data: [
      { seasonId: season2025.id, description: 'USS - United Site Services', amount: cents(6083.80), paidBy: 'ALBORZ', date: d('2025-04-22'), category: 'UTILITIES', needsReimbursement: false, notes: 'Grey water and RV dumps' },
      { seasonId: season2025.id, description: 'Ecozoic Payment 1', amount: cents(3930), paidBy: 'ALBORZ', date: d('2025-05-23'), category: 'INFRASTRUCTURE', needsReimbursement: false },
      { seasonId: season2025.id, description: 'Payment to Peik Construction', amount: cents(10000), paidBy: 'ALBORZ', date: d('2025-06-23'), category: 'CONSTRUCTION', needsReimbursement: false, notes: 'Paid via ACH' },
      { seasonId: season2025.id, description: 'CES Payment 1 - Power', amount: cents(16207), paidBy: 'ALBORZ', date: d('2025-08-06'), category: 'UTILITIES', needsReimbursement: false, notes: 'First half of power grid' },
      { seasonId: season2025.id, description: 'Sierra Site Services - Water', amount: cents(6900), paidBy: 'ALBORZ', date: d('2025-08-12'), category: 'UTILITIES', needsReimbursement: false, notes: 'Drinking water delivery' },
      { seasonId: season2025.id, description: 'Bobby - Food Service', amount: cents(20000), paidBy: 'ALBORZ', date: d('2025-08-10'), category: 'FOOD', needsReimbursement: false, notes: 'Combined food service payments' },
      { seasonId: season2025.id, description: 'Costco - Build Week Supplies', amount: cents(754.57), paidBy: 'Amir Jalali', date: d('2025-08-18'), category: 'FOOD', needsReimbursement: true, notes: 'Build week food and drinks' },
      { seasonId: season2025.id, description: 'Misc Purchases', amount: cents(682), paidBy: 'Bita Mehrjou', date: d('2025-08-17'), category: 'SUPPLIES', needsReimbursement: true, reimbursed: true, reimbursedAt: d('2025-09-06'), notes: 'Reimbursed via Zelle' },
    ],
    skipDuplicates: true,
  });

  console.log('  -> 13 inventory items');
  console.log('  -> 15 budget lines for 2026');
  console.log('  -> 8 expenses for 2025');

  // ------------------------------------------------------------------
  // 10. AUDIT LOG ENTRIES
  // ------------------------------------------------------------------
  console.log('[10/10] Creating audit log entries...');

  await prisma.auditLog.createMany({
    data: [
      {
        memberId: admin.id,
        action: 'SEASON_CREATED',
        entityType: 'Season',
        entityId: season2026.id,
        details: { year: 2026, name: 'Alborz 2026' },
      },
      {
        memberId: admin.id,
        action: 'MEMBER_ENROLLED',
        entityType: 'SeasonMember',
        entityId: seasonMembers2026['admin@campalborz.org'],
        details: { season: 2026, status: 'CONFIRMED' },
      },
      {
        memberId: admin.id,
        action: 'APPLICATION_REVIEWED',
        entityType: 'Application',
        entityId: 'seed-app-review',
        details: { applicant: 'Tom Baker', decision: 'REJECTED' },
      },
      {
        memberId: admin.id,
        action: 'APPLICATION_REVIEWED',
        entityType: 'Application',
        entityId: 'seed-app-accept',
        details: { applicant: 'Leila Ahmadi', decision: 'ACCEPTED' },
      },
      {
        memberId: admin.id,
        action: 'ANNOUNCEMENT_PUBLISHED',
        entityType: 'Announcement',
        entityId: 'seed-announcement',
        details: { title: 'Welcome to Alborz 2026!' },
      },
    ],
    skipDuplicates: true,
  });

  console.log('  -> 5 audit log entries');

  // ------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------
  const counts = {
    members: await prisma.member.count(),
    seasons: await prisma.season.count(),
    seasonMembers: await prisma.seasonMember.count(),
    buildDays: await prisma.buildDay.count(),
    shifts: await prisma.shift.count(),
    announcements: await prisma.announcement.count(),
    applications: await prisma.application.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    budgetLines: await prisma.budgetLine.count(),
    expenses: await prisma.expense.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log('\n========================================');
  console.log(' SEED COMPLETE - Summary');
  console.log('========================================');
  console.log(`  Members:          ${counts.members}`);
  console.log(`  Seasons:          ${counts.seasons}`);
  console.log(`  Season Members:   ${counts.seasonMembers}`);
  console.log(`  Build Days:       ${counts.buildDays}`);
  console.log(`  Shifts:           ${counts.shifts}`);
  console.log(`  Announcements:    ${counts.announcements}`);
  console.log(`  Applications:     ${counts.applications}`);
  console.log(`  Inventory Items:  ${counts.inventoryItems}`);
  console.log(`  Budget Lines:     ${counts.budgetLines}`);
  console.log(`  Expenses:         ${counts.expenses}`);
  console.log(`  Audit Logs:       ${counts.auditLogs}`);
  console.log('========================================');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:   admin@campalborz.org / admin123');
  console.log('  Members: <name>@campalborz.org / member123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
