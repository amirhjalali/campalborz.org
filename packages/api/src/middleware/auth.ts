import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { Context } from "../context";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
    issuer: "camp-platform",
    audience: payload.tenantId,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

export function requireAuth(ctx: Context) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return ctx.user;
}

export function requireTenant(ctx: Context) {
  if (!ctx.tenant) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Tenant context required",
    });
  }
  return ctx.tenant;
}

export function requirePermission(permission: string) {
  return (ctx: Context) => {
    const user = requireAuth(ctx);
    
    if (!user.permissions.includes(permission) && !user.permissions.includes("*")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing required permission: ${permission}`,
      });
    }
    
    return user;
  };
}

export function requireRole(requiredRole: string) {
  return (ctx: Context) => {
    const user = requireAuth(ctx);
    
    const roleHierarchy = {
      SUPER_ADMIN: 5,
      TENANT_ADMIN: 4,
      ADMIN: 3,
      MODERATOR: 2,
      MEMBER: 1,
    };
    
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    if (userLevel < requiredLevel) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient role. Required: ${requiredRole}`,
      });
    }
    
    return user;
  };
}