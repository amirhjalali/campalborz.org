# Camp Alborz Admin Lead System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the ADMIN role with LEAD, add Excel import/export, enhance the admin console with action items, inline editing, bulk operations, and add a communications system for mass emails and follow-up reminders.

**Architecture:** The system extends the existing tRPC + Prisma + Next.js stack. Schema migration renames ADMIN to LEAD. A new `import` router handles Excel parsing server-side via `xlsx` library. The communications system uses the existing SendGrid/Nodemailer email service with a new `communications` router for email list generation and mass sending. The admin UI gets enhanced with new pages and upgraded existing pages.

**Tech Stack:** Next.js 14 (App Router), tRPC 10, Prisma 5, PostgreSQL, xlsx (SheetJS), SendGrid/Nodemailer, Tailwind CSS, Framer Motion, Lucide React

---

## Phase 1: Schema & Role Migration

### Task 1: Rename ADMIN to LEAD in Prisma Schema

**Files:**
- Modify: `packages/database/prisma/schema.prisma:19-23`

**Step 1: Update the MemberRole enum**

Change line 19-23 from:
```prisma
enum MemberRole {
  ADMIN
  MANAGER
  MEMBER
}
```

To:
```prisma
enum MemberRole {
  LEAD
  MANAGER
  MEMBER
}
```

**Step 2: Create the migration**

Run:
```bash
cd packages/database && npx prisma migrate dev --name rename_admin_to_lead
```

If migration fails due to existing data using ADMIN, create a custom migration:

```sql
-- Rename enum value ADMIN to LEAD
ALTER TYPE "MemberRole" RENAME VALUE 'ADMIN' TO 'LEAD';
```

**Step 3: Regenerate Prisma client**

Run:
```bash
cd packages/database && npx prisma generate
```

**Step 4: Commit**

```bash
git add packages/database/prisma/
git commit -m "feat: rename ADMIN role to LEAD in schema"
```

---

### Task 2: Update tRPC Middleware for LEAD Role

**Files:**
- Modify: `packages/api/src/trpc.ts`

**Step 1: Rename adminProcedure to leadProcedure**

Replace the full file content:

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Requires any authenticated member
export const memberProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Requires LEAD or MANAGER role
export const managerProcedure = memberProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'LEAD' && ctx.user.role !== 'MANAGER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next();
});

// Requires LEAD role
export const leadProcedure = memberProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'LEAD') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Lead access required' });
  }
  return next();
});

