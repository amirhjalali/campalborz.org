/**
 * Tests for tRPC middleware (authentication and authorization).
 *
 * Validates that the memberProcedure, managerProcedure, and adminProcedure
 * middlewares correctly enforce authentication and role-based access.
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// Mock Prisma before imports
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {},
  prisma: {},
}));

import {
  router,
  publicProcedure,
  memberProcedure,
  managerProcedure,
  adminProcedure,
} from '../trpc';

function createCaller(
  testRouter: any,
  user?: { id: string; email: string; name: string; role: string }
) {
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: {} as any,
    user,
  });
}

describe('tRPC procedures', () => {
  describe('publicProcedure', () => {
    it('should allow unauthenticated access', async () => {
      const testRouter = router({
        test: publicProcedure.query(() => 'public-data'),
      });

      const caller = createCaller(testRouter);
      const result = await caller.test();
      expect(result).toBe('public-data');
    });

    it('should allow authenticated access', async () => {
      const testRouter = router({
        test: publicProcedure.query(() => 'public-data'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        role: 'MEMBER',
      });
      const result = await caller.test();
      expect(result).toBe('public-data');
    });
  });

  describe('memberProcedure', () => {
    it('should allow authenticated members', async () => {
      const testRouter = router({
        test: memberProcedure.query(({ ctx }) => ctx.user.id),
      });

      const caller = createCaller(testRouter, {
        id: 'member-1',
        email: 'member@example.com',
        name: 'Member',
        role: 'MEMBER',
      });
      const result = await caller.test();
      expect(result).toBe('member-1');
    });

    it('should reject unauthenticated requests', async () => {
      const testRouter = router({
        test: memberProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter);
      await expect(caller.test()).rejects.toThrow(TRPCError);
      await expect(caller.test()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('managerProcedure', () => {
    it('should allow ADMIN role', async () => {
      const testRouter = router({
        test: managerProcedure.query(() => 'manager-data'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
      });
      const result = await caller.test();
      expect(result).toBe('manager-data');
    });

    it('should allow MANAGER role', async () => {
      const testRouter = router({
        test: managerProcedure.query(() => 'manager-data'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'manager@example.com',
        name: 'Manager',
        role: 'MANAGER',
      });
      const result = await caller.test();
      expect(result).toBe('manager-data');
    });

    it('should reject MEMBER role', async () => {
      const testRouter = router({
        test: managerProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'member@example.com',
        name: 'Member',
        role: 'MEMBER',
      });
      await expect(caller.test()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should reject unauthenticated requests', async () => {
      const testRouter = router({
        test: managerProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter);
      await expect(caller.test()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('adminProcedure', () => {
    it('should allow ADMIN role', async () => {
      const testRouter = router({
        test: adminProcedure.query(() => 'admin-data'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
      });
      const result = await caller.test();
      expect(result).toBe('admin-data');
    });

    it('should reject MANAGER role', async () => {
      const testRouter = router({
        test: adminProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'manager@example.com',
        name: 'Manager',
        role: 'MANAGER',
      });
      await expect(caller.test()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should reject MEMBER role', async () => {
      const testRouter = router({
        test: adminProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter, {
        id: '1',
        email: 'member@example.com',
        name: 'Member',
        role: 'MEMBER',
      });
      await expect(caller.test()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should reject unauthenticated requests', async () => {
      const testRouter = router({
        test: adminProcedure.query(() => 'should-not-reach'),
      });

      const caller = createCaller(testRouter);
      await expect(caller.test()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
