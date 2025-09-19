import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to require authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to require tenant context
export const tenantProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.tenant) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: "Tenant not found or invalid domain" 
    });
  }
  return next({
    ctx: {
      ...ctx,
      tenant: ctx.tenant,
    },
  });
});

// Middleware to require both authentication and tenant
export const tenantProtectedProcedure = protectedProcedure.use(tenantProcedure);

// Middleware to check permissions
export const withPermission = (permission: string) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.user.permissions.includes(permission)) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: `Missing permission: ${permission}` 
      });
    }
    return next();
  });