// Backwards compat alias — remove once all routers migrated
export const adminProcedure = leadProcedure;
```

**Step 2: Commit**

```bash
git add packages/api/src/trpc.ts
git commit -m "feat: rename adminProcedure to leadProcedure, update role checks"
```

---

### Task 3: Update All API Routers to Use LEAD Role

**Files:**
- Modify: `packages/api/src/router/auth.ts` — change role default from `'MEMBER'` (already correct), update `signAccessToken` to use new role values
- Modify: `packages/api/src/router/members.ts` — change all `z.enum(['ADMIN', 'MANAGER', 'MEMBER'])` to `z.enum(['LEAD', 'MANAGER', 'MEMBER'])`, replace `adminProcedure` imports with `leadProcedure`
- Modify: `packages/api/src/router/seasons.ts` — replace `adminProcedure` with `leadProcedure`
- Modify: `packages/api/src/router/seasonMembers.ts` — replace `adminProcedure` with `leadProcedure`
- Modify: `packages/api/src/router/payments.ts` — no adminProcedure usage (uses managerProcedure), but update any ADMIN role references
- Modify: `packages/api/src/router/invitations.ts` — replace `adminProcedure` with `leadProcedure`
- Modify: `packages/api/src/router/applications.ts` — check for adminProcedure usage
- Modify: `packages/api/src/router/announcements.ts` — check for adminProcedure usage

**Step 1: For each router file, find-and-replace:**

```
adminProcedure → leadProcedure
'ADMIN' → 'LEAD'
```

In import lines:
```typescript
// Before:
import { router, memberProcedure, managerProcedure, adminProcedure } from '../trpc';
// After:
import { router, memberProcedure, managerProcedure, leadProcedure } from '../trpc';
```

In zod enums:
```typescript
// Before:
z.enum(['ADMIN', 'MANAGER', 'MEMBER'])
// After:
z.enum(['LEAD', 'MANAGER', 'MEMBER'])
```

In auth.ts `register` mutation, keep default role as `'MEMBER'` (unchanged).

**Step 2: Verify no remaining ADMIN references**

Run:
```bash
cd packages/api && grep -rn "ADMIN\|adminProcedure" src/ --include="*.ts"
```

The only remaining reference should be the backwards-compat alias in `trpc.ts`.

**Step 3: Commit**

```bash
git add packages/api/src/
git commit -m "feat: migrate all API routers from ADMIN to LEAD role"
```

---

### Task 4: Update Frontend Role References

**Files:**
- Modify: `packages/web/src/app/admin/layout.tsx:79-81,109` — change `ADMIN` to `LEAD` in role checks
- Modify: `packages/web/src/app/admin/members/page.tsx` — update role filter options
- Modify: `packages/web/src/app/admin/members/[id]/page.tsx` — update role dropdown
- Modify: `packages/web/src/lib/adminApi.ts` — update role types/enums
- Modify: `packages/web/src/contexts/AuthContext.tsx` — no change needed (stores role as string)

**Step 1: In admin layout.tsx, update role checks:**

```typescript
// Line 79-81: change
if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
// to
if (user.role !== 'LEAD' && user.role !== 'MANAGER') {

// Line 109: change
if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
// to
if (user.role !== 'LEAD' && user.role !== 'MANAGER') {
```

**Step 2: Update sidebar header text:**

```typescript
// Line 150-152: change
<span className="font-display text-sm tracking-wider text-cream">
  CAMP ALBORZ ADMIN
</span>
// to
<span className="font-display text-sm tracking-wider text-cream">
  CAMP ALBORZ LEAD
</span>
```

**Step 3: Update role dropdowns in member pages:**

Find all instances of `['ADMIN', 'MANAGER', 'MEMBER']` and replace with `['LEAD', 'MANAGER', 'MEMBER']`.

**Step 4: In adminApi.ts, update role types:**

```typescript
// Find any role type definitions and update ADMIN → LEAD
type MemberRole = 'LEAD' | 'MANAGER' | 'MEMBER';
```

**Step 5: Verify no remaining ADMIN references in web**

Run:
```bash
cd packages/web && grep -rn "'ADMIN'" src/ --include="*.tsx" --include="*.ts"
```

**Step 6: Commit**

```bash
git add packages/web/src/
git commit -m "feat: update frontend role references from ADMIN to LEAD"
```

---

## Phase 2: Excel Import System

### Task 5: Add xlsx Dependency

**Step 1: Install xlsx in the API package**

```bash
cd packages/api && npm install xlsx
```

**Step 2: Commit**

```bash
git add packages/api/package.json packages/api/package-lock.json
git commit -m "chore: add xlsx dependency for Excel import"
```

---

### Task 6: Create Excel Import Router

**Files:**
- Create: `packages/api/src/router/import.ts`
- Modify: `packages/api/src/router/index.ts` — register the new router

**Step 1: Create the import router**

Create `packages/api/src/router/import.ts`:

```typescript
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import * as XLSX from 'xlsx';
import { router, leadProcedure } from '../trpc';
import logger from '../lib/logger';

// Column indices for the Alborzians sheet (0-based)
const ALBORZIANS_COLS = {
  confirmed: 0,    // A: Confirmed (Y/Confirmed/blank)
  addToWA: 1,      // B: Add to WA
  name: 2,         // C: Group (actually the name column)
  email: 3,        // D: Email
  duesPaid: 4,     // E: Dues Paid
  grid: 5,         // F: Grid
  housingType: 6,  // G: RV / Tent
  housingSize: 7,  // H: Size
  rideDetails: 9,  // J: Ride Details
  arrival: 10,     // K: Arrival
  departure: 11,   // L: Departure
  dietary: 12,     // M: Dietery Plan
  shifts: 13,      // N: Selected shifts
  preApproval: 14, // O: Pre-Approval Form Y/M
  gender: 15,      // P: Gender
  ticket: 16,      // Q: Ticket
  build: 17,       // R: Build
  strike: 18,      // S: Strike
  alborzVirgin: 19,// T: Alborz Virgin
  bmVirgin: 20,    // U: BM Virgin
  mapObject: 21,   // V: Map Object
};

// Column indices for Dues + Fees Paid sheet
const DUES_COLS = {
  type: 1,    // B: Type
  member: 2,  // C: Member
  date: 3,    // D: DATE
  amount: 4,  // E: Amount
  method: 5,  // F: Method
  notes: 6,   // G: Notes
  paidTo: 7,  // H: Paid to
};

function parseHousingType(val: string | null): string | null {
  if (!val) return null;
  const v = val.toUpperCase().trim();
  if (v.includes('RV')) return 'RV';
  if (v.includes('TENT')) return 'TENT';
  if (v.includes('SHIFT')) return 'SHIFTPOD';
  if (v.includes('TRAILER')) return 'TRAILER';
  if (v.includes('DORM')) return 'DORM';
  if (v.includes('SHARED')) return 'SHARED';
  if (v.includes('HEX')) return 'HEXAYURT';
  if (v) return 'OTHER';
  return null;
}

function parseGender(val: string | null): string | null {
  if (!val) return null;
  const v = val.toUpperCase().trim();
  if (v === 'M' || v === 'MALE') return 'MALE';
  if (v === 'F' || v === 'FEMALE') return 'FEMALE';
  return null;
}

function parsePaymentType(val: string | null): string | null {
  if (!val) return null;
  const v = val.toLowerCase().trim();
  if (v === 'dues') return 'DUES';
  if (v === 'grid') return 'GRID';
  if (v.includes('beer')) return 'BEER_FUND';
  if (v.includes('dorm') || v.includes('food')) return 'FOOD';
  if (v.includes('donation')) return 'DONATION';
  if (v.includes('rv')) return 'RV_VOUCHER';
  if (v.includes('tent')) return 'TENT';
  if (v.includes('ticket')) return 'TICKET';
  if (v.includes('strike')) return 'STRIKE_DONATION';
  if (v.includes('fundrais')) return 'FUNDRAISING';
  return 'OTHER';
}

function parsePaymentMethod(val: string | null): string | null {
  if (!val) return null;
  const v = val.toLowerCase().trim();
  if (v.includes('zelle')) return 'ZELLE';
  if (v.includes('venmo')) return 'VENMO';
  if (v.includes('paypal')) return 'PAYPAL';
  if (v.includes('cash')) return 'CASH';
  if (v.includes('card') || v.includes('credit') || v.includes('debit')) return 'CARD';
  if (v.includes('givebutter')) return 'GIVEBUTTER';
  return 'OTHER';
}

function parseYesNo(val: string | null): boolean {
  if (!val) return false;
  const v = val.toString().toUpperCase().trim();
  return v === 'Y' || v === 'YES' || v === 'CONFIRMED' || v === '1';
}

function parsePreApproval(val: string | null): string | null {
  if (!val) return null;
  const v = val.toUpperCase().trim();
  if (v === 'YES' || v === 'Y') return 'YES';
  if (v === 'MAYBE' || v === 'M') return 'MAYBE';
  if (v === 'NO' || v === 'N') return 'NO';
  return null;
}

function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseStatus(confirmed: string | null): string {
  if (!confirmed) return 'INTERESTED';
  const v = confirmed.toString().toUpperCase().trim();
  if (v === 'Y' || v === 'YES' || v === 'CONFIRMED') return 'CONFIRMED';
  if (v === 'MAYBE' || v === 'M') return 'MAYBE';
  return 'INTERESTED';
}

function cellVal(row: any[], idx: number): string | null {
  const v = row[idx];
  if (v === undefined || v === null || v === '') return null;
  return String(v).trim();
}

export const importRouter = router({
  /** Preview what an Excel import would do without making changes */
  preview: leadProcedure
    .input(z.object({
      fileBase64: z.string().min(1, 'File data is required'),
      seasonId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

      // Parse Alborzians sheet
      const albSheet = workbook.Sheets['Alborzians'];
      if (!albSheet) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No "Alborzians" sheet found in the file' });
      }

      const albData = XLSX.utils.sheet_to_json(albSheet, { header: 1, defval: null }) as any[][];

      const members: { name: string; email: string | null; isNew: boolean }[] = [];
      const existingEmails = new Set<string>();

      // Skip header row
      for (let i = 1; i < albData.length; i++) {
        const row = albData[i];
        const name = cellVal(row, ALBORZIANS_COLS.name);
        const email = cellVal(row, ALBORZIANS_COLS.email);
        if (!name) continue;

        if (email) {
          const normalizedEmail = email.toLowerCase().trim();
          if (existingEmails.has(normalizedEmail)) continue;
          existingEmails.add(normalizedEmail);
        }

        members.push({ name, email, isNew: false });
      }

      // Check which members already exist
      const emailList = members
        .filter(m => m.email)
        .map(m => m.email!.toLowerCase().trim());

      const existingMembers = await ctx.prisma.member.findMany({
        where: { email: { in: emailList } },
        select: { email: true },
      });

      const existingSet = new Set(existingMembers.map(m => m.email));

      for (const m of members) {
        m.isNew = !m.email || !existingSet.has(m.email.toLowerCase().trim());
      }

      // Parse Dues sheet
      const duesSheet = workbook.Sheets['Dues + Fees Paid'];
      let paymentCount = 0;
      if (duesSheet) {
        const duesData = XLSX.utils.sheet_to_json(duesSheet, { header: 1, defval: null }) as any[][];
        for (let i = 1; i < duesData.length; i++) {
          const row = duesData[i];
          const member = cellVal(row, DUES_COLS.member);
          const amount = row[DUES_COLS.amount];
          if (member && amount && typeof amount === 'number' && amount !== 0) {
            paymentCount++;
          }
        }
      }

      return {
        totalMembers: members.length,
        newMembers: members.filter(m => m.isNew).length,
        existingMembers: members.filter(m => !m.isNew).length,
        membersWithoutEmail: members.filter(m => !m.email).length,
        paymentRecords: paymentCount,
        members: members.slice(0, 20), // Preview first 20
      };
    }),

  /** Execute the Excel import */
  execute: leadProcedure
    .input(z.object({
      fileBase64: z.string().min(1, 'File data is required'),
      seasonId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBase64, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      // Parse Alborzians
      const albSheet = workbook.Sheets['Alborzians'];
      if (!albSheet) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No "Alborzians" sheet found' });
      }

      const albData = XLSX.utils.sheet_to_json(albSheet, { header: 1, defval: null }) as any[][];

      let membersCreated = 0;
      let membersUpdated = 0;
      let enrollmentsCreated = 0;
      let paymentsCreated = 0;
      const errors: string[] = [];
      const seenEmails = new Set<string>();

      // Process each member row
      for (let i = 1; i < albData.length; i++) {
        const row = albData[i];
        const name = cellVal(row, ALBORZIANS_COLS.name);
        const email = cellVal(row, ALBORZIANS_COLS.email);

        if (!name) continue;
        if (!email || !email.includes('@')) {
          errors.push(`Row ${i + 1}: "${name}" has no valid email — skipped`);
          continue;
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (seenEmails.has(normalizedEmail)) continue;
        seenEmails.add(normalizedEmail);

        try {
          // Upsert member
          let member = await ctx.prisma.member.findUnique({
            where: { email: normalizedEmail },
          });

          const gender = parseGender(cellVal(row, ALBORZIANS_COLS.gender));
          const dietary = cellVal(row, ALBORZIANS_COLS.dietary);

          if (!member) {
            member = await ctx.prisma.member.create({
              data: {
                email: normalizedEmail,
                name,
                gender: gender as any,
                dietaryRestrictions: dietary,
              },
            });
            membersCreated++;
          } else {
            // Update name if different, don't overwrite existing data
            if (member.name !== name) {
              await ctx.prisma.member.update({
                where: { id: member.id },
                data: { name },
              });
            }
            membersUpdated++;
          }

          // Create or update season enrollment
          const existing = await ctx.prisma.seasonMember.findUnique({
            where: { seasonId_memberId: { seasonId: input.seasonId, memberId: member.id } },
          });

          const housingType = parseHousingType(cellVal(row, ALBORZIANS_COLS.housingType));
          const housingSize = cellVal(row, ALBORZIANS_COLS.housingSize);
          const arrival = parseDate(row[ALBORZIANS_COLS.arrival]);
          const departure = parseDate(row[ALBORZIANS_COLS.departure]);
          const status = parseStatus(cellVal(row, ALBORZIANS_COLS.confirmed));
          const buildCrew = parseYesNo(cellVal(row, ALBORZIANS_COLS.build));
          const strikeCrew = parseYesNo(cellVal(row, ALBORZIANS_COLS.strike));
          const isAlborzVirgin = parseYesNo(cellVal(row, ALBORZIANS_COLS.alborzVirgin));
          const isBMVirgin = parseYesNo(cellVal(row, ALBORZIANS_COLS.bmVirgin));
          const addedToWhatsApp = parseYesNo(cellVal(row, ALBORZIANS_COLS.addToWA));
          const preApproval = parsePreApproval(cellVal(row, ALBORZIANS_COLS.preApproval));
          const mapObject = cellVal(row, ALBORZIANS_COLS.mapObject);
          const rideDetails = cellVal(row, ALBORZIANS_COLS.rideDetails);

          const gridVal = cellVal(row, ALBORZIANS_COLS.grid);
          let gridPower: 'NONE' | 'AMP_30' | 'AMP_50' = 'NONE';
          if (gridVal) {
            // Any grid value means they have grid — default to 30A
            gridPower = 'AMP_30';
          }

          const seasonMemberData = {
            status: status as any,
            housingType: housingType as any,
            housingSize,
            gridPower,
            arrivalDate: arrival,
            departureDate: departure,
            rideDetails,
            buildCrew,
            strikeCrew,
            isAlborzVirgin,
            isBMVirgin,
            addedToWhatsApp,
            preApprovalForm: preApproval as any,
            mapObject,
          };

          if (!existing) {
            await ctx.prisma.seasonMember.create({
              data: {
                seasonId: input.seasonId,
                memberId: member.id,
                ...seasonMemberData,
              },
            });
            enrollmentsCreated++;
          } else {
            await ctx.prisma.seasonMember.update({
              where: { id: existing.id },
              data: seasonMemberData,
            });
          }
        } catch (err: any) {
          errors.push(`Row ${i + 1}: "${name}" — ${err.message}`);
        }
      }

      // Parse Dues + Fees Paid sheet
      const duesSheet = workbook.Sheets['Dues + Fees Paid'];
      if (duesSheet) {
        const duesData = XLSX.utils.sheet_to_json(duesSheet, { header: 1, defval: null }) as any[][];

        for (let i = 1; i < duesData.length; i++) {
          const row = duesData[i];
          const memberName = cellVal(row, DUES_COLS.member);
          const amount = row[DUES_COLS.amount];
          const typeStr = cellVal(row, DUES_COLS.type);
          const methodStr = cellVal(row, DUES_COLS.method);
          const dateVal = row[DUES_COLS.date];
          const notes = cellVal(row, DUES_COLS.notes);
          const paidTo = cellVal(row, DUES_COLS.paidTo);

          if (!memberName || !amount || typeof amount !== 'number' || amount === 0) continue;

          const paymentType = parsePaymentType(typeStr);
          const paymentMethod = parsePaymentMethod(methodStr);
          const paidAt = parseDate(dateVal);

          if (!paymentType || !paymentMethod || !paidAt) continue;

          // Find member by name match (fuzzy)
          const matchedMember = await ctx.prisma.member.findFirst({
            where: {
              OR: [
                { name: { contains: memberName, mode: 'insensitive' } },
                { playaName: { contains: memberName, mode: 'insensitive' } },
              ],
            },
          });

          if (!matchedMember) {
            errors.push(`Payment row ${i + 1}: member "${memberName}" not found — skipped`);
            continue;
          }

          // Find their season enrollment
          const sm = await ctx.prisma.seasonMember.findUnique({
            where: {
              seasonId_memberId: {
                seasonId: input.seasonId,
                memberId: matchedMember.id,
              },
            },
          });

          if (!sm) {
            errors.push(`Payment row ${i + 1}: "${memberName}" not enrolled in season — skipped`);
            continue;
          }

          // Check for duplicate payment (same member, type, amount, date)
          const amountCents = Math.round(Math.abs(amount) * 100);
          const existingPayment = await ctx.prisma.payment.findFirst({
            where: {
              seasonMemberId: sm.id,
              type: paymentType as any,
              amount: amount > 0 ? amountCents : -amountCents,
              paidAt,
            },
          });

          if (existingPayment) continue;

          try {
            await ctx.prisma.payment.create({
              data: {
                seasonMemberId: sm.id,
                type: paymentType as any,
                amount: amount > 0 ? amountCents : -amountCents,
                method: paymentMethod as any,
                paidAt,
                paidTo,
                notes,
                recordedBy: ctx.user.email,
              },
            });
            paymentsCreated++;
          } catch (err: any) {
            errors.push(`Payment row ${i + 1}: "${memberName}" — ${err.message}`);
          }
        }
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          memberId: ctx.user.id,
          action: 'EXCEL_IMPORT',
          entityType: 'Season',
          entityId: input.seasonId,
          details: {
            membersCreated,
            membersUpdated,
            enrollmentsCreated,
            paymentsCreated,
            errors: errors.length,
          },
        },
      });

      logger.info(`Excel import by ${ctx.user.email}: ${membersCreated} created, ${membersUpdated} updated, ${enrollmentsCreated} enrolled, ${paymentsCreated} payments`);

      return {
        membersCreated,
        membersUpdated,
        enrollmentsCreated,
        paymentsCreated,
        errors,
      };
    }),
});
```

**Step 2: Register the import router**

In `packages/api/src/router/index.ts`, add:

```typescript
import { importRouter } from './import';

// Add to the router object:
import: importRouter,
```

**Step 3: Commit**

```bash
git add packages/api/src/router/import.ts packages/api/src/router/index.ts
git commit -m "feat: add Excel import router with Alborzians and payments parsing"
```

---

### Task 7: Create Excel Export Router

**Files:**
- Create: `packages/api/src/router/export.ts`
- Modify: `packages/api/src/router/index.ts`

**Step 1: Create the export router**

Create `packages/api/src/router/export.ts`:

```typescript
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import * as XLSX from 'xlsx';
import { router, leadProcedure } from '../trpc';

export const exportRouter = router({
  /** Export season data as Excel file (base64) */
  season: leadProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      const seasonMembers = await ctx.prisma.seasonMember.findMany({
        where: { seasonId: input.seasonId },
        include: {
          member: true,
          payments: { orderBy: { paidAt: 'desc' } },
        },
        orderBy: { member: { name: 'asc' } },
      });

      // Build Alborzians sheet
      const albHeaders = [
        'Confirmed', 'Add to WA', 'Name', 'Email', 'Dues Paid', 'Grid',
        'RV / Tent', 'Size', '', 'Ride Details', 'Arrival', 'Departure',
        'Dietary Plan', 'Selected Shifts', 'Pre-Approval Form', 'Gender',
        'Ticket', 'Build', 'Strike', 'Alborz Virgin', 'BM Virgin', 'Map Object',
      ];

      const albRows = seasonMembers.map(sm => {
        const totalPaid = sm.payments
          .filter(p => p.type === 'DUES')
          .reduce((sum, p) => sum + p.amount, 0);

        return [
          sm.status === 'CONFIRMED' ? 'Y' : '',
          sm.addedToWhatsApp ? 'Y' : '',
          sm.member.name,
          sm.member.email,
          totalPaid > 0 ? 'Y' : '',
          sm.gridPower !== 'NONE' ? sm.gridPower : '',
          sm.housingType || '',
          sm.housingSize || '',
          '',
          sm.rideDetails || '',
          sm.arrivalDate || '',
          sm.departureDate || '',
          sm.member.dietaryRestrictions || '',
          '',
          sm.preApprovalForm || '',
          sm.member.gender === 'MALE' ? 'M' : sm.member.gender === 'FEMALE' ? 'F' : '',
          '',
          sm.buildCrew ? 'Y' : '',
          sm.strikeCrew ? 'Y' : '',
          sm.isAlborzVirgin ? 'Y' : 'N',
          sm.isBMVirgin ? 'Y' : 'N',
          sm.mapObject || '',
        ];
      });

      // Build Dues sheet
      const duesHeaders = ['', 'Type', 'Member', 'DATE', 'Amount', 'Method', 'Notes', 'Paid to'];
      const allPayments = seasonMembers.flatMap(sm =>
        sm.payments.map((p, idx) => [
          idx + 1,
          p.type,
          sm.member.name,
          p.paidAt,
          p.amount / 100, // Convert cents back to dollars
          p.method,
          p.notes || '',
          p.paidTo || '',
        ])
      );

      const wb = XLSX.utils.book_new();

      const albWs = XLSX.utils.aoa_to_sheet([albHeaders, ...albRows]);
      XLSX.utils.book_append_sheet(wb, albWs, 'Alborzians');

      const duesWs = XLSX.utils.aoa_to_sheet([duesHeaders, ...allPayments]);
      XLSX.utils.book_append_sheet(wb, duesWs, 'Dues + Fees Paid');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        filename: `${season.name.replace(/\s+/g, '_')}_export.xlsx`,
        base64,
      };
    }),

  /** Export email list for a filtered set of members */
  emailList: leadProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      status: z.enum(['INTERESTED', 'MAYBE', 'CONFIRMED', 'WAITLISTED', 'CANCELLED']).optional(),
      filter: z.enum([
        'all', 'unpaid_dues', 'no_ticket', 'not_on_whatsapp',
        'build_crew', 'strike_crew', 'virgins', 'no_preapproval',
      ]).optional().default('all'),
    }))
    .mutation(async ({ ctx, input }) => {
      const where: any = { seasonId: input.seasonId };
      if (input.status) where.status = input.status;

      switch (input.filter) {
        case 'build_crew':
          where.buildCrew = true;
          break;
        case 'strike_crew':
          where.strikeCrew = true;
          break;
        case 'not_on_whatsapp':
          where.addedToWhatsApp = false;
          break;
        case 'virgins':
          where.OR = [{ isAlborzVirgin: true }, { isBMVirgin: true }];
          break;
        case 'no_preapproval':
          where.OR = [{ preApprovalForm: null }, { preApprovalForm: 'NO' }];
          break;
      }

      const seasonMembers = await ctx.prisma.seasonMember.findMany({
        where,
        include: {
          member: { select: { name: true, email: true } },
          payments: { where: { type: 'DUES' }, select: { amount: true } },
        },
      });

      let filtered = seasonMembers;

      if (input.filter === 'unpaid_dues') {
        const season = await ctx.prisma.season.findUnique({
          where: { id: input.seasonId },
          select: { duesAmount: true },
        });
        if (season) {
          filtered = seasonMembers.filter(sm => {
            const paid = sm.payments.reduce((sum, p) => sum + p.amount, 0);
            return paid < season.duesAmount;
          });
        }
      }

      if (input.filter === 'no_ticket') {
        const tickets = await ctx.prisma.ticket.findMany({
          where: { seasonId: input.seasonId },
          select: { memberId: true },
        });
        const memberIdsWithTicket = new Set(tickets.map(t => t.memberId));
        filtered = seasonMembers.filter(sm => !memberIdsWithTicket.has(sm.memberId));
      }

      const emails = filtered.map(sm => ({
        name: sm.member.name,
        email: sm.member.email,
      }));

      return {
        count: emails.length,
        emails,
        csvString: emails.map(e => `${e.name},${e.email}`).join('\n'),
        emailOnly: emails.map(e => e.email).join(', '),
      };
    }),
});
```

**Step 2: Register in index.ts**

Add `import { exportRouter } from './export';` and `export: exportRouter` to the router object.

**Step 3: Commit**

```bash
git add packages/api/src/router/export.ts packages/api/src/router/index.ts
git commit -m "feat: add Excel export and email list generation routers"
```

---

## Phase 3: Season Rollover

### Task 8: Add Season Rollover to Seasons Router

**Files:**
- Modify: `packages/api/src/router/seasons.ts`

**Step 1: Add rollover mutation after the existing `activate` mutation**

```typescript
rollover: leadProcedure
  .input(z.object({
    fromSeasonId: z.string().uuid(),
    year: z.number().int().min(2020).max(2100),
    name: z.string().min(1),
    duesAmount: z.number().int().min(0),
    gridFee30amp: z.number().int().min(0),
    gridFee50amp: z.number().int().min(0),
    memberFilter: z.enum(['all_active', 'confirmed_only', 'custom']).default('all_active'),
    memberIds: z.array(z.string().uuid()).optional(), // For 'custom' filter
  }))
  .mutation(async ({ ctx, input }) => {
    // Check source season exists
    const fromSeason = await ctx.prisma.season.findUnique({
      where: { id: input.fromSeasonId },
    });
    if (!fromSeason) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Source season not found' });
    }

    // Check target year doesn't exist
    const existingYear = await ctx.prisma.season.findUnique({
      where: { year: input.year },
    });
    if (existingYear) {
      throw new TRPCError({ code: 'CONFLICT', message: `Season ${input.year} already exists` });
    }

    // Create new season
    const newSeason = await ctx.prisma.season.create({
      data: {
        year: input.year,
        name: input.name,
        duesAmount: input.duesAmount,
        gridFee30amp: input.gridFee30amp,
        gridFee50amp: input.gridFee50amp,
      },
    });

    // Get members to carry over
    let whereClause: any = { seasonId: input.fromSeasonId };

    if (input.memberFilter === 'confirmed_only') {
      whereClause.status = 'CONFIRMED';
    } else if (input.memberFilter === 'custom' && input.memberIds) {
      whereClause.memberId = { in: input.memberIds };
    }
    // 'all_active' — carry all non-cancelled

    if (input.memberFilter !== 'custom') {
      whereClause.status = { not: 'CANCELLED' };
    }

    const sourceMembers = await ctx.prisma.seasonMember.findMany({
      where: whereClause,
      select: { memberId: true },
    });

    // Bulk create enrollments as INTERESTED
    if (sourceMembers.length > 0) {
      await ctx.prisma.seasonMember.createMany({
        data: sourceMembers.map(sm => ({
          seasonId: newSeason.id,
          memberId: sm.memberId,
          status: 'INTERESTED' as const,
        })),
        skipDuplicates: true,
      });
    }

    // Audit log
    await ctx.prisma.auditLog.create({
      data: {
        memberId: ctx.user.id,
        action: 'SEASON_ROLLOVER',
        entityType: 'Season',
        entityId: newSeason.id,
        details: {
          fromSeasonId: input.fromSeasonId,
          fromYear: fromSeason.year,
          membersCarried: sourceMembers.length,
          filter: input.memberFilter,
        },
      },
    });

    return {
      season: newSeason,
      membersEnrolled: sourceMembers.length,
    };
  }),
