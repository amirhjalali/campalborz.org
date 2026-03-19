# Comprehensive Sweep Phase 2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all remaining production gaps — test coverage for 9 untested routers (~2,800 lines), GiveButter donation integration, Playwright E2E infrastructure, route-level loading states, and donation receipt emails.

**Architecture:** Six parallel workstreams targeting non-overlapping files. Each workstream runs in an isolated worktree to avoid merge conflicts. Tests follow existing patterns in auth.test.ts (mock Prisma, create tRPC caller, test happy + error paths).

**Tech Stack:** Jest (unit/integration), Playwright (E2E), Next.js 14 App Router, tRPC, Prisma, GiveButter embed API

---

## Workstream A: GiveButter Donation Integration

### Task A1: Replace DonationForm with GiveButter Embed
**Files:**
- Modify: `packages/web/src/app/donate/page.tsx`
- Modify: `packages/web/src/components/donation/DonationForm.tsx`
- Modify: `config/content.config.ts`

Replace the demo `handleDemoPayment` with an embedded GiveButter widget. The donate page already links to `https://givebutter.com/Alborz2025Fundraiser`. Embed the GiveButter script widget instead of the custom multi-step form.

### Task A2: Add Donation Receipt Email Template
**Files:**
- Modify: `packages/api/src/lib/email.ts`

Add `sendDonationReceipt()` function following the existing email template pattern (branded HTML, table layout). Include: donor name, amount, date, EIN, tax-deductible statement.

---

## Workstream B: Test Coverage — Large Routers (events, import, export)

### Task B1: events.ts tests (588 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/events.test.ts`

Test: list, getById, listUpcoming, create, update, delete, rsvp, cancelRsvp, assignVolunteer, removeVolunteer, updateAssignmentStatus, getMyEvents. ~40 tests.

### Task B2: import.ts tests (669 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/import.test.ts`

Test: importMembers, importSeasonMembers, importPayments, importEvents. Test Excel parsing, validation, fuzzy name matching, deduplication, error handling, file size limits. ~30 tests.

### Task B3: export.ts tests (378 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/export.test.ts`

Test: exportMembers, exportSeasonMembers, exportPayments, exportEvents. Test data formatting, authorization, filtering. ~20 tests.

---

## Workstream C: Test Coverage — Member Lifecycle Routers

### Task C1: invitations.ts tests (362 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/invitations.test.ts`

Test: create, bulkCreate, validate, listPending, resend, revoke. Test token generation, expiration, authorization. ~25 tests.

### Task C2: seasonMembers.ts tests (247 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/seasonMembers.test.ts`

Test: list, getById, enroll, bulkEnroll, updateStatus, updateHousing, getMySeasonStatus, updateMyArrival. ~20 tests.

### Task C3: seasons.ts tests (228 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/seasons.test.ts`

Test: list, getById, create, update, setActive, getActive. ~15 tests.

---

## Workstream D: Test Coverage — Admin Routers

### Task D1: announcements.ts tests (187 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/announcements.test.ts`

Test: list, getById, create, update, delete. Test priority, expiration, authorization. ~15 tests.

### Task D2: communications.ts tests (279 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/communications.test.ts`

Test: getActionItems, sendMassEmail. Test email delivery, filtering, authorization. ~15 tests.

### Task D3: dashboard.ts tests (149 lines)
**Files:**
- Create: `packages/api/src/__tests__/router/dashboard.test.ts`

Test: getStats, getActivityTimeline, getSummaryCounts. Test data aggregation, authorization. ~10 tests.

---

## Workstream E: Playwright E2E Infrastructure + Core Tests

### Task E1: Set up Playwright config
**Files:**
- Create: `packages/web/playwright.config.ts`
- Create: `packages/web/e2e/home.spec.ts`
- Create: `packages/web/e2e/navigation.spec.ts`
- Create: `packages/web/e2e/donate.spec.ts`

Configure Playwright for Next.js, add basic public page tests (homepage loads, navigation works, donate page renders, search works).

---

## Workstream F: Loading States + Route Polish

### Task F1: Add loading.tsx at key route levels
**Files:**
- Create: `packages/web/src/app/loading.tsx`
- Create: `packages/web/src/app/admin/loading.tsx`
- Create: `packages/web/src/app/portal/loading.tsx`
- Create: `packages/web/src/app/members/loading.tsx`

Each loading.tsx shows a skeleton/spinner matching the site's design system (Cinzel font, sage/cream colors, ornate-divider animation).

---

## Execution Order

All 6 workstreams are independent and can run in parallel:
- A: GiveButter + receipt email (donate page, email.ts)
- B: Tests for events, import, export (new test files only)
- C: Tests for invitations, seasonMembers, seasons (new test files only)
- D: Tests for announcements, communications, dashboard (new test files only)
- E: Playwright E2E setup (new config + e2e/ directory)
- F: Loading states (new loading.tsx files)
