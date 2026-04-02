import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import logger from './lib/logger';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Requires any authenticated member
export const memberProcedure = t.procedure.use(({ ctx, next, path }) => {
  if (!ctx.user) {
    logger.security(`Unauthenticated access attempt on ${path}`, { ip: ctx.req.ip });
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Requires LEAD or MANAGER role
export const managerProcedure = memberProcedure.use(({ ctx, next, path }) => {
  if (ctx.user.role !== 'LEAD' && ctx.user.role !== 'MANAGER') {
    logger.security(`Permission denied: ${ctx.user.email} (${ctx.user.role}) attempted manager action on ${path}`);
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next();
});

// Requires LEAD role
export const leadProcedure = memberProcedure.use(({ ctx, next, path }) => {
  if (ctx.user.role !== 'LEAD') {
    logger.security(`Permission denied: ${ctx.user.email} (${ctx.user.role}) attempted lead action on ${path}`);
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Lead access required' });
  }
  return next();
});

// Backwards-compatible alias
export const adminProcedure = leadProcedure;
