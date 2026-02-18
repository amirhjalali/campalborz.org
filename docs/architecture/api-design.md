# Camp Alborz API Architecture

## Member Management System -- tRPC API Design

Version 1.0 | February 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Middleware Architecture](#middleware-architecture)
5. [tRPC Context](#trpc-context)
6. [Router Specifications](#router-specifications)
   - [auth](#router-1-auth)
   - [seasons](#router-2-seasons)
   - [members](#router-3-members)
   - [seasonMembers](#router-4-seasonmembers)
   - [payments](#router-5-payments)
   - [tickets](#router-6-tickets)
   - [build](#router-7-build)
   - [inventory](#router-8-inventory)
   - [finance](#router-9-finance)
   - [dashboard](#router-10-dashboard)
   - [applications](#router-11-applications)
   - [announcements](#router-12-announcements)
7. [Error Handling](#error-handling)
8. [Data Model Reference](#data-model-reference)
9. [Client Integration](#client-integration)

---

## System Overview

Camp Alborz is a Burning Man theme camp managing approximately 130--165 members per season. The member management system tracks the full lifecycle of each season: member enrollment, confirmation status, housing assignments, grid power allocation, dues collection, ticket distribution, build/strike crew scheduling, inventory requests, and financial reporting.

### Core Domain Concepts

- **Season**: A single Burning Man year. One season is `isActive` at any time.
- **Member**: A person who has ever participated in Camp Alborz. Persists across seasons.
- **SeasonMember**: The join record between a Member and a Season. This is the central entity -- it holds confirmation status, housing, grid power, dues, arrival logistics, crew flags, and links to payments and assignments.
- **Payment**: An individual financial transaction tied to a SeasonMember. Types include DUES, GRID, FOOD, DONATION, RV_VOUCHER, BEER_FUND, TENT, TICKET, STRIKE_DONATION, FUNDRAISING, and OTHER.

### Design Principles

1. **Season-centric**: Almost every operational query is scoped to a single season.
2. **Role-based access**: Three roles (ADMIN, MANAGER, MEMBER) with hierarchical permissions.
3. **Self-service where safe**: Members can view their own status and update limited profile fields. Managers and admins handle everything else.
4. **Offline-friendly payment recording**: Payments are recorded manually by managers (Venmo, Zelle, cash, etc.) -- there is no real-time Stripe checkout for camp dues.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| API Protocol | tRPC v11 |
| Server Runtime | Express.js adapter for tRPC |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod (integrated with tRPC) |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| Hosting | Node.js process on port 3005 (API), port 3006 (web) |

---

## Authentication and Authorization

### Auth Flow

```
1. Login: POST auth.login({ email, password })
   -> Validates credentials against Member.passwordHash (bcrypt)
   -> Returns { accessToken (JWT, 24h), refreshToken (JWT, 30d), user }

2. Subsequent requests: Authorization: Bearer <accessToken>
   -> Context middleware decodes JWT, loads Member from DB
   -> Attaches { id, role, email } to ctx.user

3. Token refresh: POST auth.refreshToken({ refreshToken })
   -> Issues new access token without re-authentication

4. Invite flow: Admin creates member -> invite email sent -> member visits
   acceptInvite link -> sets password -> receives tokens
```

### JWT Payload

```typescript
interface JWTPayload {
  sub: string;       // member.id (UUID)
  email: string;
  role: MemberRole;  // "ADMIN" | "MANAGER" | "MEMBER"
  iat: number;
  exp: number;
}
```

### Role Hierarchy

```
ADMIN    (level 3) -- Full system access. Create/delete members, manage seasons,
                      finances, tickets, build assignments. ~3-5 people.
MANAGER  (level 2) -- Operational access. View all members, record payments,
                      update statuses, view financial reports. ~8-12 people.
MEMBER   (level 1) -- Self-service only. View own season info, update own
                      profile, submit inventory requests. ~130-165 people.
PUBLIC   (level 0) -- Unauthenticated. Login, password reset, submit
                      application.
```

Permission checks use a `>=` comparison: a procedure requiring MANAGER access is also available to ADMIN.

---

## Middleware Architecture

### Procedure Types

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

// PUBLIC -- No authentication required
export const publicProcedure = t.procedure;

// MEMBER -- Requires valid JWT with any role
export const memberProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// MANAGER -- Requires MANAGER or ADMIN role
export const managerProcedure = memberProcedure.use(({ ctx, next }) => {
  if (!["MANAGER", "ADMIN"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Manager access required" });
  }
  return next();
});

// ADMIN -- Requires ADMIN role
export const adminProcedure = memberProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next();
});
```

### Ownership Middleware

Some procedures allow a member to act on their own record OR require elevated permissions:

```typescript
// MEMBER (own) / MANAGER (any) -- used for procedures like getMemberPayments
export const ownerOrManagerProcedure = memberProcedure.use(({ ctx, input, next }) => {
  // Input must contain a seasonMemberId or memberId
  // If user is MANAGER/ADMIN, allow any
  // If user is MEMBER, verify the record belongs to them
  // Throws FORBIDDEN if neither condition is met
  return next();
});
```

---

## tRPC Context

Created fresh for every request:

```typescript
interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;        // Member.id
    email: string;
    role: MemberRole;  // "ADMIN" | "MANAGER" | "MEMBER"
  };
}

async function createContext({ req }: { req: Request }): Promise<Context> {
  const context: Context = { prisma };

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      const member = await prisma.member.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (member && member.isActive) {
        context.user = { id: member.id, email: member.email, role: member.role };
      }
    } catch {
      // Invalid token -- continue as unauthenticated
    }
  }

  return context;
}
```

---

## Router Specifications

### App Router Composition

```typescript
import { router } from "./trpc";

export const appRouter = router({
  auth,
  seasons,
  members,
  seasonMembers,
  payments,
  tickets,
  build,
  inventory,
  finance,
  dashboard,
  applications,
  announcements,
});

export type AppRouter = typeof appRouter;
```

---

### Router 1: auth

Authentication, password management, and invite acceptance.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `login` | mutation | PUBLIC | Authenticate with email and password |
| `me` | query | MEMBER | Get current authenticated user |
| `changePassword` | mutation | MEMBER | Change own password |
| `forgotPassword` | mutation | PUBLIC | Request a password reset email |
| `resetPassword` | mutation | PUBLIC | Set new password via reset token |
| `acceptInvite` | mutation | PUBLIC | Set password for an invited member |

#### Procedure Details

**auth.login**

```typescript
// Input
z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Output
{
  token: string;          // JWT access token (24h expiry)
  refreshToken: string;   // JWT refresh token (30d expiry)
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    playaName: string | null;
    role: MemberRole;
  };
}
```

Validates against `Member.passwordHash` using bcrypt. Returns UNAUTHORIZED if email not found, password incorrect, or `member.isActive === false`.

**auth.me**

```typescript
// Input: none

// Output
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  playaName: string | null;
  phone: string | null;
  gender: string | null;
  role: MemberRole;
  isActive: boolean;
  profileImageUrl: string | null;
  createdAt: Date;
}
```

**auth.changePassword**

```typescript
// Input
z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

// Output
{ success: true }
```

Verifies current password before updating. Returns UNAUTHORIZED if current password is wrong.

**auth.forgotPassword**

```typescript
// Input
z.object({
  email: z.string().email(),
})

// Output
{ success: true; message: string }
```

Always returns success (even if email not found) to prevent email enumeration. If email exists, sends a password reset link with a time-limited token (1 hour).

**auth.resetPassword**

```typescript
// Input
z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})

// Output
{ success: true }
```

Validates the reset token. Returns BAD_REQUEST if token is expired or invalid.

**auth.acceptInvite**

```typescript
// Input
z.object({
  inviteToken: z.string().min(1),
  password: z.string().min(8),
})

// Output
{
  token: string;
  refreshToken: string;
  user: { id, email, firstName, lastName, playaName, role };
}
```

Used when an admin invites a new member. The invite token maps to a Member record with `passwordHash === null`. This procedure sets their password and returns auth tokens so they are immediately logged in.

---

### Router 2: seasons

Manage Burning Man seasons. Only one season can be active at a time.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `getCurrent` | query | MEMBER | Get the active season |
| `list` | query | MEMBER | List all seasons (newest first) |
| `create` | mutation | ADMIN | Create a new season |
| `update` | mutation | ADMIN | Update season fields |
| `activate` | mutation | ADMIN | Set a season as the active season |
| `getStats` | query | MANAGER | Get enrollment/financial stats for a season |

#### Procedure Details

**seasons.getCurrent**

```typescript
// Input: none

// Output
Season | null
// Returns the season where isActive === true
```

**seasons.list**

```typescript
// Input: none

// Output
Season[]  // Ordered by year DESC
```

**seasons.create**

```typescript
// Input
z.object({
  year: z.number().int().min(2020).max(2040),
  name: z.string().min(1).max(100),    // e.g. "Burning Man 2026"
  duesAmount: z.number().positive(),     // Stored in season.settings JSON
  gridFee30amp: z.number().nonnegative(),
  gridFee50amp: z.number().nonnegative(),
  buildStartDate: z.string().datetime().optional(),
  strikeEndDate: z.string().datetime().optional(),
})

// Output
Season
```

`duesAmount`, `gridFee30amp`, and `gridFee50amp` are stored in the `settings` JSON field on the Season model:

```json
{
  "duesAmount": 500,
  "gridFee30amp": 200,
  "gridFee50amp": 350,
  "buildStartDate": "2026-08-20T00:00:00Z",
  "strikeEndDate": "2026-09-05T00:00:00Z"
}
```

**seasons.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  year: z.number().int().optional(),
  name: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  settings: z.record(z.unknown()).optional(),
})

// Output
Season
```

**seasons.activate**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
Season  // The newly activated season
```

Sets `isActive = true` on the target season and `isActive = false` on all others (wrapped in a transaction).

**seasons.getStats**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
{
  memberCount: number;         // Total SeasonMembers for this season
  confirmedCount: number;      // Where confirmationStatus === "CONFIRMED"
  duesCollectedPct: number;    // Percentage of confirmed members with duesPaid === true
  housingBreakdown: Record<HousingType, number>;  // { TENT: 12, SHIFTPOD: 45, RV: 8, ... }
  genderRatio: Record<string, number>;             // { Male: 85, Female: 62, Other: 3 }
  virginPct: number;           // Percentage of members where member.isAlborzVirgin === true
  totalRevenue: number;        // Sum of all Payment amounts for this season
}
```

---

### Router 3: members

Manage the persistent Member records (cross-season). Members are people; SeasonMembers are their participation in a specific year.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MANAGER | List/search all members with pagination |
| `getById` | query | MANAGER | Get a single member with their season history |
| `create` | mutation | ADMIN | Create a new member record |
| `update` | mutation | ADMIN | Update any member fields |
| `invite` | mutation | ADMIN | Create a member and send an invite email |
| `bulkImport` | mutation | ADMIN | Import multiple members at once |
| `getMyProfile` | query | MEMBER | Get own member profile |
| `updateMyProfile` | mutation | MEMBER | Update own editable fields |
| `deactivate` | mutation | ADMIN | Soft-delete (set isActive = false) |

#### Procedure Details

**members.list**

```typescript
// Input
z.object({
  search: z.string().optional(),            // Searches firstName, lastName, email, playaName
  role: z.nativeEnum(MemberRole).optional(), // Filter by ADMIN, MANAGER, MEMBER
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
})

// Output
{
  members: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    playaName: string | null;
    phone: string | null;
    gender: string | null;
    role: MemberRole;
    isActive: boolean;
    isAlborzVirgin: boolean;
    createdAt: Date;
  }>;
  total: number;  // Total matching records (for pagination)
}
```

Search uses case-insensitive `contains` on `firstName`, `lastName`, `email`, and `playaName`.

**members.getById**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  playaName: string | null;
  phone: string | null;
  gender: string | null;
  isAlborzVirgin: boolean;
  isBMVirgin: boolean;
  role: MemberRole;
  isActive: boolean;
  profileImageUrl: string | null;
  emergencyContact: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  seasonMembers: Array<{
    id: string;
    seasonId: string;
    season: { year: number; name: string };
    confirmationStatus: ConfirmationStatus;
    housingType: HousingType | null;
    duesPaid: boolean;
    buildCrew: boolean;
    strikeCrew: boolean;
  }>;
}
```

**members.create**

```typescript
// Input
z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  playaName: z.string().optional(),
  gender: z.string().optional(),
  role: z.nativeEnum(MemberRole).default("MEMBER"),
})

// Output
Member
```

Returns CONFLICT if email already exists.

**members.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  playaName: z.string().optional(),
  gender: z.string().optional(),
  role: z.nativeEnum(MemberRole).optional(),
  isAlborzVirgin: z.boolean().optional(),
  isBMVirgin: z.boolean().optional(),
  profileImageUrl: z.string().url().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
})

// Output
Member
```

**members.invite**

```typescript
// Input
z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(MemberRole).default("MEMBER"),
})

// Output
{
  member: Member;
  inviteToken: string;  // Also sent via email
}
```

Creates a Member record with `passwordHash = null`, generates a one-time invite token, and sends an email with a link to `acceptInvite`. Token expires in 7 days.

**members.bulkImport**

```typescript
// Input
z.object({
  members: z.array(z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    playaName: z.string().optional(),
    gender: z.string().optional(),
    role: z.nativeEnum(MemberRole).default("MEMBER"),
  })).min(1).max(200),
})

// Output
{
  created: number;
  skipped: number;   // Already-existing emails
  errors: Array<{ email: string; reason: string }>;
}
```

Uses a Prisma transaction with `skipDuplicates` on the email unique constraint.

**members.getMyProfile**

```typescript
// Input: none

// Output
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  playaName: string | null;
  phone: string | null;
  gender: string | null;
  isAlborzVirgin: boolean;
  isBMVirgin: boolean;
  role: MemberRole;
  profileImageUrl: string | null;
  emergencyContact: string | null;
  createdAt: Date;
}
```

Uses `ctx.user.id` to fetch the member's own record.

**members.updateMyProfile**

```typescript
// Input
z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  playaName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
})

// Output
Member  // Updated member record
```

Members cannot change their own email, role, or active status. Only the fields above are editable.

**members.deactivate**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

Sets `isActive = false`. Does not delete the record (preserves historical data). Prevents the admin from deactivating themselves.

---

### Router 4: seasonMembers

The core operational router. Manages the relationship between members and a specific season -- the `SeasonMember` records that drive every aspect of camp logistics.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MANAGER | List season members with rich filtering |
| `getById` | query | MANAGER | Get a single season member with full details |
| `enroll` | mutation | ADMIN | Enroll a member in a season |
| `bulkEnroll` | mutation | ADMIN | Enroll multiple members at once |
| `updateStatus` | mutation | ADMIN/MANAGER | Update confirmation status |
| `updateHousing` | mutation | ADMIN | Update housing/grid assignment |
| `updateArrival` | mutation | MEMBER (own) / ADMIN (any) | Update arrival/departure info |
| `updateMySeasonInfo` | mutation | MEMBER | Update own season logistics |
| `getMySeasonStatus` | query | MEMBER | Get own season overview |
| `export` | query | ADMIN | Export roster as CSV or JSON |
| `getSummaryStats` | query | MANAGER | Aggregated stats for a season |

#### Procedure Details

**seasonMembers.list**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  status: z.nativeEnum(ConfirmationStatus).optional(),  // INTERESTED, MAYBE, CONFIRMED, CANCELLED
  housingType: z.nativeEnum(HousingType).optional(),    // TENT, SHIFTPOD, RV, etc.
  gridPower: z.nativeEnum(GridFeeType).optional(),      // AMP_30, AMP_50, NONE
  duesPaid: z.boolean().optional(),                     // true = has a DUES payment record
  buildCrew: z.boolean().optional(),
  strikeCrew: z.boolean().optional(),
  search: z.string().optional(),                        // Searches member name/email/playaName
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(50),
})

// Output
{
  seasonMembers: Array<{
    id: string;
    confirmationStatus: ConfirmationStatus;
    housingType: HousingType | null;
    housingSize: string | null;
    gridFeeType: GridFeeType;
    gridPower: string | null;
    duesPaid: boolean;
    hasTicket: boolean;
    vehiclePass: boolean;
    buildCrew: boolean;
    strikeCrew: boolean;
    arrivalDate: Date | null;
    departureDate: Date | null;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      playaName: string | null;
      email: string;
      phone: string | null;
      gender: string | null;
      isAlborzVirgin: boolean;
    };
  }>;
  total: number;
}
```

The `duesPaid` filter inspects the boolean field `SeasonMember.duesPaid`. This field is denormalized -- it is set to `true` when a Payment of type `DUES` is recorded for this SeasonMember, and set back to `false` if that payment is deleted.

**seasonMembers.getById**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{
  // All SeasonMember fields
  id: string;
  seasonId: string;
  memberId: string;
  confirmationStatus: ConfirmationStatus;
  housingType: HousingType | null;
  housingSize: string | null;
  sharedWithId: string | null;
  gridFeeType: GridFeeType;
  gridFeeAmount: number | null;
  gridPower: string | null;
  mapObject: string | null;
  duesPaid: boolean;
  duesAmount: number | null;
  duesMethod: PaymentMethod | null;
  duesPaidDate: Date | null;
  arrivalDate: Date | null;
  departureDate: Date | null;
  rideDetails: string | null;
  dietaryPlan: string | null;
  hasTicket: boolean;
  vehiclePass: boolean;
  preApprovalForm: PreApprovalStatus | null;
  buildCrew: boolean;
  strikeCrew: boolean;
  specialRequests: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  member: Member;
  sharedWith: { id: string; member: { firstName: string; lastName: string } } | null;
  payments: Payment[];
  buildAssignments: Array<{ id: string; buildDay: BuildDay }>;
  strikeAssignments: StrikeAssignment[];
  earlyArrivalPasses: EarlyArrivalPass[];
  inventoryRequests: InventoryRequest[];
}
```

**seasonMembers.enroll**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: z.nativeEnum(ConfirmationStatus).default("INTERESTED"),
})

// Output
SeasonMember
```

Returns CONFLICT if the member is already enrolled in this season (unique constraint on `[seasonId, memberId]`).

**seasonMembers.bulkEnroll**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()).min(1).max(200),
})

// Output
{
  enrolled: number;
  skipped: number;   // Already enrolled
  errors: Array<{ memberId: string; reason: string }>;
}
```

**seasonMembers.updateStatus**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ConfirmationStatus),  // INTERESTED, MAYBE, CONFIRMED, CANCELLED
})

