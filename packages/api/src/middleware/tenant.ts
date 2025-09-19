// Tenant validation middleware for public API
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './apiAuth';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export function validateTenant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.tenant) {
    return res.status(500).json({
      error: {
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context is missing from the request.',
      },
    });
  }

  // Check tenant plan limits
  if (req.tenant.plan === 'STARTER' && req.path.includes('/analytics')) {
    return res.status(403).json({
      error: {
        code: 'PLAN_LIMIT_EXCEEDED',
        message: 'Analytics API access requires a Pro or Enterprise plan.',
        upgrade: {
          url: '/billing/upgrade',
          plans: ['PRO', 'ENTERPRISE'],
        },
      },
    });
  }

  // Add tenant ID to all database queries through request context
  req.tenantId = req.tenant.id;

  next();
}