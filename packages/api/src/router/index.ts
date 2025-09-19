import { router } from "../trpc";
import { tenantRouter } from "./tenant";
import { userRouter } from "./user";
import { organizationRouter } from "./organization";
import { adminRouter } from "./admin";
import { billingRouter } from "./billing";
import { cmsRouter } from "./cms";
import { membersRouter } from "./members";

export const appRouter = router({
  tenant: tenantRouter,
  user: userRouter,
  organization: organizationRouter,
  admin: adminRouter,
  billing: billingRouter,
  cms: cmsRouter,
  members: membersRouter,
});

export type AppRouter = typeof appRouter;