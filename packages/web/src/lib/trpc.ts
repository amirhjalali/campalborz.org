/**
 * tRPC Client Configuration
 *
 * This file sets up the tRPC client for type-safe API calls.
 * Currently a placeholder until the API server is fully implemented.
 */

import { createTRPCReact } from '@trpc/react-query';

// Define a placeholder AppRouter type
// This will be replaced with the actual router type from the API package
export type AppRouter = {
  _def: {
    _config: {
      $types: {
        ctx: unknown;
        meta: unknown;
        errorShape: unknown;
        transformer: unknown;
      };
    };
    procedures: Record<string, unknown>;
  };
};

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Placeholder hook for backwards compatibility
export function useTRPC() {
  return trpc;
}

// Export a mock query function for components that expect it
export const mockQuery = {
  useQuery: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
};
