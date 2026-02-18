import { router } from '../trpc';
import { authRouter } from './auth';
import { membersRouter } from './members';
import { seasonsRouter } from './seasons';
import { seasonMembersRouter } from './seasonMembers';
import { paymentsRouter } from './payments';
import { dashboardRouter } from './dashboard';
import { applicationsRouter } from './applications';
import { announcementsRouter } from './announcements';

export const appRouter = router({
  auth: authRouter,
  members: membersRouter,
  seasons: seasonsRouter,
  seasonMembers: seasonMembersRouter,
  payments: paymentsRouter,
  dashboard: dashboardRouter,
  applications: applicationsRouter,
  announcements: announcementsRouter,
});

export type AppRouter = typeof appRouter;
