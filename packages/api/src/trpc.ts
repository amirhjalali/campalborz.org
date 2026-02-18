import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Requires any authenticated member
export const memberProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Requires ADMIN or MANAGER role
export const managerProcedure = memberProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'MANAGER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next();
});

// Requires ADMIN role
export const adminProcedure = memberProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next();
});
