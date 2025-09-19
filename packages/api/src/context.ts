import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { extractTenantFromHost } from "@camp-platform/shared";

const prisma = new PrismaClient();

export interface Context {
  req: Request;
  res: Response;
  prisma: PrismaClient;
  user?: {
    id: string;
    tenantId: string;
    role: string;
    permissions: string[];
  };
  tenant?: {
    id: string;
    subdomain: string | null;
    domain: string;
  };
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  const context: Context = {
    req,
    res,
    prisma,
  };

  // Extract tenant from host
  const host = req.get("host") || "";
  const tenantInfo = extractTenantFromHost(host);
  
  // Find tenant in database
  if (tenantInfo.subdomain || tenantInfo.isCustomDomain) {
    const tenant = await prisma.tenant.findFirst({
      where: tenantInfo.isCustomDomain
        ? { domain: tenantInfo.domain }
        : { subdomain: tenantInfo.subdomain! },
    });

    if (tenant) {
      context.tenant = {
        id: tenant.id,
        subdomain: tenantInfo.subdomain,
        domain: tenantInfo.domain,
      };
    }
  }

  // Extract user from JWT token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verify user exists and belongs to the tenant
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          tenantId: context.tenant?.id,
          status: "ACTIVE",
        },
      });

      if (user) {
        context.user = {
          id: user.id,
          tenantId: user.tenantId,
          role: user.role,
          permissions: user.permissions,
        };
      }
    } catch (error) {
      // Invalid token, but don't throw error - just continue without user
      console.warn("Invalid JWT token:", error);
    }
  }

  return context;
}