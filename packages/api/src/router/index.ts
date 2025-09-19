import { router } from "../trpc";
import { tenantRouter } from "./tenant";
import { userRouter } from "./user";
import { organizationRouter } from "./organization";
import { adminRouter } from "./admin";
import { billingRouter } from "./billing";

export const appRouter = router({
  tenant: tenantRouter,
  user: userRouter,
  organization: organizationRouter,
  admin: adminRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;