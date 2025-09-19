import { router } from "../trpc";
import { tenantRouter } from "./tenant";
import { userRouter } from "./user";
import { organizationRouter } from "./organization";
import { adminRouter } from "./admin";
import { billingRouter } from "./billing";
import { cmsRouter } from "./cms";
import { membersRouter } from "./members";
import { eventsRouter } from "./events";
import { paymentsRouter } from "./payments";
import { emailRouter } from "./email";

export const appRouter = router({
  tenant: tenantRouter,
  user: userRouter,
  organization: organizationRouter,
  admin: adminRouter,
  billing: billingRouter,
  cms: cmsRouter,
  members: membersRouter,
  events: eventsRouter,
  payments: paymentsRouter,
  email: emailRouter,
});

export type AppRouter = typeof appRouter;