// Output
SeasonMember
```

Available to both MANAGER and ADMIN.

**seasonMembers.updateHousing**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  housingType: z.nativeEnum(HousingType),   // TENT, SHIFTPOD, RV, TRAILER, DORM, SHARED, HEXAYURT, OTHER
  housingSize: z.string().optional(),        // e.g. "10x12", "25ft"
  sharedWithId: z.string().uuid().optional(),// Another SeasonMember id (for couples/shared housing)
  gridPower: z.nativeEnum(GridFeeType).optional(),  // AMP_30, AMP_50, NONE
})

// Output
SeasonMember
```

When `gridPower` is set, the `gridFeeAmount` is automatically calculated from the season's `settings.gridFee30amp` or `settings.gridFee50amp`.

**seasonMembers.updateArrival**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  arrivalDate: z.string().datetime().optional(),
  departureDate: z.string().datetime().optional(),
  rideDetails: z.string().optional(),
})

// Output
SeasonMember
```

Permission: MEMBER can update their own record (`seasonMember.memberId === ctx.user.id`). ADMIN can update any record. MANAGER cannot use this procedure -- they should use `updateStatus` or work through the admin.

**seasonMembers.updateMySeasonInfo**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),  // Defaults to active season
  arrivalDate: z.string().datetime().optional(),
  departureDate: z.string().datetime().optional(),
  rideDetails: z.string().optional(),
  specialRequests: z.string().optional(),
  dietaryPlan: z.string().optional(),
})

// Output
SeasonMember
```

