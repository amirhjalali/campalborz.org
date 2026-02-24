import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@campalborz/api';

/**
 * tRPC client for the mobile app.
 *
 * The AppRouter type is provided by an ambient module declaration
 * in src/types/api.d.ts. To avoid tRPC's ProtectedIntersection
 * collision with `any`-based router types, we create the client
 * with AppRouter and then cast to `any` to allow runtime procedure
 * access (e.g., trpc.auth.login.useMutation()).
 *
 * When the real @campalborz/api package is available, remove the
 * ambient declaration and this cast.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<AppRouter>() as any;
