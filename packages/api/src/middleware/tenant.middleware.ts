import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    customDomain?: string | null;
    settings: any;
    features: any;
    limits: any;
    plan: string;
    theme?: any;
  };
  tenantId?: string;
}

/**
 * Middleware to identify and attach tenant to the request
 * Supports both subdomain and custom domain routing
 */
export async function tenantMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const host = req.hostname || req.headers.host?.split(':')[0] || '';
    let tenant;
    
    // Development mode - use header or query param for tenant selection
    if (process.env.NODE_ENV === 'development') {
      const tenantIdFromHeader = req.headers['x-tenant-id'] as string;
      const tenantSlugFromQuery = req.query.tenant as string;
      
      if (tenantIdFromHeader) {
        tenant = await prisma.tenant.findUnique({
          where: { id: tenantIdFromHeader },
          include: { theme: true }
        });
      } else if (tenantSlugFromQuery) {
        tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlugFromQuery },
          include: { theme: true }
        });
      } else {
        // Default to Camp Alborz in development
        tenant = await prisma.tenant.findFirst({
          where: { slug: 'campalborz' },
          include: { theme: true }
        });
      }
    } 
    // Production mode - use subdomain or custom domain
    else {
      const platformDomain = process.env.PLATFORM_DOMAIN || 'campplatform.org';
      
      // Check for subdomain
      if (host.endsWith(`.${platformDomain}`)) {
        const subdomain = host.replace(`.${platformDomain}`, '');
        tenant = await prisma.tenant.findUnique({
          where: { subdomain },
          include: { theme: true }
        });
      } 
      // Check for custom domain
      else if (host && host !== platformDomain) {
        tenant = await prisma.tenant.findUnique({
          where: { customDomain: host },
          include: { theme: true }
        });
      }
    }
    
    // If no tenant found, return error
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'The requested camp platform could not be found.'
      });
    }
    
    // Check if tenant is active
    if (!tenant.isActive) {
      return res.status(403).json({
        error: 'Tenant inactive',
        message: 'This camp platform is currently inactive.'
      });
    }
    
    // Check if tenant is within trial period or has active subscription
    if (tenant.plan !== 'free') {
      const now = new Date();
      const trialExpired = tenant.trialEndsAt && tenant.trialEndsAt < now;
      const subscriptionInactive = tenant.subscriptionStatus !== 'active';
      
      if (trialExpired && subscriptionInactive) {
        return res.status(402).json({
          error: 'Payment required',
          message: 'Your subscription has expired. Please update your payment method.'
        });
      }
    }
    
    // Attach tenant to request
    req.tenant = tenant;
    req.tenantId = tenant.id;
    
    // Set tenant ID in response header for client
    res.setHeader('X-Tenant-Id', tenant.id);
    res.setHeader('X-Tenant-Slug', tenant.slug);
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to identify tenant'
    });
  }
}

/**
 * Middleware to ensure user is a tenant admin
 */
export async function requireTenantAdmin(
  req: TenantRequest & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.tenant || !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const adminRole = await prisma.tenantAdmin.findUnique({
      where: {
        tenantId_userId: {
          tenantId: req.tenant.id,
          userId: req.user.id
        }
      }
    });
    
    if (!adminRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    // Attach admin role to request
    (req as any).adminRole = adminRole;
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify admin access'
    });
  }
}

/**
 * Middleware to check specific admin permissions
 */
export function requirePermission(permission: string) {
  return async (
    req: TenantRequest & { user?: any; adminRole?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { adminRole } = req as any;
      
      if (!adminRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }
      
      // Owner has all permissions
      if (adminRole.role === 'owner') {
        return next();
      }
      
      // Check specific permissions
      const permissions = adminRole.permissions as string[];
      if (!permissions.includes(permission)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Permission '${permission}' required`
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify permissions'
      });
    }
  };
}