Looks up the SeasonMember for `ctx.user.id` in the specified (or active) season. Returns NOT_FOUND if the member is not enrolled.

**seasonMembers.getMySeasonStatus**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),  // Defaults to active season
})

// Output
{
  seasonMember: {
    id: string;
    confirmationStatus: ConfirmationStatus;
    housingType: HousingType | null;
    housingSize: string | null;
    gridFeeType: GridFeeType;
    duesPaid: boolean;
    duesAmount: number | null;
    hasTicket: boolean;
    vehiclePass: boolean;
    buildCrew: boolean;
    strikeCrew: boolean;
    arrivalDate: Date | null;
    departureDate: Date | null;
    specialRequests: string | null;
  };
  paymentsSummary: {
    totalPaid: number;
    payments: Array<{
      type: PaymentType;
      amount: number;
      method: PaymentMethod | null;
      paidDate: Date;
    }>;
  };
  season: {
    year: number;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    settings: { duesAmount: number; gridFee30amp: number; gridFee50amp: number };
  };
} | null
```

Returns `null` if the member is not enrolled in the season.

**seasonMembers.export**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  format: z.enum(["csv", "json"]),
})

// Output
{
  url: string;       // Presigned download URL (valid for 1 hour)
  filename: string;  // e.g. "camp-alborz-2026-roster.csv"
  recordCount: number;
}
```

