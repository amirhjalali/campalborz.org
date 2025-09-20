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
import { notificationsRouter } from "./notifications";
import { uploadRouter } from "./upload";
import { searchRouter } from "./search";
import { analyticsRouter } from "./analytics";
import { apiKeysRouter } from "./apiKeys";
import { cacheRouter } from "./cache";
import { backupRouter } from "./backup";
import { integrationsRouter } from "./integrations";
import { securityRouter } from "./security";
import { authRouter } from "./auth";
import { realtimeRouter } from "./realtime";
import { donationsRouter } from "./donations";
import { i18nRouter } from "./i18n";
import { documentationRouter } from "./documentation";

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
  notifications: notificationsRouter,
  upload: uploadRouter,
  search: searchRouter,
  analytics: analyticsRouter,
  apiKeys: apiKeysRouter,
  cache: cacheRouter,
  backup: backupRouter,
  integrations: integrationsRouter,
  security: securityRouter,
  auth: authRouter,
  realtime: realtimeRouter,
  donations: donationsRouter,
  i18n: i18nRouter,
  documentation: documentationRouter,
});

export type AppRouter = typeof appRouter;