```

**Step 2: Commit**

```bash
git add packages/api/src/router/seasons.ts
git commit -m "feat: add season rollover mutation for carrying members to new season"
```

---

## Phase 4: Communications System

### Task 9: Create Communications Router

**Files:**
- Create: `packages/api/src/router/communications.ts`
- Modify: `packages/api/src/router/index.ts`

**Step 1: Create the communications router**

Create `packages/api/src/router/communications.ts`:

```typescript
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, leadProcedure, managerProcedure } from '../trpc';
import { sendMassEmail } from '../lib/email';
import logger from '../lib/logger';

export const communicationsRouter = router({
  /** Get action items / reminders for the current season */
  getActionItems: managerProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
        select: { duesAmount: true },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      const [
        allMembers,
        notOnWhatsApp,
        noPreApproval,
        pendingApplications,
      ] = await Promise.all([
        ctx.prisma.seasonMember.findMany({
          where: { seasonId: input.seasonId, status: { not: 'CANCELLED' } },
          include: {
            member: { select: { id: true, name: true, email: true } },
            payments: { where: { type: 'DUES' }, select: { amount: true } },
          },
        }),
        ctx.prisma.seasonMember.count({
          where: { seasonId: input.seasonId, addedToWhatsApp: false, status: { not: 'CANCELLED' } },
        }),
        ctx.prisma.seasonMember.count({
          where: {
            seasonId: input.seasonId,
            status: { not: 'CANCELLED' },
            OR: [{ preApprovalForm: null }, { preApprovalForm: 'NO' }],
          },
        }),
        ctx.prisma.application.count({
          where: { status: 'PENDING' },
        }),
      ]);

      // Calculate unpaid dues
      const unpaidDues = allMembers.filter(sm => {
        if (sm.status === 'CANCELLED') return false;
        const paid = sm.payments.reduce((sum, p) => sum + p.amount, 0);
        return paid < season.duesAmount;
      });

      // Get members without tickets
      const tickets = await ctx.prisma.ticket.findMany({
        where: { seasonId: input.seasonId },
        select: { memberId: true },
      });
      const memberIdsWithTicket = new Set(tickets.map(t => t.memberId));
      const noTicket = allMembers.filter(sm => !memberIdsWithTicket.has(sm.memberId));

      return {
        unpaidDues: { count: unpaidDues.length, members: unpaidDues.map(sm => ({ id: sm.member.id, name: sm.member.name, email: sm.member.email })) },
        noTicket: { count: noTicket.length },
        notOnWhatsApp: { count: notOnWhatsApp },
        noPreApproval: { count: noPreApproval },
        pendingApplications: { count: pendingApplications },
      };
    }),

  /** Send a mass email to a filtered group */
  sendMassEmail: leadProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      subject: z.string().min(1).max(200),
      body: z.string().min(1).max(10000),
      recipientFilter: z.enum([
        'all', 'confirmed', 'unpaid_dues', 'build_crew', 'strike_crew',
        'not_on_whatsapp', 'no_preapproval', 'no_ticket', 'custom',
      ]),
      customEmails: z.array(z.string().email()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let recipients: { name: string; email: string }[] = [];

      if (input.recipientFilter === 'custom' && input.customEmails) {
        const members = await ctx.prisma.member.findMany({
          where: { email: { in: input.customEmails } },
          select: { name: true, email: true },
        });
        recipients = members;
      } else {
        const where: any = { seasonId: input.seasonId, status: { not: 'CANCELLED' } };

        if (input.recipientFilter === 'confirmed') where.status = 'CONFIRMED';
        if (input.recipientFilter === 'build_crew') where.buildCrew = true;
        if (input.recipientFilter === 'strike_crew') where.strikeCrew = true;
        if (input.recipientFilter === 'not_on_whatsapp') where.addedToWhatsApp = false;
        if (input.recipientFilter === 'no_preapproval') {
          where.OR = [{ preApprovalForm: null }, { preApprovalForm: 'NO' }];
        }

        const seasonMembers = await ctx.prisma.seasonMember.findMany({
          where,
          include: {
            member: { select: { name: true, email: true } },
            payments: input.recipientFilter === 'unpaid_dues'
              ? { where: { type: 'DUES' }, select: { amount: true } }
              : undefined,
          },
        });

        if (input.recipientFilter === 'unpaid_dues') {
          const season = await ctx.prisma.season.findUnique({
            where: { id: input.seasonId },
            select: { duesAmount: true },
          });
          if (season) {
            recipients = seasonMembers
              .filter(sm => {
                const paid = (sm.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
                return paid < season.duesAmount;
              })
              .map(sm => ({ name: sm.member.name, email: sm.member.email }));
          }
        } else if (input.recipientFilter === 'no_ticket') {
          const tickets = await ctx.prisma.ticket.findMany({
            where: { seasonId: input.seasonId },
            select: { memberId: true },
          });
          const withTicket = new Set(tickets.map(t => t.memberId));
          recipients = seasonMembers
            .filter(sm => !withTicket.has(sm.memberId))
            .map(sm => ({ name: sm.member.name, email: sm.member.email }));
        } else {
          recipients = seasonMembers.map(sm => ({
            name: sm.member.name,
            email: sm.member.email,
          }));
        }
      }

      if (recipients.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No recipients match the selected filter' });
      }

      // Send emails
      const results = await sendMassEmail(
        recipients,
        input.subject,
        input.body,
        ctx.user.name,
      );

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          memberId: ctx.user.id,
          action: 'MASS_EMAIL_SENT',
          entityType: 'Communication',
          entityId: input.seasonId,
          details: {
            subject: input.subject,
            filter: input.recipientFilter,
            recipientCount: recipients.length,
            sent: results.sent,
            failed: results.failed,
          },
        },
      });

      logger.info(`Mass email sent by ${ctx.user.email}: "${input.subject}" to ${results.sent} recipients`);

      return results;
    }),
});
```

**Step 2: Add sendMassEmail to the email service**

In `packages/api/src/lib/email.ts`, add this function:

```typescript
export async function sendMassEmail(
  recipients: { name: string; email: string }[],
  subject: string,
  body: string,
  senderName: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  const htmlBody = layout(`
    ${heading(subject)}
    ${body.split('\n').map(line => paragraph(line)).join('')}
    ${smallText(`Sent by ${senderName} on behalf of Camp Alborz`)}
  `);

  for (const recipient of recipients) {
    try {
      await sendEmail(recipient.email, subject, htmlBody);
      sent++;
    } catch (err: any) {
      failed++;
      errors.push(`${recipient.email}: ${err.message}`);
    }
  }

  return { sent, failed, errors };
}
```

**Step 3: Register in index.ts**

Add `import { communicationsRouter } from './communications';` and `communications: communicationsRouter` to the router.

**Step 4: Commit**

```bash
git add packages/api/src/router/communications.ts packages/api/src/router/index.ts packages/api/src/lib/email.ts
git commit -m "feat: add communications router with action items and mass email"
```

---

## Phase 5: Enhanced Admin UI

### Task 10: Create Import/Export Admin Page

**Files:**
- Create: `packages/web/src/app/admin/import/page.tsx`

**Step 1: Create the import/export page**

This page allows LEADs to:
- Upload an Excel file and preview what will be imported
- Execute the import
- Export current season data to Excel
- Generate filtered email lists

The page should have two tabs: "Import" and "Export".

**Import tab:**
- File upload dropzone (accept .xlsx/.xls)
- On file select: calls `import.preview` to show what will happen
- Preview table: member count, new vs existing, payments found
- "Execute Import" button calls `import.execute`
- Results display: created/updated/enrolled/payments/errors

**Export tab:**
- "Export Season to Excel" button — downloads the generated file
- Email list generator with filter dropdown (all, unpaid dues, no ticket, etc.)
- Shows resulting email list with copy-to-clipboard

The page should use the existing `luxury-card` and `form-input` styles. Use `useAdminSeason` context for the selected season.

**Step 2: Commit**

```bash
git add packages/web/src/app/admin/import/page.tsx
git commit -m "feat: add admin import/export page with Excel upload and email list generation"
```

---

### Task 11: Create Season Management Page

**Files:**
- Create: `packages/web/src/app/admin/season/page.tsx`

**Step 1: Create the season management page**

This page allows LEADs to:
- View all seasons in a table with year, name, status (active badge), member count
- Create new season form: year, name, dues, grid fees, dates
- Activate a season (with confirmation dialog)
- Rollover wizard: select source season, pick member filter, set new season details
- Edit season details inline

Use `ConfirmDialog` for activate/rollover confirmations. Show season dates as editable date inputs. Show financial summary for each season.

**Step 2: Commit**

```bash
git add packages/web/src/app/admin/season/page.tsx
git commit -m "feat: add admin season management page with create, activate, and rollover"
```

---

### Task 12: Create Communications Page

**Files:**
- Create: `packages/web/src/app/admin/communications/page.tsx`

**Step 1: Create the communications page**

This page shows:
- **Action Items section** — cards showing counts for: unpaid dues, no ticket, not on WhatsApp, no pre-approval form, pending applications. Each card is clickable and expands to show the member list.
- **Mass Email section** — recipient filter dropdown, subject line, rich text body (textarea with markdown preview), send button with confirmation dialog showing recipient count
- **Email List Generator** — filter dropdown, shows list of emails with copy-all button
- **Communication Log** — recent mass emails sent (from audit log), showing date, subject, recipient count, sent by

**Step 2: Commit**

```bash
git add packages/web/src/app/admin/communications/page.tsx
git commit -m "feat: add admin communications page with action items and mass email"
```

---

### Task 13: Enhance Admin Dashboard with Action Items Bar

**Files:**
- Modify: `packages/web/src/app/admin/page.tsx`

**Step 1: Add action items bar at the top of the dashboard**

After the page header and before the stat cards, add an action items section that calls `communications.getActionItems`. Display as a horizontal scrollable row of small cards:

```
[12 Unpaid Dues →] [5 No Pre-Approval →] [3 Pending Apps →] [8 Not on WhatsApp →]
```

Each card links to the relevant admin page (communications page for most, applications page for pending apps).

**Step 2: Add season timeline visualization**

Below the stat cards, add a horizontal progress bar showing the season phases:
`SOI → Ticketing → Dues → Build → BURN → Strike → Post-Playa`

Highlight the current phase based on dates in the season record.

**Step 3: Commit**

```bash
git add packages/web/src/app/admin/page.tsx
git commit -m "feat: enhance admin dashboard with action items bar and season timeline"
```

---

### Task 14: Enhance Members Page with Bulk Actions and Inline Editing

**Files:**
- Modify: `packages/web/src/app/admin/members/page.tsx`

**Step 1: Add smart filter presets**

Add preset filter buttons above the search bar:
- "Hasn't Paid Dues"
- "No Ticket"
- "Not on WhatsApp"
- "Build Crew"
- "Alborz Virgins"

These set the appropriate filter params.

**Step 2: Add bulk actions toolbar**

When members are selected via checkboxes:
- Show a floating toolbar at the bottom: "N selected | Change Status ▾ | Export Emails | Assign Build Day ▾"
- "Change Status" opens a dropdown with status options
- "Export Emails" copies selected member emails to clipboard

**Step 3: Add inline status editing**

Make the status column a clickable dropdown — clicking it opens a small select that updates the status via `seasonMembers.updateStatus`.

**Step 4: Commit**

```bash
git add packages/web/src/app/admin/members/page.tsx
git commit -m "feat: enhance members page with smart filters, bulk actions, and inline editing"
```

---

### Task 15: Add Quick Payment Recording

**Files:**
- Modify: `packages/web/src/app/admin/members/page.tsx` (or create a shared component)
- Modify: `packages/web/src/lib/adminApi.ts`

**Step 1: Add "Record Payment" floating action button**

Add a FAB in the bottom-right corner of the admin layout that opens a slide-over panel:
- Member search/dropdown (searchable, shows name + email)
- Amount input (auto-formats as currency)
- Type dropdown (DUES, GRID, FOOD, etc.)
- Method dropdown (VENMO, ZELLE, CASH, etc.)
- Date picker (defaults to today)
- Notes textarea (optional)
- Submit button

This should be accessible from any admin page.

**Step 2: Add to adminApi.ts**

Ensure `recordPayment` function exists and works with the current API.

**Step 3: Commit**

```bash
git add packages/web/src/app/admin/ packages/web/src/lib/adminApi.ts
git commit -m "feat: add quick payment recording FAB accessible from all admin pages"
```

---

### Task 16: Update Admin Sidebar Navigation

**Files:**
- Modify: `packages/web/src/app/admin/layout.tsx`

**Step 1: Update sidebar items array**

```typescript
const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Season', href: '/admin/season', icon: Calendar },
  { label: 'Housing', href: '/admin/housing', icon: Home },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Tickets & DGS', href: '/admin/tickets', icon: Ticket },
  { label: 'Build & Strike', href: '/admin/build', icon: Hammer },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Budget', href: '/admin/budget', icon: PieChart },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Communications', href: '/admin/communications', icon: Mail },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Import / Export', href: '/admin/import', icon: Upload },
];
```

Add `Mail, Upload` to the lucide-react import.

**Step 2: Update sidebar header**

Change "CAMP ALBORZ ADMIN" to "CAMP ALBORZ LEAD" (already done in Task 4 if following order).

**Step 3: Update role checks**

Ensure `LEAD` and `MANAGER` can access admin layout (already done in Task 4).

**Step 4: Commit**

```bash
git add packages/web/src/app/admin/layout.tsx
git commit -m "feat: update admin sidebar with communications and import/export links"
```

---

## Phase 6: Verification & Testing

### Task 17: Build Verification

**Step 1: Run TypeScript type check**

```bash
cd packages/api && npx tsc --noEmit
```

Expected: No type errors.

**Step 2: Run web build**

```bash
cd packages/web && npm run build
```

Expected: Build succeeds.

**Step 3: Run linting**

```bash
cd packages/web && npm run lint
```

Expected: No lint errors (warnings OK).

**Step 4: Run existing tests**

```bash
cd packages/api && npm test
```

Expected: All existing tests pass.

**Step 5: Fix any issues found**

Address build/type/lint errors from the migration.

**Step 6: Final commit**

```bash
git add -A
git commit -m "fix: resolve build and type errors from admin lead system migration"
```

---

## Execution Order Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-4 | Schema & role migration (ADMIN → LEAD) |
| 2 | 5-7 | Excel import/export system |
| 3 | 8 | Season rollover |
| 4 | 9 | Communications system |
| 5 | 10-16 | Enhanced admin UI |
| 6 | 17 | Build verification |

**Dependencies:**
- Phase 1 must complete first (everything depends on LEAD role)
- Phase 2-4 can run in parallel after Phase 1
- Phase 5 depends on Phase 2-4 (UI calls the new API routes)
- Phase 6 runs last

**Estimated commits:** 17 commits across 6 phases