Generates a full roster export with member name, email, phone, playa name, status, housing, grid, dues, tickets, crew flags, arrival/departure. CSV uses a flat structure; JSON preserves nested objects.

**seasonMembers.getSummaryStats**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
{
  byStatus: Record<ConfirmationStatus, number>;
  // { INTERESTED: 12, MAYBE: 8, CONFIRMED: 135, CANCELLED: 10 }

  byHousing: Record<HousingType, number>;
  // { TENT: 5, SHIFTPOD: 60, RV: 15, TRAILER: 3, DORM: 8, SHARED: 20, HEXAYURT: 4, OTHER: 2 }

  byGridPower: Record<GridFeeType, number>;
  // { AMP_30: 45, AMP_50: 12, NONE: 78 }

  buildCrewCount: number;
  strikeCrewCount: number;
  totalEnrolled: number;
  duesPaidCount: number;
  duesPaidPct: number;
  ticketHolderCount: number;
  vehiclePassCount: number;
  virginCount: number;        // Members where isAlborzVirgin === true
  genderBreakdown: Record<string, number>;
}
```

---

### Router 5: payments

Manual payment recording. Camp Alborz collects dues/fees via Venmo, Zelle, cash, etc. Managers record these payments in the system.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MANAGER | List payments with filtering |
| `create` | mutation | MANAGER | Record a new payment |
| `update` | mutation | ADMIN | Edit a payment record |
| `delete` | mutation | ADMIN | Delete a payment record |
| `getMemberPayments` | query | MEMBER (own) / MANAGER (any) | Get payments for a season member |
| `getMyPayments` | query | MEMBER | Get own payment history |
| `getSummary` | query | MANAGER | Financial summary for a season |

#### Procedure Details

**payments.list**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),        // Filter by member (looks up their SeasonMembers)
  type: z.nativeEnum(PaymentType).optional(),     // DUES, GRID, FOOD, DONATION, etc.
  method: z.nativeEnum(PaymentMethod).optional(), // VENMO, ZELLE, CASH, CARD, PAYPAL, GIVEBUTTER
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
})

// Output
{
  payments: Array<{
    id: string;
    type: PaymentType;
    amount: number;
    method: PaymentMethod | null;
    paidTo: string | null;
    paidDate: Date;
    notes: string | null;
    createdAt: Date;
    seasonMember: {
      id: string;
      member: { id: string; firstName: string; lastName: string; playaName: string | null };
      season: { year: number; name: string };
    };
  }>;
  total: number;
}
```

**payments.create**

```typescript
// Input
z.object({
  seasonMemberId: z.string().uuid(),
  type: z.nativeEnum(PaymentType),          // DUES, GRID, FOOD, DONATION, etc.
  amount: z.number().positive(),            // Dollar amount (not cents)
  method: z.nativeEnum(PaymentMethod),      // VENMO, ZELLE, CASH, CARD, PAYPAL, GIVEBUTTER, OTHER
  paidTo: z.string().optional(),            // Name of person who collected it
  paidAt: z.string().datetime(),            // When the payment was made
  notes: z.string().optional(),
})

// Output
Payment
```

