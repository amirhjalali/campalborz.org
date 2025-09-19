// API Key Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: string;
    name: string;
    tenantId: string;
    permissions: string[];
    rateLimit: number;
    lastUsedAt: Date;
  };
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
    plan: string;
    status: string;
  };
}

const prisma = new PrismaClient();

export async function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKeyHeader = req.headers['x-api-key'] as string;
    
    if (!apiKeyHeader) {
      return res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'API key is required. Please provide it in the X-API-Key header.',
        },
      });
    }

    // Hash the API key for database lookup
    const hashedKey = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');

    // Find the API key in the database
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyHash: hashedKey,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true,
            status: true,
          },
        },
      },
    });

    if (!apiKey) {
      return res.status(401).json({
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key.',
        },
      });
    }

    // Check if tenant is active
    if (apiKey.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        error: {
          code: 'TENANT_INACTIVE',
          message: 'Your organization account is not active.',
        },
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { 
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });

    // Attach API key and tenant info to request
    req.apiKey = {
      id: apiKey.id,
      name: apiKey.name,
      tenantId: apiKey.tenantId,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit || 1000,
      lastUsedAt: apiKey.lastUsedAt || new Date(),
    };

    req.tenant = apiKey.tenant;

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Failed to authenticate API key.',
      },
    });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey?.permissions.includes(permission) && !req.apiKey?.permissions.includes('*')) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `This operation requires the '${permission}' permission.`,
        },
      });
    }
    next();
  };
}

export function requireAnyPermission(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const hasPermission = permissions.some(permission => 
      req.apiKey?.permissions.includes(permission) || req.apiKey?.permissions.includes('*')
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `This operation requires one of the following permissions: ${permissions.join(', ')}`,
        },
      });
    }
    next();
  };
}