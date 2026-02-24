/**
 * Tests for the Prisma client singleton module.
 *
 * We mock @prisma/client to avoid needing a real database connection.
 */

jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }));
  return { PrismaClient: mockPrismaClient };
});

describe('prisma client singleton', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    // Clean up global
    delete (global as any).prisma;
    // Reset module cache so each test re-imports fresh
    jest.resetModules();
  });

  it('should export a PrismaClient instance', () => {
    const { prisma } = require('../../lib/prisma');
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
  });

  it('should cache the client on global in non-production', () => {
    process.env.NODE_ENV = 'development';
    const { prisma } = require('../../lib/prisma');
    expect((global as any).prisma).toBe(prisma);
  });

  it('should not cache the client on global in production', () => {
    process.env.NODE_ENV = 'production';
    (global as any).prisma = undefined;
    require('../../lib/prisma');
    expect((global as any).prisma).toBeUndefined();
  });

  it('should reuse existing global client if available', () => {
    const existingClient = { $connect: jest.fn(), $disconnect: jest.fn() };
    (global as any).prisma = existingClient;
    const { prisma } = require('../../lib/prisma');
    expect(prisma).toBe(existingClient);
  });
});