Side effects:
- If `type === "DUES"`, sets `SeasonMember.duesPaid = true`, `duesAmount = amount`, `duesMethod = method`, `duesPaidDate = paidAt`.
- If `type === "GRID"`, updates `SeasonMember.gridFeeAmount = amount`.

**payments.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(PaymentType).optional(),
  amount: z.number().positive().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  paidTo: z.string().optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().optional(),
})

// Output
Payment
```

**payments.delete**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

Side effects: If the deleted payment was type `DUES` and no other DUES payment exists for that SeasonMember, sets `SeasonMember.duesPaid = false`.

**payments.getMemberPayments**

```typescript
// Input
z.object({
  seasonMemberId: z.string().uuid(),
})

// Output
Payment[]
```

Permission: MEMBER can query their own SeasonMember. MANAGER/ADMIN can query any.

**payments.getMyPayments**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),  // Defaults to active season
})

// Output
{
  payments: Payment[];
  totalPaid: number;       // Sum of all payments
  totalOwed: number;       // Dues amount + grid fee from season settings
  breakdown: Record<PaymentType, number>;  // e.g. { DUES: 500, GRID: 200, FOOD: 100 }
}
```

**payments.getSummary**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
{
  totalCollected: number;        // Sum of all payments this season
  byType: Record<PaymentType, { count: number; total: number }>;
  // { DUES: { count: 120, total: 60000 }, GRID: { count: 57, total: 13500 }, ... }
  byMethod: Record<PaymentMethod, { count: number; total: number }>;
  // { VENMO: { count: 80, total: 42000 }, ZELLE: { count: 35, total: 21000 }, ... }
  collectionRate: number;        // Percentage of confirmed members with duesPaid
  outstandingBalance: number;    // Expected total - collected total
}
```

---

### Router 6: tickets

Manage DGS (Directed Group Sale) ticket allocations and vehicle passes.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MANAGER | List all ticket allocations for a season |
| `allocate` | mutation | ADMIN | Allocate tickets to a member |
| `update` | mutation | ADMIN | Update ticket details |
| `delete` | mutation | ADMIN | Remove a ticket allocation |
| `getSummary` | query | MANAGER | Ticket distribution summary |

#### Procedure Details

**tickets.list**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
Array<{
  id: string;
  ticketType: TicketType;     // DGS, HOMA, BOOFER, OTHER
  ticketCount: number;
  purchaseConfirmed: boolean;
  vehiclePass: boolean;
  notes: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    playaName: string | null;
    email: string;
  };
}>
```

**tickets.allocate**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  memberId: z.string().uuid(),
  type: z.nativeEnum(TicketType).default("DGS"),
  quantity: z.number().int().min(1).max(4).default(1),
  vehiclePass: z.boolean().default(false),
})

// Output
Ticket
```

Also sets `SeasonMember.hasTicket = true` and `SeasonMember.vehiclePass = vehiclePass` if applicable.

**tickets.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  purchaseConfirmed: z.boolean().optional(),
  vehiclePass: z.boolean().optional(),
  notes: z.string().optional(),
})

// Output
Ticket
```

**tickets.delete**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

Resets `SeasonMember.hasTicket = false` if no remaining ticket allocations exist.

**tickets.getSummary**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
{
  totalAllocated: number;      // Sum of ticketCount across all tickets
  confirmed: number;           // Where purchaseConfirmed === true
  byType: Record<TicketType, { count: number; confirmed: number }>;
  // { DGS: { count: 120, confirmed: 115 }, HOMA: { count: 15, confirmed: 15 }, ... }
  vehiclePasses: number;
}
```

---

### Router 7: build

Manage build days (pre-event setup), strike (post-event teardown), and early arrival passes.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `getBuildDays` | query | MEMBER | List build days with who is assigned |
| `createBuildDay` | mutation | ADMIN | Create a scheduled build day |
| `updateBuildDay` | mutation | ADMIN | Update build day details |
| `deleteBuildDay` | mutation | ADMIN | Delete a build day |
| `assignToBuild` | mutation | ADMIN | Assign a member to a build day |
| `removeFromBuild` | mutation | ADMIN | Remove a member from a build day |
| `getStrikeCrew` | query | MEMBER | List strike crew with departure dates |
| `assignToStrike` | mutation | ADMIN | Assign a member to strike |
| `removeFromStrike` | mutation | ADMIN | Remove a member from strike |
| `getEarlyArrivals` | query | MANAGER | List early arrival passes |
| `createEarlyArrival` | mutation | ADMIN | Issue an early arrival pass |

#### Procedure Details

**build.getBuildDays**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
Array<{
  id: string;
  date: Date;
  name: string;           // e.g. "Tuesday Build Day"
  notes: string | null;
  assignments: Array<{
    id: string;
    ticketId: string | null;   // WAP/EA ticket ID
    seasonMember: {
      id: string;
      member: { id: string; firstName: string; lastName: string; playaName: string | null };
    };
  }>;
}>
```

Ordered by `date ASC`.

**build.createBuildDay**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  date: z.string().datetime(),
  name: z.string().min(1).max(100),
  notes: z.string().optional(),
})

// Output
BuildDay
```

**build.updateBuildDay**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  date: z.string().datetime().optional(),
  name: z.string().min(1).optional(),
  notes: z.string().optional(),
})

// Output
BuildDay
```

**build.deleteBuildDay**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

Cascades to delete all BuildAssignment records.

**build.assignToBuild**

```typescript
// Input
z.object({
  buildDayId: z.string().uuid(),
  seasonMemberId: z.string().uuid(),
  wapTicketId: z.string().optional(),   // WAP/Early Arrival ticket ID string
})

// Output
BuildAssignment
```

Also sets `SeasonMember.buildCrew = true`. Returns CONFLICT if already assigned to this build day.

**build.removeFromBuild**

```typescript
// Input
z.object({
  assignmentId: z.string().uuid(),
})

// Output
{ success: true }
```

If the member has no remaining build day assignments, sets `SeasonMember.buildCrew = false`.

