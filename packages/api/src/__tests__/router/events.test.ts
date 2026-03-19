/**
 * Tests for the events tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  season: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  shift: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  seasonMember: {
    findUnique: jest.fn(),
  },
  shiftAssignment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { eventsRouter } from '../../router/events';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ events: eventsRouter });
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: mockPrisma as any,
    user: user,
  });
}

// Reusable test users
const memberUser = {
  id: 'member-1',
  email: 'member@example.com',
  name: 'Test Member',
  role: 'MEMBER',
};

const managerUser = {
  id: 'manager-1',
  email: 'manager@example.com',
  name: 'Test Manager',
  role: 'MANAGER',
};

const leadUser = {
  id: 'lead-1',
  email: 'lead@example.com',
  name: 'Test Lead',
  role: 'LEAD',
};

// Valid UUIDs for tests
const validUUID1 = '550e8400-e29b-41d4-a716-446655440000';
const validUUID2 = '550e8400-e29b-41d4-a716-446655440001';
const validUUID3 = '550e8400-e29b-41d4-a716-446655440002';

describe('eventsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated events with defaults using active season', async () => {
      const mockActiveSeason = { id: validUUID1 };
      const mockEvents = [
        {
          id: 'event-1',
          seasonId: validUUID1,
          name: 'Kitchen Shift',
          description: 'Cook dinner',
          date: new Date('2025-08-25'),
          startTime: '18:00',
          endTime: '20:00',
          maxVolunteers: 5,
          location: 'Camp Kitchen',
          createdAt: new Date('2025-01-01'),
          _count: { assignments: 2 },
          assignments: [
            {
              id: 'assign-1',
              status: 'CONFIRMED',
              seasonMember: { member: { id: 'm-1', name: 'Alice', playaName: 'Spark' } },
            },
          ],
        },
      ];

      mockPrisma.season.findFirst.mockResolvedValue(mockActiveSeason);
      mockPrisma.shift.findMany.mockResolvedValue(mockEvents);
      mockPrisma.shift.count.mockResolvedValue(1);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.list();

      expect(result.events).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.events[0].name).toBe('Kitchen Shift');
      expect(result.events[0].volunteerCount).toBe(2);
      expect(result.events[0].isFull).toBe(false);
      expect(result.events[0].volunteers).toHaveLength(1);
      expect(result.events[0].volunteers[0].memberName).toBe('Alice');

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        })
      );
    });

    it('should throw NOT_FOUND when no active season and no seasonId provided', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(caller.events.list()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should use provided seasonId instead of looking up active season', async () => {
      mockPrisma.shift.findMany.mockResolvedValue([]);
      mockPrisma.shift.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.events.list({ seasonId: validUUID1 });

      expect(mockPrisma.season.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ seasonId: validUUID1 }),
        })
      );
    });

    it('should filter by upcoming events only', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.findMany.mockResolvedValue([]);
      mockPrisma.shift.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.events.list({ upcoming: true });

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: { gte: expect.any(Date) },
          }),
        })
      );
    });

    it('should filter by search term across name, description, and location', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.findMany.mockResolvedValue([]);
      mockPrisma.shift.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.events.list({ search: 'kitchen' });

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'kitchen', mode: 'insensitive' } },
              { description: { contains: 'kitchen', mode: 'insensitive' } },
              { location: { contains: 'kitchen', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should respect custom limit and offset', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.findMany.mockResolvedValue([]);
      mockPrisma.shift.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.events.list({ limit: 10, offset: 20 });

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 })
      );
    });

    it('should mark event as full when assignments reach maxVolunteers', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.findMany.mockResolvedValue([
        {
          id: 'event-full',
          seasonId: validUUID1,
          name: 'Full Shift',
          description: null,
          date: new Date('2025-08-25'),
          startTime: '10:00',
          endTime: '12:00',
          maxVolunteers: 2,
          location: null,
          createdAt: new Date(),
          _count: { assignments: 2 },
          assignments: [],
        },
      ]);
      mockPrisma.shift.count.mockResolvedValue(1);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.list();

      expect(result.events[0].isFull).toBe(true);
    });

    it('should return isFull as false when maxVolunteers is null', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.findMany.mockResolvedValue([
        {
          id: 'event-unlimited',
          seasonId: validUUID1,
          name: 'Unlimited Shift',
          description: null,
          date: new Date('2025-08-25'),
          startTime: '10:00',
          endTime: '12:00',
          maxVolunteers: null,
          location: null,
          createdAt: new Date(),
          _count: { assignments: 50 },
          assignments: [],
        },
      ]);
      mockPrisma.shift.count.mockResolvedValue(1);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.list();

      expect(result.events[0].isFull).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.events.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // getById
  // ----------------------------------------------------------------
  describe('getById', () => {
    it('should return event with full details when found', async () => {
      const mockEvent = {
        id: validUUID1,
        seasonId: validUUID2,
        name: 'Kitchen Shift',
        description: 'Cook dinner',
        date: new Date('2025-08-25'),
        startTime: '18:00',
        endTime: '20:00',
        maxVolunteers: 5,
        location: 'Camp Kitchen',
        createdAt: new Date('2025-01-01'),
        season: { id: validUUID2, year: 2025, name: '2025' },
        _count: { assignments: 1 },
        assignments: [
          {
            id: 'assign-1',
            seasonMemberId: 'sm-1',
            status: 'CONFIRMED',
            seasonMember: {
              member: { id: 'm-1', name: 'Alice', playaName: 'Spark', email: 'alice@test.com' },
            },
          },
        ],
      };

      mockPrisma.shift.findUnique.mockResolvedValue(mockEvent);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.getById({ id: validUUID1 });

      expect(result.id).toBe(validUUID1);
      expect(result.name).toBe('Kitchen Shift');
      expect(result.season).toEqual({ id: validUUID2, year: 2025, name: '2025' });
      expect(result.volunteers).toHaveLength(1);
      expect(result.volunteers[0].email).toBe('alice@test.com');
      expect(result.volunteers[0].seasonMemberId).toBe('sm-1');
      expect(result.isFull).toBe(false);
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.getById({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject invalid UUID', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.getById({ id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.getById({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // listUpcoming
  // ----------------------------------------------------------------
  describe('listUpcoming', () => {
    it('should return upcoming events for the active season', async () => {
      const mockActiveSeason = { id: validUUID1, year: 2025, name: '2025' };
      const mockEvents = [
        {
          id: 'event-1',
          name: 'Gate Shift',
          description: 'Welcome duty',
          date: new Date('2025-08-28'),
          startTime: '08:00',
          endTime: '12:00',
          location: 'Main Gate',
          maxVolunteers: 4,
          _count: { assignments: 2 },
        },
      ];

      mockPrisma.season.findFirst.mockResolvedValue(mockActiveSeason);
      mockPrisma.shift.findMany.mockResolvedValue(mockEvents);

      const caller = createTestCaller(); // public procedure - no auth needed
      const result = await caller.events.listUpcoming();

      expect(result.seasonName).toBe('2025');
      expect(result.events).toHaveLength(1);
      expect(result.events[0].spotsAvailable).toBe(2); // 4 max - 2 assigned
      expect(result.events[0].name).toBe('Gate Shift');
    });

    it('should return empty events when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller();
      const result = await caller.events.listUpcoming();

      expect(result.events).toEqual([]);
      expect(result.seasonName).toBeNull();
      expect(mockPrisma.shift.findMany).not.toHaveBeenCalled();
    });

    it('should return null spotsAvailable when maxVolunteers is null', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1, year: 2025, name: '2025' });
      mockPrisma.shift.findMany.mockResolvedValue([
        {
          id: 'event-1',
          name: 'Open Event',
          description: null,
          date: new Date('2025-08-28'),
          startTime: '08:00',
          endTime: '12:00',
          location: null,
          maxVolunteers: null,
          _count: { assignments: 10 },
        },
      ]);

      const caller = createTestCaller();
      const result = await caller.events.listUpcoming();

      expect(result.events[0].spotsAvailable).toBeNull();
    });

    it('should return 0 spotsAvailable when event is full', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1, year: 2025, name: '2025' });
      mockPrisma.shift.findMany.mockResolvedValue([
        {
          id: 'event-1',
          name: 'Full Event',
          description: null,
          date: new Date('2025-08-28'),
          startTime: '08:00',
          endTime: '12:00',
          location: null,
          maxVolunteers: 3,
          _count: { assignments: 5 },
        },
      ]);

      const caller = createTestCaller();
      const result = await caller.events.listUpcoming();

      expect(result.events[0].spotsAvailable).toBe(0);
    });

    it('should respect custom limit', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1, year: 2025, name: '2025' });
      mockPrisma.shift.findMany.mockResolvedValue([]);

      const caller = createTestCaller();
      await caller.events.listUpcoming({ limit: 5 });

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    it('should filter for future events only', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1, year: 2025, name: '2025' });
      mockPrisma.shift.findMany.mockResolvedValue([]);

      const caller = createTestCaller();
      await caller.events.listUpcoming();

      expect(mockPrisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: { gte: expect.any(Date) },
          }),
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    const validCreateInput = {
      seasonId: validUUID1,
      name: 'Kitchen Duty',
      description: 'Prepare dinner for camp',
      date: '2025-08-25T00:00:00.000Z',
      startTime: '18:00',
      endTime: '20:00',
      maxVolunteers: 5,
      location: 'Camp Kitchen',
    };

    it('should create an event with valid data', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID1, name: '2025' });
      mockPrisma.shift.create.mockResolvedValue({
        id: 'new-event',
        ...validCreateInput,
        date: new Date(validCreateInput.date),
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.events.create(validCreateInput);

      expect(result.id).toBe('new-event');
      expect(mockPrisma.season.findUnique).toHaveBeenCalledWith({
        where: { id: validUUID1 },
        select: { id: true, name: true },
      });
      expect(mockPrisma.shift.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          seasonId: validUUID1,
          name: 'Kitchen Duty',
          date: expect.any(Date),
          startTime: '18:00',
          endTime: '20:00',
        }),
      });
    });

    it('should throw NOT_FOUND when season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.create(validCreateInput)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject invalid time format', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.create({ ...validCreateInput, startTime: '25:00' })
      ).rejects.toThrow();
    });

    it('should reject missing name', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.create({ ...validCreateInput, name: '' })
      ).rejects.toThrow();
    });

    it('should reject invalid seasonId format', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.create({ ...validCreateInput, seasonId: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.create(validCreateInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.create(validCreateInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.create(validCreateInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // update
  // ----------------------------------------------------------------
  describe('update', () => {
    it('should update event with valid changes', async () => {
      const existingEvent = { id: validUUID1, name: 'Old Name' };
      const updatedEvent = { id: validUUID1, name: 'New Name', location: 'New Location' };

      mockPrisma.shift.findUnique.mockResolvedValue(existingEvent);
      mockPrisma.shift.update.mockResolvedValue(updatedEvent);

      const caller = createTestCaller(leadUser);
      const result = await caller.events.update({
        id: validUUID1,
        name: 'New Name',
        location: 'New Location',
      });

      expect(result.name).toBe('New Name');
      expect(mockPrisma.shift.update).toHaveBeenCalledWith({
        where: { id: validUUID1 },
        data: expect.objectContaining({ name: 'New Name', location: 'New Location' }),
      });
    });

    it('should convert date string to Date object when date is provided', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({ id: validUUID1 });
      mockPrisma.shift.update.mockResolvedValue({ id: validUUID1 });

      const caller = createTestCaller(leadUser);
      await caller.events.update({
        id: validUUID1,
        date: '2025-09-01T00:00:00.000Z',
      });

      expect(mockPrisma.shift.update).toHaveBeenCalledWith({
        where: { id: validUUID1 },
        data: expect.objectContaining({ date: expect.any(Date) }),
      });
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.update({ id: validUUID1, name: 'Updated' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.update({ id: validUUID1, name: 'Updated' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.update({ id: validUUID1, name: 'Updated' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // delete
  // ----------------------------------------------------------------
  describe('delete', () => {
    it('should delete event successfully', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Kitchen Shift',
        _count: { assignments: 0 },
      });
      mockPrisma.shift.delete.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.events.delete({ id: validUUID1 });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.shift.delete).toHaveBeenCalledWith({
        where: { id: validUUID1 },
      });
    });

    it('should still delete event with existing assignments (with warning)', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Busy Shift',
        _count: { assignments: 3 },
      });
      mockPrisma.shift.delete.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.events.delete({ id: validUUID1 });

      expect(result).toEqual({ success: true });
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.events.delete({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.delete({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.delete({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.delete({ id: validUUID1 })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // rsvp
  // ----------------------------------------------------------------
  describe('rsvp', () => {
    it('should add RSVP for member successfully', async () => {
      const mockEvent = {
        id: validUUID1,
        name: 'Kitchen Shift',
        seasonId: validUUID2,
        maxVolunteers: 5,
        _count: { assignments: 2 },
      };
      const mockSeasonMember = { id: 'sm-1' };
      const mockAssignment = {
        id: 'assign-new',
        shiftId: validUUID1,
        seasonMemberId: 'sm-1',
        status: 'CONFIRMED',
      };

      mockPrisma.shift.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSeasonMember);
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null); // no existing
      mockPrisma.shiftAssignment.create.mockResolvedValue(mockAssignment);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.rsvp({ shiftId: validUUID1 });

      expect(result.assignment).toEqual(mockAssignment);
      expect(result.eventName).toBe('Kitchen Shift');
      expect(mockPrisma.shiftAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shiftId: validUUID1,
          seasonMemberId: 'sm-1',
          status: 'CONFIRMED',
        }),
      });
    });

    it('should include notes when provided', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);
      mockPrisma.shiftAssignment.create.mockResolvedValue({ id: 'assign-new' });

      const caller = createTestCaller(memberUser);
      await caller.events.rsvp({ shiftId: validUUID1, notes: 'Arriving late' });

      expect(mockPrisma.shiftAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notes: 'Arriving late',
        }),
      });
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.rsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST when event is full', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Full Event',
        seasonId: validUUID2,
        maxVolunteers: 2,
        _count: { assignments: 2 },
      });

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.rsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST when user is not enrolled in the season', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.rsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw CONFLICT when already signed up', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: 'existing-assign' });

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.rsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.rsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // cancelRsvp
  // ----------------------------------------------------------------
  describe('cancelRsvp', () => {
    it('should cancel RSVP successfully', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: 'assign-1' });
      mockPrisma.shiftAssignment.delete.mockResolvedValue({});

      const caller = createTestCaller(memberUser);
      const result = await caller.events.cancelRsvp({ shiftId: validUUID1 });

      expect(result).toEqual({ success: true, eventName: 'Shift' });
      expect(mockPrisma.shiftAssignment.delete).toHaveBeenCalledWith({
        where: { id: 'assign-1' },
      });
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.cancelRsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST when user is not enrolled in season', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.cancelRsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND when not signed up for the event', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        seasonId: validUUID2,
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.cancelRsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.cancelRsvp({ shiftId: validUUID1 })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // assignVolunteer
  // ----------------------------------------------------------------
  describe('assignVolunteer', () => {
    it('should assign a volunteer to an event', async () => {
      const mockEvent = {
        id: validUUID1,
        name: 'Kitchen Shift',
        maxVolunteers: 5,
        _count: { assignments: 2 },
      };
      const mockSeasonMember = {
        id: validUUID2,
        member: { name: 'Alice', email: 'alice@test.com' },
      };
      const mockAssignment = {
        id: 'assign-new',
        shiftId: validUUID1,
        seasonMemberId: validUUID2,
        status: 'ASSIGNED',
      };

      mockPrisma.shift.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSeasonMember);
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);
      mockPrisma.shiftAssignment.create.mockResolvedValue(mockAssignment);

      const caller = createTestCaller(managerUser);
      const result = await caller.events.assignVolunteer({
        shiftId: validUUID1,
        seasonMemberId: validUUID2,
      });

      expect(result).toEqual(mockAssignment);
      expect(mockPrisma.shiftAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
          status: 'ASSIGNED',
        }),
      });
    });

    it('should throw NOT_FOUND when event does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.assignVolunteer({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw NOT_FOUND when season member does not exist', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.assignVolunteer({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw CONFLICT when member is already assigned', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: validUUID2,
        member: { name: 'Alice', email: 'alice@test.com' },
      });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: 'existing' });

      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.assignVolunteer({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.assignVolunteer({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.assignVolunteer({
          shiftId: validUUID1,
          seasonMemberId: validUUID2,
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.shift.findUnique.mockResolvedValue({
        id: validUUID1,
        name: 'Shift',
        maxVolunteers: null,
        _count: { assignments: 0 },
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: validUUID2,
        member: { name: 'Alice', email: 'alice@test.com' },
      });
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);
      mockPrisma.shiftAssignment.create.mockResolvedValue({ id: 'assign-new' });

      const caller = createTestCaller(leadUser);
      const result = await caller.events.assignVolunteer({
        shiftId: validUUID1,
        seasonMemberId: validUUID2,
      });

      expect(result.id).toBe('assign-new');
    });
  });

  // ----------------------------------------------------------------
  // removeVolunteer
  // ----------------------------------------------------------------
  describe('removeVolunteer', () => {
    it('should remove volunteer assignment successfully', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({
        id: validUUID1,
        shift: { name: 'Kitchen Shift' },
        seasonMember: { member: { name: 'Alice' } },
      });
      mockPrisma.shiftAssignment.delete.mockResolvedValue({});

      const caller = createTestCaller(managerUser);
      const result = await caller.events.removeVolunteer({ assignmentId: validUUID1 });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.shiftAssignment.delete).toHaveBeenCalledWith({
        where: { id: validUUID1 },
      });
    });

    it('should throw NOT_FOUND when assignment does not exist', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.removeVolunteer({ assignmentId: validUUID1 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.removeVolunteer({ assignmentId: validUUID1 })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.removeVolunteer({ assignmentId: validUUID1 })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // updateAssignmentStatus
  // ----------------------------------------------------------------
  describe('updateAssignmentStatus', () => {
    it('should update assignment status to COMPLETED', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: validUUID1, status: 'CONFIRMED' });
      mockPrisma.shiftAssignment.update.mockResolvedValue({ id: validUUID1, status: 'COMPLETED' });

      const caller = createTestCaller(managerUser);
      const result = await caller.events.updateAssignmentStatus({
        assignmentId: validUUID1,
        status: 'COMPLETED',
      });

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.shiftAssignment.update).toHaveBeenCalledWith({
        where: { id: validUUID1 },
        data: { status: 'COMPLETED' },
      });
    });

    it('should update assignment status to NO_SHOW', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: validUUID1, status: 'CONFIRMED' });
      mockPrisma.shiftAssignment.update.mockResolvedValue({ id: validUUID1, status: 'NO_SHOW' });

      const caller = createTestCaller(managerUser);
      const result = await caller.events.updateAssignmentStatus({
        assignmentId: validUUID1,
        status: 'NO_SHOW',
      });

      expect(result.status).toBe('NO_SHOW');
    });

    it('should update assignment status to ASSIGNED', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue({ id: validUUID1, status: 'CONFIRMED' });
      mockPrisma.shiftAssignment.update.mockResolvedValue({ id: validUUID1, status: 'ASSIGNED' });

      const caller = createTestCaller(managerUser);
      const result = await caller.events.updateAssignmentStatus({
        assignmentId: validUUID1,
        status: 'ASSIGNED',
      });

      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw NOT_FOUND when assignment does not exist', async () => {
      mockPrisma.shiftAssignment.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.updateAssignmentStatus({
          assignmentId: validUUID1,
          status: 'COMPLETED',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject invalid status', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.events.updateAssignmentStatus({
          assignmentId: validUUID1,
          status: 'INVALID_STATUS' as any,
        })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.events.updateAssignmentStatus({
          assignmentId: validUUID1,
          status: 'COMPLETED',
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.events.updateAssignmentStatus({
          assignmentId: validUUID1,
          status: 'COMPLETED',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // getMyEvents
  // ----------------------------------------------------------------
  describe('getMyEvents', () => {
    it('should return events the authenticated user is signed up for', async () => {
      const mockActiveSeason = { id: validUUID1 };
      const mockSeasonMember = { id: 'sm-1' };
      const mockAssignments = [
        {
          id: 'assign-1',
          status: 'CONFIRMED',
          notes: 'Will bring extra supplies',
          shift: {
            id: 'event-1',
            name: 'Kitchen Shift',
            description: 'Cook dinner',
            date: new Date('2025-08-25'),
            startTime: '18:00',
            endTime: '20:00',
            location: 'Camp Kitchen',
          },
        },
      ];

      mockPrisma.season.findFirst.mockResolvedValue(mockActiveSeason);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSeasonMember);
      mockPrisma.shiftAssignment.findMany.mockResolvedValue(mockAssignments);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.getMyEvents();

      expect(result).toHaveLength(1);
      expect(result[0].assignmentId).toBe('assign-1');
      expect(result[0].status).toBe('CONFIRMED');
      expect(result[0].notes).toBe('Will bring extra supplies');
      expect(result[0].event.name).toBe('Kitchen Shift');
    });

    it('should return empty array when no active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.getMyEvents();

      expect(result).toEqual([]);
      expect(mockPrisma.seasonMember.findUnique).not.toHaveBeenCalled();
    });

    it('should return empty array when user is not enrolled in the active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.getMyEvents();

      expect(result).toEqual([]);
      expect(mockPrisma.shiftAssignment.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no assignments', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: validUUID1 });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.shiftAssignment.findMany.mockResolvedValue([]);

      const caller = createTestCaller(memberUser);
      const result = await caller.events.getMyEvents();

      expect(result).toEqual([]);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.events.getMyEvents()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
