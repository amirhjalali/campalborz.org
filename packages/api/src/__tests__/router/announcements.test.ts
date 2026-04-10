/**
 * Tests for the announcements tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma and external services mocked to avoid database/network access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  announcement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

// Mock logger to suppress console output in tests
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    security: jest.fn(),
  },
}));

// Mock socket (notifyAll)
jest.mock('../../lib/socket', () => ({
  notifyAll: jest.fn(),
}));

import { announcementsRouter } from '../../router/announcements';
import { router } from '../../trpc';
import { notifyAll } from '../../lib/socket';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ announcements: announcementsRouter });
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: mockPrisma as any,
    user: user,
  });
}

// Reusable test users
const leadUser = {
  id: 'lead-1',
  email: 'lead@example.com',
  name: 'Test Lead',
  role: 'LEAD',
};

const managerUser = {
  id: 'manager-1',
  email: 'manager@example.com',
  name: 'Test Manager',
  role: 'MANAGER',
};

const memberUser = {
  id: 'member-1',
  email: 'member@example.com',
  name: 'Test Member',
  role: 'MEMBER',
};

describe('announcementsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list (member+ only)
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated announcements with defaults', async () => {
      const mockAnnouncements = [
        {
          id: 'ann-1',
          title: 'Test Announcement',
          content: 'Some content',
          priority: 'NORMAL',
          isPublished: true,
          expiresAt: null,
          createdAt: new Date('2025-06-01'),
          author: { id: 'lead-1', name: 'Test Lead', playaName: 'Dusty' },
        },
      ];

      mockPrisma.announcement.findMany.mockResolvedValue(mockAnnouncements);
      mockPrisma.announcement.count.mockResolvedValue(1);

      const caller = createTestCaller(memberUser);
      const result = await caller.announcements.list();

      expect(result.announcements).toEqual(mockAnnouncements);
      expect(result.total).toBe(1);
      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should filter out unpublished announcements for regular members', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.announcements.list();

      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
          }),
        })
      );
    });

    it('should filter out expired announcements for regular members', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.announcements.list();

      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: expect.any(Date) } },
            ],
          }),
        })
      );
    });

    it('should allow managers to include unpublished announcements', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.announcements.list({ includeUnpublished: true });

      const callArgs = mockPrisma.announcement.findMany.mock.calls[0][0];
      expect(callArgs.where.isPublished).toBeUndefined();
    });

    it('should allow leads to include expired announcements', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      await caller.announcements.list({ includeExpired: true });

      const callArgs = mockPrisma.announcement.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeUndefined();
    });

    it('should support custom pagination', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      const caller = createTestCaller(memberUser);
      await caller.announcements.list({ limit: 10, offset: 20 });

      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.announcements.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // getById (member+ only)
  // ----------------------------------------------------------------
  describe('getById', () => {
    const annId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return an announcement by ID', async () => {
      const mockAnnouncement = {
        id: annId,
        title: 'Test Announcement',
        content: 'Some content',
        priority: 'NORMAL',
        isPublished: true,
        expiresAt: null,
        createdAt: new Date(),
        author: { id: 'lead-1', name: 'Test Lead', playaName: 'Dusty' },
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

      const caller = createTestCaller(memberUser);
      const result = await caller.announcements.getById({ id: annId });

      expect(result).toEqual(mockAnnouncement);
      expect(mockPrisma.announcement.findUnique).toHaveBeenCalledWith({
        where: { id: annId },
        include: {
          author: { select: { id: true, name: true, playaName: true } },
        },
      });
    });

    it('should throw NOT_FOUND for non-existent announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.announcements.getById({ id: annId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw NOT_FOUND for unpublished announcement when accessed by regular member', async () => {
      const unpublishedAnn = {
        id: annId,
        title: 'Draft Announcement',
        content: 'Draft content',
        priority: 'NORMAL',
        isPublished: false,
        expiresAt: null,
        createdAt: new Date(),
        author: { id: 'lead-1', name: 'Test Lead', playaName: 'Dusty' },
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(unpublishedAnn);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.announcements.getById({ id: annId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should allow managers to see unpublished announcements', async () => {
      const unpublishedAnn = {
        id: annId,
        title: 'Draft Announcement',
        content: 'Draft content',
        priority: 'NORMAL',
        isPublished: false,
        expiresAt: null,
        createdAt: new Date(),
        author: { id: 'lead-1', name: 'Test Lead', playaName: 'Dusty' },
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(unpublishedAnn);

      const caller = createTestCaller(managerUser);
      const result = await caller.announcements.getById({ id: annId });

      expect(result.isPublished).toBe(false);
    });

    it('should reject invalid UUID', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.announcements.getById({ id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.announcements.getById({ id: annId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // create (lead only)
  // ----------------------------------------------------------------
  describe('create', () => {
    const validInput = {
      title: 'Important Update',
      content: 'This is an important announcement for all camp members.',
    };

    it('should create a published announcement with valid data', async () => {
      const mockCreated = {
        id: 'ann-new',
        ...validInput,
        authorId: leadUser.id,
        priority: 'NORMAL',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: null,
        createdAt: new Date(),
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      };

      mockPrisma.announcement.create.mockResolvedValue(mockCreated);

      const caller = createTestCaller(leadUser);
      const result = await caller.announcements.create(validInput);

      expect(result.id).toBe('ann-new');
      expect(result.isPublished).toBe(true);
      expect(mockPrisma.announcement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: validInput.title,
          content: validInput.content,
          authorId: leadUser.id,
          priority: 'NORMAL',
          isPublished: true,
          publishedAt: expect.any(Date),
          expiresAt: null,
        }),
        include: {
          author: { select: { id: true, name: true, playaName: true } },
        },
      });
    });

    it('should send notification when publishing', async () => {
      const mockCreated = {
        id: 'ann-new',
        ...validInput,
        authorId: leadUser.id,
        priority: 'NORMAL',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: null,
        createdAt: new Date(),
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      };

      mockPrisma.announcement.create.mockResolvedValue(mockCreated);

      const caller = createTestCaller(leadUser);
      await caller.announcements.create(validInput);

      expect(notifyAll).toHaveBeenCalledWith(expect.objectContaining({
        id: 'ann-new',
        type: 'announcement',
        title: 'New Announcement',
        message: validInput.title,
        link: '/members',
      }));
    });

    it('should not send notification when creating unpublished draft', async () => {
      const mockCreated = {
        id: 'ann-draft',
        ...validInput,
        authorId: leadUser.id,
        priority: 'NORMAL',
        isPublished: false,
        publishedAt: null,
        expiresAt: null,
        createdAt: new Date(),
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      };

      mockPrisma.announcement.create.mockResolvedValue(mockCreated);

      const caller = createTestCaller(leadUser);
      await caller.announcements.create({ ...validInput, isPublished: false });

      expect(notifyAll).not.toHaveBeenCalled();
    });

    it('should create an announcement with custom priority and expiration', async () => {
      const expiresAt = '2025-12-31T23:59:59.000Z';
      const mockCreated = {
        id: 'ann-urgent',
        title: 'Urgent Notice',
        content: 'Urgent content',
        authorId: leadUser.id,
        priority: 'URGENT',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date(expiresAt),
        createdAt: new Date(),
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      };

      mockPrisma.announcement.create.mockResolvedValue(mockCreated);

      const caller = createTestCaller(leadUser);
      const result = await caller.announcements.create({
        title: 'Urgent Notice',
        content: 'Urgent content',
        priority: 'URGENT',
        expiresAt,
      });

      expect(result.priority).toBe('URGENT');
      expect(mockPrisma.announcement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'URGENT',
          expiresAt: new Date(expiresAt),
        }),
        include: expect.any(Object),
      });
    });

    it('should reject with missing title', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.announcements.create({ title: '', content: 'Some content' })
      ).rejects.toThrow();
    });

    it('should reject with missing content', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.announcements.create({ title: 'A title', content: '' })
      ).rejects.toThrow();
    });

    it('should reject invalid priority value', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.announcements.create({
          title: 'A title',
          content: 'Content',
          priority: 'SUPER_URGENT' as any,
        })
      ).rejects.toThrow();
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.announcements.create(validInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.announcements.create(validInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.announcements.create(validInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // update (lead only)
  // ----------------------------------------------------------------
  describe('update', () => {
    const annId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update an existing announcement', async () => {
      const existingAnn = {
        id: annId,
        title: 'Old Title',
        content: 'Old content',
        priority: 'NORMAL',
        isPublished: true,
        publishedAt: new Date('2025-06-01'),
        expiresAt: null,
        createdAt: new Date('2025-06-01'),
      };

      const updatedAnn = {
        ...existingAnn,
        title: 'Updated Title',
        content: 'Updated content',
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(existingAnn);
      mockPrisma.announcement.update.mockResolvedValue(updatedAnn);

      const caller = createTestCaller(leadUser);
      const result = await caller.announcements.update({
        id: annId,
        title: 'Updated Title',
        content: 'Updated content',
      });

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.announcement.update).toHaveBeenCalledWith({
        where: { id: annId },
        data: expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
        }),
        include: {
          author: { select: { id: true, name: true, playaName: true } },
        },
      });
    });

    it('should set publishedAt when publishing for the first time', async () => {
      const existingAnn = {
        id: annId,
        title: 'Draft',
        content: 'Draft content',
        priority: 'NORMAL',
        isPublished: false,
        publishedAt: null,
        expiresAt: null,
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(existingAnn);
      mockPrisma.announcement.update.mockResolvedValue({
        ...existingAnn,
        isPublished: true,
        publishedAt: new Date(),
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      });

      const caller = createTestCaller(leadUser);
      await caller.announcements.update({ id: annId, isPublished: true });

      expect(mockPrisma.announcement.update).toHaveBeenCalledWith({
        where: { id: annId },
        data: expect.objectContaining({
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('should allow clearing expiresAt by setting it to null', async () => {
      const existingAnn = {
        id: annId,
        title: 'Expiring',
        content: 'Content',
        priority: 'NORMAL',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date('2025-12-31'),
      };

      mockPrisma.announcement.findUnique.mockResolvedValue(existingAnn);
      mockPrisma.announcement.update.mockResolvedValue({
        ...existingAnn,
        expiresAt: null,
        author: { id: leadUser.id, name: leadUser.name, playaName: null },
      });

      const caller = createTestCaller(leadUser);
      await caller.announcements.update({ id: annId, expiresAt: null });

      expect(mockPrisma.announcement.update).toHaveBeenCalledWith({
        where: { id: annId },
        data: expect.objectContaining({
          expiresAt: null,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw NOT_FOUND for non-existent announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.announcements.update({ id: annId, title: 'New Title' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.announcements.update({ id: annId, title: 'New Title' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.announcements.update({ id: annId, title: 'New Title' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // delete (lead only)
  // ----------------------------------------------------------------
  describe('delete', () => {
    const annId = '550e8400-e29b-41d4-a716-446655440000';

    it('should delete an existing announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue({
        id: annId,
        title: 'To be deleted',
        content: 'Content',
      });
      mockPrisma.announcement.delete.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.announcements.delete({ id: annId });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.announcement.delete).toHaveBeenCalledWith({
        where: { id: annId },
      });
    });

    it('should throw NOT_FOUND for non-existent announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.announcements.delete({ id: annId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.announcements.delete({ id: annId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.announcements.delete({ id: annId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.announcements.delete({ id: annId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