**build.getStrikeCrew**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
Array<{
  id: string;
  departureDate: Date | null;
  notes: string | null;
  seasonMember: {
    id: string;
    member: { id: string; firstName: string; lastName: string; playaName: string | null; phone: string | null };
  };
}>
```

**build.assignToStrike**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  seasonMemberId: z.string().uuid(),
  departureDate: z.string().datetime().optional(),
})

// Output
StrikeAssignment
```

Also sets `SeasonMember.strikeCrew = true`.

**build.removeFromStrike**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

Sets `SeasonMember.strikeCrew = false`.

**build.getEarlyArrivals**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
Array<{
  id: string;
  date: Date;
  ticketId: string | null;   // WAP/EA ticket ID
  notes: string | null;
  seasonMember: {
    id: string;
    member: { id: string; firstName: string; lastName: string; playaName: string | null };
  };
}>
```

**build.createEarlyArrival**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  seasonMemberId: z.string().uuid(),
  arrivalDate: z.string().datetime(),
  passId: z.string().optional(),  // External ticket/pass ID
})

// Output
EarlyArrivalPass
```

---

### Router 8: inventory

Camp equipment tracking and member requests for shared supplies (shade structures, tents, AC units, mattresses, bikes, etc.).

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MEMBER | List inventory items, optionally filtered by category |
| `create` | mutation | ADMIN | Add a new inventory item |
| `update` | mutation | ADMIN | Update an inventory item |
| `delete` | mutation | ADMIN | Remove an inventory item |
| `getRequests` | query | MANAGER | List inventory requests |
| `createRequest` | mutation | MEMBER | Submit a request for equipment |
| `updateRequestStatus` | mutation | MANAGER | Approve/deny/fulfill a request |

#### Procedure Details

**inventory.list**

```typescript
// Input
z.object({
  category: z.nativeEnum(InventoryCategory).optional(),
  // SHADE, TENT, AC_UNIT, MATTRESS, COT, KITCHEN, BIKE, RUG, OTHER
})

// Output
Array<{
  id: string;
  category: InventoryCategory;
  name: string;
  description: string | null;
  quantity: number;
  dimensions: string | null;
  assignedTo: string | null;
  notes: string | null;
}>
```

**inventory.create**

```typescript
// Input
z.object({
  category: z.nativeEnum(InventoryCategory),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(0).default(1),
  dimensions: z.string().optional(),
  description: z.string().optional(),
  storageLocation: z.string().optional(),
})

// Output
InventoryItem
```

**inventory.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  category: z.nativeEnum(InventoryCategory).optional(),
  name: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  dimensions: z.string().optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

// Output
InventoryItem
```

**inventory.delete**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

**inventory.getRequests**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),
  status: z.nativeEnum(InventoryRequestStatus).optional(),
  // REQUESTED, APPROVED, FULFILLED, DENIED
})

// Output
Array<{
  id: string;
  category: InventoryCategory | null;
  description: string | null;
  status: InventoryRequestStatus;
  notes: string | null;
  createdAt: Date;
  inventoryItem: { id: string; name: string; category: InventoryCategory } | null;
  seasonMember: {
    id: string;
    member: { id: string; firstName: string; lastName: string; playaName: string | null };
    season: { year: number };
  };
}>
```

When `seasonId` is provided, filters to requests where the SeasonMember belongs to that season.

**inventory.createRequest**

```typescript
// Input
z.object({
  seasonMemberId: z.string().uuid(),
  category: z.nativeEnum(InventoryCategory),
  inventoryItemId: z.string().uuid().optional(),  // Request a specific item
  notes: z.string().optional(),                   // "I need shade for a 10x12 shiftpod"
})

// Output
InventoryRequest
```

Members can only submit requests for their own SeasonMember record.

**inventory.updateRequestStatus**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(InventoryRequestStatus),  // APPROVED, FULFILLED, DENIED
  notes: z.string().optional(),
})

// Output
InventoryRequest
```

---

### Router 9: finance

Camp-level expense tracking and budget management.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `getExpenses` | query | MANAGER | List expenses with filtering |
| `createExpense` | mutation | MANAGER | Record a camp expense |
| `updateExpense` | mutation | ADMIN | Edit an expense record |
| `deleteExpense` | mutation | ADMIN | Delete an expense |
| `markReimbursed` | mutation | ADMIN | Mark an expense as reimbursed |
| `getBudget` | query | MANAGER | Get budget line items |
| `createBudgetLine` | mutation | ADMIN | Add a budget line |
| `updateBudgetLine` | mutation | ADMIN | Update a budget line |
| `getBudgetSummary` | query | MANAGER | Budget vs actual summary |

#### Procedure Details

**finance.getExpenses**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  paidBy: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

// Output
Array<{
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  category: string | null;
  notes: string | null;
  needsReimbursement: boolean;
  reimbursed: boolean;
  createdAt: Date;
}>
```

**finance.createExpense**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  paidBy: z.string().min(1),        // Person's name or "ALBORZ"
  date: z.string().datetime(),
  category: z.string().optional(),   // Freeform category
  needsReimbursement: z.boolean().default(false),
  notes: z.string().optional(),
})

// Output
Expense
```

**finance.updateExpense**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  paidBy: z.string().optional(),
  date: z.string().datetime().optional(),
  category: z.string().optional(),
  needsReimbursement: z.boolean().optional(),
  notes: z.string().optional(),
})

// Output
Expense
```

**finance.deleteExpense**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

**finance.markReimbursed**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
Expense  // With reimbursed = true
```

**finance.getBudget**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
Array<{
  id: string;
  category: BudgetCategory;
  // GENERATOR, FUEL, STORAGE, TRUCKS, SOUND, FOOD, CONTAINERS,
  // BATHROOMS, WATER, GREY_WATER, SHOWERS, DECORATION, TRASH, MISC
  estimatedAmount: number;
  actualAmount: number | null;
  notes: string | null;
}>
```

**finance.createBudgetLine**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
  category: z.nativeEnum(BudgetCategory),
  estimatedAmount: z.number().nonnegative(),
  description: z.string().optional(),
})

