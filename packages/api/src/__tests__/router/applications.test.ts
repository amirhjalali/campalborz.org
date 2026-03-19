/**
 * Tests for the applications tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma and external services mocked to avoid database/network access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  application: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    groupBy: jest.fn(),
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
  },
}));

// Mock socket (emitAdminUpdate)
jest.mock('../../lib/socket', () => ({
  emitAdminUpdate: jest.fn(),
}));

// Mock email service
jest.mock('../../lib/email', () => ({
  sendApplicationConfirmation: jest.fn().mockResolvedValue(true),
  sendApplicationApproved: jest.fn().mockResolvedValue(true),
  sendApplicationDenied: jest.fn().mockResolvedValue(true),
}));

import { applicationsRouter } from '../../router/applications';
import { router } from '../../trpc';
import { emitAdminUpdate } from '../../lib/socket';
import { sendApplicationConfirmation, sendApplicationApproved, sendApplicationDenied } from '../../lib/email';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ applications: applicationsRouter });
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

describe('applicationsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // submit (public endpoint)
  // ----------------------------------------------------------------
  describe('submit', () => {
    const validApplication = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      playaName: 'Desert Rose',
      experience: 'BEEN_BEFORE' as const,
      interests: 'Persian culture, art, community building',
      contribution: 'I can cook traditional Persian food',
      message: 'Looking forward to joining!',
    };

    it('should create a new application with valid data (public, no auth)', async () => {
      const mockCreatedApp = {
        id: 'app-1',
        ...validApplication,
        email: 'jane@example.com',
        status: 'PENDING',
        createdAt: new Date('2025-06-01'),
      };

      mockPrisma.application.findFirst.mockResolvedValue(null); // No existing application
      mockPrisma.application.create.mockResolvedValue(mockCreatedApp);

      const caller = createTestCaller(); // No user - public endpoint
      const result = await caller.applications.submit(validApplication);

      expect(result.id).toBe('app-1');
      expect(result.status).toBe('PENDING');
      expect(result.message).toContain('submitted successfully');
      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '555-1234',
          status: 'PENDING',
        }),
      });
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        email: 'jane@example.com',
        name: 'Jane',
        status: 'PENDING',
        createdAt: new Date(),
      });

      const caller = createTestCaller();
      await caller.applications.submit({
        ...validApplication,
        email: 'Jane@Example.COM',
      });

      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'jane@example.com',
        }),
      });
    });

    it('should emit admin update on new application', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
        createdAt: new Date(),
      });

      const caller = createTestCaller();
      await caller.applications.submit(validApplication);

      expect(emitAdminUpdate).toHaveBeenCalledWith('new_application', expect.objectContaining({
        id: 'app-1',
        name: 'Jane Doe',
        status: 'PENDING',
      }));
    });

    it('should send confirmation email to applicant', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
        createdAt: new Date(),
      });

      const caller = createTestCaller();
      await caller.applications.submit(validApplication);

      expect(sendApplicationConfirmation).toHaveBeenCalledWith('jane@example.com', 'Jane Doe');
    });

    it('should throw CONFLICT for duplicate pending application', async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 'existing-app',
        email: 'jane@example.com',
        status: 'PENDING',
      });

      const caller = createTestCaller();
      await expect(
        caller.applications.submit(validApplication)
      ).rejects.toMatchObject({ code: 'CONFLICT' });

      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('should reject with missing required name', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.submit({
          ...validApplication,
          name: '',
        })
      ).rejects.toThrow();
    });

    it('should reject with invalid email', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.submit({
          ...validApplication,
          email: 'not-an-email',
        })
      ).rejects.toThrow();
    });

    it('should reject with missing phone', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.submit({
          ...validApplication,
          phone: '',
        })
      ).rejects.toThrow();
    });

    it('should reject with invalid experience value', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.submit({
          ...validApplication,
          experience: 'SUPER_VETERAN' as any,
        })
      ).rejects.toThrow();
    });

    it('should still succeed even if confirmation email fails', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
        createdAt: new Date(),
      });

      (sendApplicationConfirmation as jest.Mock).mockRejectedValueOnce(new Error('Email service down'));

      const caller = createTestCaller();
      const result = await caller.applications.submit(validApplication);

      // Should still return success despite email failure
      expect(result.id).toBe('app-1');
      expect(result.status).toBe('PENDING');
    });
  });

  // ----------------------------------------------------------------
  // list (manager+ only)
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated applications with defaults', async () => {
      const mockApps = [
        {
          id: 'app-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          status: 'PENDING',
          experience: 'BEEN_BEFORE',
          createdAt: new Date('2025-06-01'),
        },
      ];

      mockPrisma.application.findMany.mockResolvedValue(mockApps);
      mockPrisma.application.count.mockResolvedValue(1);

      const caller = createTestCaller(managerUser);
      const result = await caller.applications.list();

      expect(result.applications).toEqual(mockApps);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.applications.list({ status: 'PENDING' });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      );
    });

    it('should filter by experience level', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.applications.list({ experience: 'FIRST_TIMER' });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ experience: 'FIRST_TIMER' }),
        })
      );
    });

    it('should search across name, email, playaName, and referredBy', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.applications.list({ search: 'jane' });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'jane', mode: 'insensitive' } },
              { email: { contains: 'jane', mode: 'insensitive' } },
              { playaName: { contains: 'jane', mode: 'insensitive' } },
              { referredBy: { contains: 'jane', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should support custom pagination and sorting', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      const result = await caller.applications.list({
        limit: 10,
        offset: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.applications.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.applications.list()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.list();

      expect(result.applications).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // getById (manager+ only)
  // ----------------------------------------------------------------
  describe('getById', () => {
    const appId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return an application by ID', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
        experience: 'BEEN_BEFORE',
        createdAt: new Date(),
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      const caller = createTestCaller(managerUser);
      const result = await caller.applications.getById({ id: appId });

      expect(result).toEqual(mockApp);
      expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: appId },
      });
    });

    it('should throw NOT_FOUND for non-existent application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.applications.getById({ id: appId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject invalid UUID', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.applications.getById({ id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.getById({ id: appId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.applications.getById({ id: appId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // review (lead only) - approve / reject / waitlist
  // ----------------------------------------------------------------
  describe('review', () => {
    const appId = '550e8400-e29b-41d4-a716-446655440000';

    it('should approve a pending application', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      const updatedApp = {
        ...mockApp,
        status: 'ACCEPTED',
        reviewedBy: leadUser.id,
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(updatedApp);

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.review({
        applicationId: appId,
        status: 'ACCEPTED',
        reviewNotes: 'Great candidate',
      });

      expect(result.status).toBe('ACCEPTED');
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: appId },
        data: {
          status: 'ACCEPTED',
          reviewedBy: leadUser.id,
          reviewNotes: 'Great candidate',
        },
      });
    });

    it('should send approval email when accepting', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApp,
        status: 'ACCEPTED',
        reviewedBy: leadUser.id,
      });

      const caller = createTestCaller(leadUser);
      await caller.applications.review({
        applicationId: appId,
        status: 'ACCEPTED',
      });

      expect(sendApplicationApproved).toHaveBeenCalledWith('jane@example.com', 'Jane Doe');
    });

    it('should reject a pending application', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      const updatedApp = {
        ...mockApp,
        status: 'REJECTED',
        reviewedBy: leadUser.id,
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(updatedApp);

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.review({
        applicationId: appId,
        status: 'REJECTED',
      });

      expect(result.status).toBe('REJECTED');
      expect(sendApplicationDenied).toHaveBeenCalledWith('jane@example.com', 'Jane Doe');
    });

    it('should waitlist a pending application', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      const updatedApp = {
        ...mockApp,
        status: 'WAITLISTED',
        reviewedBy: leadUser.id,
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(updatedApp);

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.review({
        applicationId: appId,
        status: 'WAITLISTED',
      });

      expect(result.status).toBe('WAITLISTED');
      // No email sent for waitlist
      expect(sendApplicationApproved).not.toHaveBeenCalled();
      expect(sendApplicationDenied).not.toHaveBeenCalled();
    });

    it('should emit admin update on review', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApp,
        status: 'ACCEPTED',
        reviewedBy: leadUser.id,
      });

      const caller = createTestCaller(leadUser);
      await caller.applications.review({
        applicationId: appId,
        status: 'ACCEPTED',
      });

      expect(emitAdminUpdate).toHaveBeenCalledWith('application_reviewed', expect.objectContaining({
        id: appId,
        status: 'ACCEPTED',
      }));
    });

    it('should throw NOT_FOUND for non-existent application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.applications.review({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST for already accepted application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: appId,
        status: 'ACCEPTED',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.applications.review({ applicationId: appId, status: 'REJECTED' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST for already rejected application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: appId,
        status: 'REJECTED',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.applications.review({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should allow reviewing a REVIEWED-status application', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'REVIEWED',
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApp,
        status: 'ACCEPTED',
        reviewedBy: leadUser.id,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.review({
        applicationId: appId,
        status: 'ACCEPTED',
      });

      expect(result.status).toBe('ACCEPTED');
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.applications.review({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.applications.review({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.review({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should still succeed even if notification email fails', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApp,
        status: 'ACCEPTED',
        reviewedBy: leadUser.id,
      });

      (sendApplicationApproved as jest.Mock).mockRejectedValueOnce(new Error('SMTP error'));

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.review({
        applicationId: appId,
        status: 'ACCEPTED',
      });

      // Should still return the updated application despite email failure
      expect(result.status).toBe('ACCEPTED');
    });
  });

  // ----------------------------------------------------------------
  // updateStatus (lead only)
  // ----------------------------------------------------------------
  describe('updateStatus', () => {
    const appId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update status of an already-reviewed application', async () => {
      const mockApp = {
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'ACCEPTED',
      };

      const updatedApp = {
        ...mockApp,
        status: 'WAITLISTED',
        reviewedBy: leadUser.id,
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(updatedApp);

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.updateStatus({
        applicationId: appId,
        status: 'WAITLISTED',
        reviewNotes: 'Changed mind, putting on waitlist',
      });

      expect(result.status).toBe('WAITLISTED');
    });

    it('should throw NOT_FOUND for non-existent application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.applications.updateStatus({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.applications.updateStatus({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.updateStatus({ applicationId: appId, status: 'ACCEPTED' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // delete (lead only)
  // ----------------------------------------------------------------
  describe('delete', () => {
    const appId = '550e8400-e29b-41d4-a716-446655440000';

    it('should delete an existing application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: appId,
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      mockPrisma.application.delete.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.applications.delete({ id: appId });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.application.delete).toHaveBeenCalledWith({
        where: { id: appId },
      });
    });

    it('should throw NOT_FOUND for non-existent application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.applications.delete({ id: appId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.applications.delete({ id: appId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.applications.delete({ id: appId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // getCounts (manager+ only)
  // ----------------------------------------------------------------
  describe('getCounts', () => {
    it('should return application counts by status', async () => {
      mockPrisma.application.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: 5 },
        { status: 'ACCEPTED', _count: 10 },
        { status: 'REJECTED', _count: 3 },
        { status: 'WAITLISTED', _count: 2 },
      ]);

      const caller = createTestCaller(managerUser);
      const result = await caller.applications.getCounts();

      expect(result.PENDING).toBe(5);
      expect(result.ACCEPTED).toBe(10);
      expect(result.REJECTED).toBe(3);
      expect(result.WAITLISTED).toBe(2);
      expect(result.REVIEWED).toBe(0); // Default for missing status
      expect(result.total).toBe(20);
    });

    it('should return zeroes when no applications exist', async () => {
      mockPrisma.application.groupBy.mockResolvedValue([]);

      const caller = createTestCaller(managerUser);
      const result = await caller.applications.getCounts();

      expect(result.PENDING).toBe(0);
      expect(result.ACCEPTED).toBe(0);
      expect(result.REJECTED).toBe(0);
      expect(result.WAITLISTED).toBe(0);
      expect(result.REVIEWED).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.applications.getCounts()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.applications.getCounts()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
