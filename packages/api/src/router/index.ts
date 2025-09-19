import { router } from "../trpc";
import { tenantRouter } from "./tenant";
import { userRouter } from "./user";
import { organizationRouter } from "./organization";

export const appRouter = router({
  tenant: tenantRouter,
  user: userRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;