// Output
BudgetItem
```

Returns CONFLICT if a budget line for that category already exists in the season (unique constraint on `[seasonId, category]`).

**finance.updateBudgetLine**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  estimatedAmount: z.number().nonnegative().optional(),
  actualAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
})

// Output
BudgetItem
```

**finance.getBudgetSummary**

```typescript
// Input
z.object({
  seasonId: z.string().uuid(),
})

// Output
{
  totalEstimated: number;    // Sum of all estimatedAmount
  totalActual: number;       // Sum of all actualAmount (where not null)
  byCategory: Array<{
    category: BudgetCategory;
    estimated: number;
    actual: number;
    variance: number;        // actual - estimated
  }>;
  totalExpenses: number;     // Sum of all Expense records for this season
  totalRevenue: number;      // Sum of all Payment records for this season
  netPosition: number;       // totalRevenue - totalExpenses
  unreimbursed: number;      // Sum of expenses where needsReimbursement && !reimbursed
}
```

---

### Router 10: dashboard

Pre-aggregated views for the admin panel and member portal.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `getAdminDashboard` | query | ADMIN | Aggregated admin overview |
| `getMemberDashboard` | query | MEMBER | Member's personal season overview |

#### Procedure Details

**dashboard.getAdminDashboard**

```typescript
// Input
z.object({
  seasonId: z.string().uuid().optional(),  // Defaults to active season
})

// Output
{
  season: { id: string; year: number; name: string };

  enrollment: {
    total: number;
    byStatus: Record<ConfirmationStatus, number>;
    confirmedPct: number;
  };

  finances: {
    totalCollected: number;
    duesCollectionRate: number;   // Percentage
    outstandingDues: number;
    topPaymentMethods: Array<{ method: PaymentMethod; total: number }>;
  };

  housing: {
    breakdown: Record<HousingType, number>;
    gridPower: Record<GridFeeType, number>;
  };

  tickets: {
    totalAllocated: number;
    confirmed: number;
    vehiclePasses: number;
  };

  crew: {
    buildCrewCount: number;
    strikeCrewCount: number;
    earlyArrivals: number;
    buildDays: Array<{ name: string; date: Date; assignedCount: number }>;
  };

  pendingActions: {
    pendingApplications: number;
    pendingInventoryRequests: number;
    unreimbursedExpenses: number;
    membersWithoutTickets: number;
    membersWithUnpaidDues: number;
  };
}
```

**dashboard.getMemberDashboard**

```typescript
// Input: none (uses active season)

// Output
{
  season: { year: number; name: string; startDate: Date | null; endDate: Date | null } | null;
  enrolled: boolean;
  seasonMember: {
    confirmationStatus: ConfirmationStatus;
    housingType: HousingType | null;
    gridFeeType: GridFeeType;
    duesPaid: boolean;
    hasTicket: boolean;
    vehiclePass: boolean;
    buildCrew: boolean;
    strikeCrew: boolean;
    arrivalDate: Date | null;
    departureDate: Date | null;
  } | null;
  payments: {
    totalPaid: number;
    totalOwed: number;
    items: Array<{ type: PaymentType; amount: number; paidDate: Date }>;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: Date;
  }>;
}
```

---

### Router 11: applications

Public membership applications for new prospective camp members.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `submit` | mutation | PUBLIC | Submit a membership application |
| `list` | query | ADMIN | List applications with filtering |
| `getById` | query | ADMIN | View a single application |
| `review` | mutation | ADMIN | Accept, reject, or waitlist an application |

#### Procedure Details

**applications.submit**

```typescript
// Input
z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1),
  playaName: z.string().optional(),
  referredBy: z.string().optional(),           // Name of existing member who referred them
  experience: z.string().min(1).max(2000),     // Burning Man experience description
  interests: z.string().optional(),            // What interests them about Camp Alborz
  contribution: z.string().optional(),         // How they plan to contribute
  dietaryRestrictions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  housingPreference: z.nativeEnum(HousingType).optional(),
  message: z.string().max(2000).optional(),    // Additional notes
})

// Output
{
  success: true;
  applicationId: string;
  message: string;
}
```

Applications are stored in a separate `Application` table (or as a JSON document). Returns CONFLICT if an application with the same email already exists and is pending.

**applications.list**

```typescript
// Input
z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WAITLISTED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
})

// Output
{
  applications: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    playaName: string | null;
    referredBy: string | null;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
  }>;
  total: number;
}
```

**applications.getById**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  playaName: string | null;
  referredBy: string | null;
  experience: string;
  interests: string | null;
  contribution: string | null;
  dietaryRestrictions: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  housingPreference: HousingType | null;
  message: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}
```

**applications.review**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  status: z.enum(["ACCEPTED", "REJECTED", "WAITLISTED"]),
  reviewNotes: z.string().optional(),
})

// Output
{
  application: Application;
  member: Member | null;  // Non-null if status === "ACCEPTED" (member record created)
}
```

When `status === "ACCEPTED"`:
1. Creates a Member record from the application data.
2. Generates an invite token.
3. Sends a welcome/invite email.
4. Optionally enrolls them in the active season.

---

### Router 12: announcements

Camp-wide announcements visible to authenticated members.

| Procedure | Type | Permission | Description |
|---|---|---|---|
| `list` | query | MEMBER | List announcements |
| `create` | mutation | ADMIN | Create an announcement |
| `update` | mutation | ADMIN | Edit an announcement |
| `delete` | mutation | ADMIN | Delete an announcement |

#### Procedure Details

**announcements.list**

```typescript
// Input
z.object({
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
})

// Output
Array<{
  id: string;
  title: string;
  content: string;        // Supports markdown
  priority: string;       // LOW, NORMAL, HIGH, URGENT
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}>
```

Ordered by `priority DESC, createdAt DESC`. URGENT announcements always appear first.

**announcements.create**

```typescript
// Input
z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
})

// Output
Announcement
```

**announcements.update**

```typescript
// Input
z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
})

// Output
Announcement
```

**announcements.delete**

```typescript
// Input
z.object({
  id: z.string().uuid(),
})

// Output
{ success: true }
```

---

## Error Handling

### tRPC Error Codes

All procedures use standard tRPC error codes, which map to HTTP status codes:

