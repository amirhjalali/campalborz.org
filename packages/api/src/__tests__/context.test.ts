/**
 * Tests for the tRPC context creation function.
 *
 * Validates JWT token extraction from Authorization header
 * and user lookup from the database.
 */

import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

const mockFindUnique = jest.fn();

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    member: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

import { createContext } from '../context';

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

function mockRes() {
  return {} as any;
}

describe('createContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create context without user when no authorization header', async () => {
    const ctx = await createContext({ req: mockReq(), res: mockRes() });

    expect(ctx.prisma).toBeDefined();
    expect(ctx.user).toBeUndefined();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('should create context with user when valid token is provided', async () => {
    const token = jwt.sign(
      { userId: 'member-1', role: 'MEMBER' },
      process.env.JWT_SECRET!
    );

    const mockMember = {
      id: 'member-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MEMBER',
      isActive: true,
    };

    mockFindUnique.mockResolvedValue(mockMember);

    const ctx = await createContext({
      req: mockReq({ authorization: `Bearer ${token}` }),
      res: mockRes(),
    });

    expect(ctx.user).toEqual({
      id: 'member-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MEMBER',
    });
  });

  it('should not set user when token is invalid', async () => {
    const ctx = await createContext({
      req: mockReq({ authorization: 'Bearer invalid-token' }),
      res: mockRes(),
    });

    expect(ctx.user).toBeUndefined();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('should not set user when member is inactive', async () => {
    const token = jwt.sign(
      { userId: 'member-1', role: 'MEMBER' },
      process.env.JWT_SECRET!
    );

    mockFindUnique.mockResolvedValue({
      id: 'member-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MEMBER',
      isActive: false,
    });

    const ctx = await createContext({
      req: mockReq({ authorization: `Bearer ${token}` }),
      res: mockRes(),
    });

    expect(ctx.user).toBeUndefined();
  });

  it('should not set user when member is not found', async () => {
    const token = jwt.sign(
      { userId: 'deleted-member', role: 'MEMBER' },
      process.env.JWT_SECRET!
    );

    mockFindUnique.mockResolvedValue(null);

    const ctx = await createContext({
      req: mockReq({ authorization: `Bearer ${token}` }),
      res: mockRes(),
    });

    expect(ctx.user).toBeUndefined();
  });

  it('should handle token without Bearer prefix gracefully', async () => {
    const ctx = await createContext({
      req: mockReq({ authorization: '' }),
      res: mockRes(),
    });

    expect(ctx.user).toBeUndefined();
  });
});
