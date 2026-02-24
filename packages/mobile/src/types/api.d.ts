/**
 * Ambient module declaration for @campalborz/api
 *
 * Provides a minimal AppRouter type that extends AnyRouter,
 * satisfying tRPC v10's createTRPCReact constraint.
 */
declare module '@campalborz/api' {
  import type { AnyRouter } from '@trpc/server';

  export type AppRouter = AnyRouter;
}