| tRPC Code | HTTP Status | Usage |
|---|---|---|
| `BAD_REQUEST` | 400 | Invalid input, Zod validation failure, business rule violation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT, expired token, inactive member |
| `FORBIDDEN` | 403 | Insufficient role for the requested procedure |
| `NOT_FOUND` | 404 | Record does not exist |
| `CONFLICT` | 409 | Duplicate email, member already enrolled, unique constraint violation |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled exceptions, database connection errors |

### Error Response Shape

```typescript
{
  error: {
    message: string;
    code: string;           // tRPC error code
    data?: {
      code: string;
      httpStatus: number;
      path: string;         // e.g. "seasonMembers.enroll"
      zodError?: {          // Present for validation errors
        issues: Array<{
          code: string;
          message: string;
          path: string[];
        }>;
      };
    };
  };
}
```

### Error Handling Patterns

**1. Input Validation (Automatic via Zod)**

tRPC automatically validates inputs against Zod schemas before the procedure handler runs. Invalid inputs return `BAD_REQUEST` with a `zodError` payload.

**2. Business Logic Errors (Explicit Throws)**

```typescript
// Pattern: check preconditions, throw typed errors
if (!seasonMember) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Season member not found",
  });
}

if (seasonMember.memberId !== ctx.user.id && ctx.user.role === "MEMBER") {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You can only update your own record",
  });
}
```

**3. Database Errors (Prisma Exception Handling)**

```typescript
try {
  return await ctx.prisma.seasonMember.create({ data: { ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Member is already enrolled in this season",
      });
    }
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to enroll member",
  });
}
```

**4. Consistent Response Pattern**

Mutations that return a simple success indicator use:

```typescript
{ success: true }
```

Mutations that create or update a record return the full record.

Queries that support pagination return:

```typescript
{ items: T[]; total: number }
```

---

## Data Model Reference

### Enums

```prisma
enum MemberRole        { ADMIN, MANAGER, MEMBER }
enum ConfirmationStatus { INTERESTED, MAYBE, CONFIRMED, CANCELLED }
enum HousingType       { TENT, SHIFTPOD, RV, TRAILER, DORM, SHARED, HEXAYURT, OTHER }
enum PreApprovalStatus { YES, MAYBE, NO }
enum PaymentType       { DUES, GRID, FOOD, DONATION, RV_VOUCHER, BEER_FUND, TENT, TICKET, STRIKE_DONATION, FUNDRAISING, OTHER }
enum PaymentMethod     { VENMO, ZELLE, CASH, CARD, PAYPAL, GIVEBUTTER, OTHER }
enum TicketType        { DGS, HOMA, BOOFER, OTHER }
enum InventoryCategory { SHADE, TENT, AC_UNIT, MATTRESS, COT, KITCHEN, BIKE, RUG, OTHER }
enum InventoryRequestStatus { REQUESTED, APPROVED, FULFILLED, DENIED }
enum BudgetCategory    { GENERATOR, FUEL, STORAGE, TRUCKS, SOUND, FOOD, CONTAINERS, BATHROOMS, WATER, GREY_WATER, SHOWERS, DECORATION, TRASH, MISC }
enum GridFeeType       { AMP_30, AMP_50, NONE }
```

### Entity Relationship Summary

```
Season (1) ----< SeasonMember >---- (1) Member
                   |
                   |----< Payment
                   |----< BuildAssignment >---- BuildDay
                   |----< StrikeAssignment
                   |----< EarlyArrivalPass
                   |----< ShiftAssignment >---- Shift
                   |----< InventoryRequest >---- InventoryItem
                   |
                   |---- sharedWith (self-relation for shared housing)

Season (1) ----< Expense
Season (1) ----< BudgetItem
Season (1) ----< BuildDay
Season (1) ----< Ticket >---- Member
Season (1) ----< CommitteeRole >---- Member
```

### Key Constraints

- `SeasonMember` has a unique constraint on `[seasonId, memberId]` -- a member can only be enrolled once per season.
- `BudgetItem` has a unique constraint on `[seasonId, category]` -- one budget line per category per season.
- `BuildAssignment` has a unique constraint on `[buildDayId, seasonMemberId]` -- a member can only be assigned to a build day once.
- `StrikeAssignment` has a unique constraint on `[seasonId, seasonMemberId]` -- a member can only be assigned to strike once per season.
- `Member.email` is globally unique.

---

## Client Integration

### Next.js tRPC Client Setup

```typescript
// packages/web/src/lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@camp-alborz/api";

export const trpc = createTRPCReact<AppRouter>();
```

### Provider Configuration

```typescript
// packages/web/src/app/providers.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes
      retry: 1,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3005/trpc",
      headers() {
        const token = localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

### Usage Examples

```typescript
// Query: list season members
const { data, isLoading } = trpc.seasonMembers.list.useQuery({
  seasonId: currentSeason.id,
  status: "CONFIRMED",
  page: 1,
  limit: 50,
});

// Mutation: record a payment
const createPayment = trpc.payments.create.useMutation({
  onSuccess: () => {
    utils.seasonMembers.getById.invalidate();
    utils.payments.list.invalidate();
  },
});

await createPayment.mutateAsync({
  seasonMemberId: "uuid-here",
  type: "DUES",
  amount: 500,
  method: "VENMO",
  paidAt: new Date().toISOString(),
  paidTo: "Amir",
});

// Member self-service: get my season status
const { data: myStatus } = trpc.seasonMembers.getMySeasonStatus.useQuery({});
```

### Cache Invalidation Strategy

After mutations that affect related data, invalidate the relevant queries:

| Mutation | Invalidate |
|---|---|
| `payments.create` | `seasonMembers.getById`, `payments.list`, `payments.getSummary`, `dashboard.*` |
| `seasonMembers.updateStatus` | `seasonMembers.list`, `seasonMembers.getSummaryStats`, `dashboard.*` |
| `seasonMembers.updateHousing` | `seasonMembers.getById`, `seasonMembers.getSummaryStats` |
| `tickets.allocate` | `tickets.list`, `tickets.getSummary`, `seasonMembers.getById` |
| `build.assignToBuild` | `build.getBuildDays`, `seasonMembers.getById` |
| `members.invite` | `members.list` |
| `applications.review` | `applications.list`, `members.list` (if accepted) |
