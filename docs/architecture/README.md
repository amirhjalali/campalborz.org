# Camp Alborz Member Management System - Architecture

## Overview

This document describes the architecture for Camp Alborz's member management system, replacing the current Excel-based workflow with a web application at campalborz.org.

**Status:** Architecture Phase (not yet implemented)
**Season:** 2026 Burning Man
**Camp Size:** ~130-165 members

## Problem Statement

Camp Alborz currently manages all camp operations through a massive Excel spreadsheet ("Alborz Master Document") with 15 sheets covering membership, payments, housing, build/strike crews, inventory, budgets, and more. The existing website has:

- A broken backend with 35+ unused SaaS routers
- Demo-mode authentication (hardcoded `DEMO_MODE = true`)
- A Prisma schema that doesn't match the API code
- Non-functional admin dashboard with hardcoded mock data
- An application form that catches errors and returns `{ ok: true }` anyway

The public-facing pages (homepage, about, art cars, events, culture, donate) are well-designed and should be preserved.

## Architecture Decision Records

### ADR-1: Single-Camp Architecture
**Decision:** Remove all multi-tenant SaaS scaffolding. This is a single-camp system.
**Rationale:** Camp Alborz is the only tenant. Multi-tenant adds complexity with zero benefit.

### ADR-2: Season-Based Data Model
**Decision:** Use a `Season` + `SeasonMember` junction pattern where each year is a fresh cycle.
**Rationale:** Members re-confirm each season. Season-specific data (housing, dues, arrival dates) changes yearly. Past season data should be preserved for history.

### ADR-3: Payment Tracking, Not Processing
**Decision:** The app tracks payments made externally (Zelle, Venmo, PayPal, Givebutter). It does NOT process payments.
**Rationale:** Camp already uses established payment channels. Members pay via Zelle/Venmo, admin records the payment in the system.

### ADR-4: Invite-Only Registration
**Decision:** No open registration. Admins invite members by email, members set their password via invite link.
**Rationale:** Camp Alborz is a curated community. New members apply via /apply, are reviewed, and if accepted get invited.

### ADR-5: Three-Tier Role System
**Decision:** ADMIN > MANAGER > MEMBER permission hierarchy.
**Rationale:**
- ADMIN (camp lead): Full access to everything
- MANAGER (department leads): Can view all members, record payments, manage their area
- MEMBER: Can view/update own profile, season info, and payment history

### ADR-6: Preserve Public-Facing Design
**Decision:** Keep all existing public pages and the design system intact.
**Rationale:** The public site is polished with a Persian-modern aesthetic. Only rebuild the authenticated/admin sections.

## System Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│              Next.js 14 (App Router)          │
│                                               │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐│
│  │  Public   │ │  Member   │ │    Admin     ││
│  │  Pages    │ │  Portal   │ │  Dashboard   ││
│  │ (KEEP)    │ │ (NEW)     │ │  (NEW)       ││
│  └──────────┘ └───────────┘ └──────────────┘│
│                     │                         │
│              ┌──────┴──────┐                  │
│              │  tRPC Client │                  │
│              └──────┬──────┘                  │
└─────────────────────┼─────────────────────────┘
                      │ HTTP/JSON
┌─────────────────────┼─────────────────────────┐
│                  Backend                       │
│             Express.js + tRPC                  │
│                                               │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐│
│  │ Auth │ │Members │ │Payments│ │ Seasons  ││
│  │Router│ │ Router │ │ Router │ │  Router  ││
│  └──────┘ └────────┘ └────────┘ └──────────┘│
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐│
│  │Build │ │Tickets │ │Finance │ │Inventory ││
│  │Router│ │ Router │ │ Router │ │  Router  ││
│  └──────┘ └────────┘ └────────┘ └──────────┘│
│  ┌────────────┐ ┌──────────┐ ┌─────────────┐│
│  │Applications│ │Dashboard │ │Announcements││
│  │   Router   │ │  Router  │ │   Router    ││
│  └────────────┘ └──────────┘ └─────────────┘│
│                     │                         │
│              ┌──────┴──────┐                  │
│              │  Prisma ORM  │                  │
│              └──────┬──────┘                  │
└─────────────────────┼─────────────────────────┘
                      │
               ┌──────┴──────┐
               │  PostgreSQL  │
               └─────────────┘
```

## Core Data Model

The heart of the system is the **SeasonMember** entity - the junction between Member and Season that holds all season-specific data.

```
Member ──── 1:N ──── SeasonMember ──── N:1 ──── Season
                          │
                    ┌─────┼─────┐
                    │     │     │
                Payment  Build  Housing
                         Strike  Grid
                         Shifts  Equipment
```

## Key Workflows

### 1. New Season Setup (Admin)
1. Create new Season (set year, dues amount, grid fees, dates)
2. Bulk-enroll returning members from previous season
3. Set all to INTERESTED status
4. Members self-confirm or admin updates status
5. Collect dues and record payments

### 2. New Member Onboarding
1. Prospect submits application via /apply
2. Admin reviews application (/admin/applications)
3. If accepted: Admin creates Member + sends invite email
4. Member clicks invite link, sets password
5. Admin enrolls member in current season
6. Member logs in, fills in season details (housing, arrival, etc.)

### 3. Payment Collection
1. Member sees what they owe in /portal/payments
2. Member pays via Zelle/Venmo/PayPal/Givebutter (external)
3. Admin records payment in /admin/payments (type, amount, method, date)
4. System shows payment status on member's profile and admin dashboards

### 4. Housing Assignment
1. Members indicate housing preference during enrollment
2. Admin assigns housing type, size, grid power in /admin/housing
3. Couples linked via "shared with" field
4. Grid map positions tracked via mapObject field

### 5. Build & Strike Crew
1. Admin creates build days with dates
2. Admin assigns members to specific build days with WAP/EA ticket IDs
3. Similar flow for strike crew and early arrival passes
4. Members see their assignments in /portal/season

## Detailed Architecture Documents

- **[Schema Design](./schema.new.prisma)** - Complete Prisma schema with all entities
- **[API Design](./api-design.md)** - tRPC router specifications
- **[Frontend Design](./frontend-design.md)** - Page architecture and components
- **[Code Audit](./code-audit.md)** - File-by-file KEEP/MODIFY/REMOVE/REPLACE analysis

## Migration Strategy

### Phase 1: Foundation
- New Prisma schema + database migration
- Auth system (JWT, invite flow, password reset)
- Member CRUD + Season CRUD

### Phase 2: Core Member Management
- SeasonMember enrollment + status management
- Payment recording
- Member portal (dashboard, profile, season info)
- Admin member management table

### Phase 3: Operations
- Build/strike crew management
- Inventory tracking
- Shift scheduling

### Phase 4: Finance
- Budget tracking
- Expense management
- Reimbursement workflow

### Phase 5: Extras
- DGS ticket management
- Announcements
- Export/import capabilities
- Data migration from Excel

## Technology Stack (Unchanged)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Express.js + tRPC, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT tokens (bcrypt for passwords)
- **Hosting:** Current infrastructure (unchanged)
