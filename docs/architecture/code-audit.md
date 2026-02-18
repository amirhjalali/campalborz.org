# Camp Alborz Codebase Audit

**Date:** 2026-02-16
**Auditor:** Architecture Review
**Scope:** Full codebase at `/Users/amirjalali/campalborz.org`
**Context:** Transition from broken multi-tenant SaaS backend to single-camp member management system

---

## Executive Summary

The Camp Alborz codebase is split between a polished, production-quality public frontend and a non-functional backend inherited from a multi-tenant SaaS scaffold. The public-facing pages (homepage, about, art, events, culture, donate) are well-built with consistent design patterns, proper accessibility, and clean content-driven architecture. The backend is a liability: 46,695 lines of unused SaaS infrastructure across 35+ routers and 30+ services, none of which connect to the actual Prisma schema. The authentication system is hardcoded to demo mode, the admin dashboard shows mock data, and the application form silently swallows errors.

### Summary Statistics

| Category | Files | Lines of Code |
|----------|-------|---------------|
| **KEEP** | 30 | ~5,900 |
| **MODIFY** | 12 | ~3,200 |
| **REPLACE** | 6 | ~1,800 |
| **REMOVE** | 80+ | ~48,000 |
| **Total files audited** | 128+ | ~58,900 |

### Estimated Impact

- **Lines to delete:** ~48,000 (API routers, services, middleware, combined files, dead root scripts)
- **Lines to modify:** ~800 (AuthContext, layout, apply page, members page fixes)
- **Lines to write new:** ~3,000-5,000 (new API with 5-7 focused routers, new admin dashboard, auth system)
- **Net result:** Codebase shrinks from ~59,000 LOC to ~12,000 LOC

---

## 1. Frontend Pages (`packages/web/src/app/`)

### Public Pages -- Polished and Working

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `page.tsx` (homepage) | 248 | **KEEP** | Well-structured homepage with FAQ, gallery, video, Rumi quote. Uses config-driven content via `useContentConfig()`. Clean Framer Motion animations. |
| `about/page.tsx` | 380 | **KEEP** | Parallax hero, animated timeline with scroll progress, team section, values grid, 501(c)(3) CTA. Excellent design quality. |
| `about/layout.tsx` | 11 | **KEEP** | Thin layout wrapper with centralized metadata. Correct pattern. |
| `art/page.tsx` | 419 | **KEEP** | Art categories, featured installations with links to sub-pages, collaborations section, creative process timeline. Config-driven. |
| `art/homa/page.tsx` | 285 | **KEEP** | Standalone art car detail page. Good storytelling with mythology, specs, gallery. Self-contained content. |
| `art/damavand/page.tsx` | 345 | **KEEP** | Standalone art car detail page. Evolution timeline (V1-V3), mountain connection, gallery. Matches HOMA quality. |
| `art/layout.tsx` | 11 | **KEEP** | Metadata layout. Correct pattern. |
| `events/page.tsx` | 401 | **KEEP** | Event types, upcoming events with icons and external links, Burning Man schedule, event guidelines. Fully config-driven. |
| `events/layout.tsx` | 11 | **KEEP** | Metadata layout. Correct pattern. |
| `culture/page.tsx` | 542 | **KEEP** | Cultural elements, Persian values, workshops, celebrations, learning resources, cultural bridge section. Most content-rich page. |
| `culture/layout.tsx` | 11 | **KEEP** | Metadata layout. Correct pattern. |
| `donate/page.tsx` | 680 | **KEEP** | Impact stats, payment options (Venmo/Zelle/GiveButter), donation tiers, funding priorities, transparency section, donor recognition. Comprehensive and well-designed. |
| `donate/layout.tsx` | 11 | **KEEP** | Metadata layout. Correct pattern. |
| `donate/success/page.tsx` | 238 | **KEEP** | Post-donation confirmation with amount display, transaction details, next steps. Works with query params from Stripe redirect. |
| `not-found.tsx` | 81 | **KEEP** | Custom 404 with helpful links, on-brand design, friendly copy. |
| `robots.ts` | 39 | **KEEP** | Proper robots.txt generation blocking `/admin/` and `/api/`. |
| `sitemap.ts` | 84 | **KEEP** | Static sitemap with correct priorities. Includes TODO for dynamic pages. |

### Authentication-Dependent Pages -- Need Rebuilding

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `admin/page.tsx` | 251 | **REPLACE** | **Hardcoded mock data.** `overviewStats` has static values ("45 members", "$2,450 donations"). `recentActivity` is fake ("New application from Sarah Johnson, 2 hours ago"). All section tabs except "overview" render a "coming soon" placeholder. Depends on broken `AuthContext`. The sidebar layout and design tokens are reusable but the data layer must be rebuilt to use real API calls. |
| `admin/login/page.tsx` | 214 | **REPLACE** | **Shows demo credentials in the UI** ("Email: admin@campalborz.org / Password: admin123"). Login calls the broken `AuthContext.login()` which falls through to localStorage demo mode. The form UI and validation logic are reusable but the auth integration needs complete replacement. |
| `members/page.tsx` | 621 | **MODIFY** | **Two pages crammed into one.** Unauthenticated view shows login form + member benefits + spotlight + community stats. Authenticated view shows a member dashboard with dues info, payment options, resources, and fundraisers. The design and content structure is solid but the page should be split: `/members` for login, `/members/portal` (or `/dashboard`) for authenticated content. Auth integration needs replacement. Portal content is config-driven and works correctly once auth is real. |
| `register/page.tsx` | 277 | **MODIFY** | Registration form with validation. Calls `AuthContext.register()` which falls through to localStorage in demo mode. The form UI is clean. Needs: real API integration, possibly email verification flow. Consider whether self-registration should even exist (vs. invite-only from admin). |
| `apply/page.tsx` | 584 | **MODIFY** | **Critical bug on lines 98-106:** The fetch catches errors and returns `{ ok: true }`, meaning the form always reports success even when the API endpoint does not exist. Fix: remove the `.catch(() => ({ ok: true }))` wrapper. Also has a fake 1.5-second `setTimeout` delay (line 96) simulating a server call. The form UI, validation, and process steps section are all well-designed and config-driven. Needs a real `/api/applications` endpoint. |
| `search/page.tsx` | 203 | **MODIFY** | Client-side only search. Shows mock search results from config (`search.results.mockResults`). Category filters are non-functional (set `searchType` state but nothing filters). Needs: either remove and redirect to a simpler design, or implement actual search with a backend endpoint. Low priority. |

### Root Layout

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `layout.tsx` | 56 | **MODIFY** | Clean root layout with fonts, theme provider, footer. **Issue:** Wraps all pages in `<AuthProvider>` which triggers `seedDemoAdmin()` and localStorage operations on every page load, including public pages that don't need auth. Fix: move `<AuthProvider>` to only wrap authenticated routes, or make it lazy/conditional. Minor issue: nested `<main>` tags (layout has `<main id="main-content">` and each page also has `<main>`). |

### API Routes

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `api/create-payment-intent/route.ts` | 84 | **MODIFY** | Returns mock `clientSecret` with `pi_mock_` prefix. Has production Stripe code in comments ready to be uncommented. Needs: install `stripe` package, swap mock for real implementation, add proper error handling. Low-effort to make production-ready. |
| `api/webhooks/stripe/route.ts` | 205 | **MODIFY** | Handles webhook events but all handlers are `console.log` stubs with TODO comments. Has correct structure for payment_intent.succeeded, subscription lifecycle, etc. Needs: actual database writes, email sending, signature verification. |

---

## 2. Components (`packages/web/src/components/`)

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `navigation.tsx` | 362 | **KEEP** | Full-featured navigation with mobile menu, dark mode toggle, active route highlighting, scroll-aware transparency. Well-built. |
| `footer.tsx` | 106 | **KEEP** | Site footer with nav links, social media, newsletter signup placeholder, copyright. Clean and on-brand. |
| `stats.tsx` | 111 | **KEEP** | Animated counter statistics section with scroll-triggered counting. Used on homepage. |
| `feature-cards.tsx` | 97 | **KEEP** | Feature showcase cards for homepage. Clean component. |
| `home/PageHero.tsx` | 72 | **KEEP** | Homepage parallax hero with background image. |
| `home/FramedCTA.tsx` | 62 | **KEEP** | Reusable CTA section component with primary/secondary buttons. Used across pages. |
| `theme-provider.tsx` | 10 | **KEEP** | Thin wrapper around `next-themes`. Correct pattern. |
| `donation/DonationForm.tsx` | 382 | **MODIFY** | Multi-step donation form (amount > info > payment). Step 3 (payment) calls the mock `create-payment-intent` API route. The form structure, validation, and UX flow are good. Needs: real Stripe Elements integration when payment intent route is fixed. Currently functional for steps 1-2 but step 3 is non-functional in production. |

---

## 3. Contexts (`packages/web/src/contexts/`)

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `AuthContext.tsx` | 333 | **REPLACE** | **The most critical problem in the frontend.** Line 33: `const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true;` -- the `|| true` means DEMO_MODE is always `true` regardless of environment variable. This causes: (1) `seedDemoAdmin()` runs on every page load, writing to localStorage. (2) Login always falls through to localStorage-based mock auth. (3) Registration creates users in localStorage only. (4) Hardcoded admin credentials: `admin@campalborz.org` / `admin123`. (5) Mock tokens: `demo_token_${Date.now()}`. The interface (`AuthContextType`) is well-designed and should be kept. The implementation needs complete replacement with real API calls and proper token management (httpOnly cookies preferred over localStorage). |

---

## 4. Hooks & Libraries (`packages/web/src/hooks/`, `packages/web/src/lib/`)

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `hooks/useConfig.ts` | 61 | **KEEP** | Clean hooks for accessing camp, brand, and content config. Uses `useMemo` correctly. Well-structured. |
| `lib/config.ts` | 78 | **KEEP** | Configuration accessor functions. Simple and correct. |
| `lib/icons.ts` | 66 | **KEEP** | Icon name-to-component mapping for config-driven icon rendering. Used throughout content pages. |
| `lib/metadata.ts` | 220 | **KEEP** | Centralized SEO metadata with OpenGraph, Twitter cards, JSON-LD schema generators. Comprehensive and correct. |
| `lib/utils.ts` | 23 | **KEEP** | Standard `cn()` utility (clsx + tailwind-merge), `formatDate`, `formatCurrency`. |

---

## 5. API Backend (`packages/api/src/`)

This is the core of the problem. The API was scaffolded as a multi-tenant SaaS platform with 35+ feature routers. **None of these routers connect to the actual Prisma schema.** The build script is literally: `echo 'API build skipped - codebase needs significant fixes'`.

### API Entry Points

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `index.ts` | 52 | **REPLACE** | Express + tRPC server setup. Imports broken `appRouter`, initializes unused `RealtimeService`. The basic Express skeleton (CORS, helmet, health check) is fine but should be simplified. tRPC may be over-engineered for this use case -- consider replacing with plain Express REST routes. |
| `context.ts` | 88 | **REMOVE** | Multi-tenant context creation. References tenant resolution that does not apply to single-camp. |
| `trpc.ts` | 65 | **REMOVE** | tRPC initialization with multi-tenant middleware. Over-engineered for a single-camp system. |
| `router.ts` | 1 | **REMOVE** | Empty/stub file. |
| `simple-server.ts` | 309 | **REMOVE** | Alternative server setup, unused. |

### Router Index -- The 35-Router Problem

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `router/index.ts` | 77 | **REPLACE** | Imports and registers 35 routers. A single-camp system needs 5-7 routers max: `auth`, `members`, `seasons`, `payments`, `admin`, `applications`, `announcements`. |

### Routers to REMOVE (SaaS scaffolding, unused)

Every router below is dead code. None connect to the Prisma schema. They contain multi-tenant logic (`tenantId`, `organizationId`) that does not apply.

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `router/tenant.ts` | 127 | **REMOVE** | Multi-tenant CRUD. No tenants in single-camp. |
| `router/organization.ts` | 156 | **REMOVE** | Organization management. Not applicable. |
| `router/billing.ts` | 168 | **REMOVE** | SaaS billing/subscription management. Not applicable. |
| `router/cms.ts` | 918 | **REMOVE** | Full CMS system. Content is config-file driven, not database-driven. |
| `router/email.ts` | 445 | **REMOVE** | Email template/campaign system. Over-engineered. |
| `router/notifications.ts` | 464 | **REMOVE** | In-app notification system. Not needed. |
| `router/upload.ts` | 548 | **REMOVE** | File upload system with S3/cloud storage. Not needed for static site. |
| `router/search.ts` | 412 | **REMOVE** | Full-text search infrastructure. Not needed. |
| `router/analytics.ts` | 437 | **REMOVE** | Analytics dashboard backend. Not needed. |
| `router/apiKeys.ts` | 431 | **REMOVE** | API key management for multi-tenant. Not needed. |
| `router/cache.ts` | 472 | **REMOVE** | Cache management system. Not needed. |
| `router/backup.ts` | 483 | **REMOVE** | Database backup system. Over-engineered. |
| `router/integrations.ts` | 520 | **REMOVE** | Third-party integration hub. Not needed. |
| `router/security.ts` | 548 | **REMOVE** | Advanced security dashboard. Not needed. |
| `router/realtime.ts` | 277 | **REMOVE** | WebSocket/realtime features. Not needed. |
| `router/i18n.ts` | 530 | **REMOVE** | Internationalization system. Not needed. |
| `router/documentation.ts` | 464 | **REMOVE** | Auto-generated API documentation. Not needed. |
| `router/testing.ts` | 581 | **REMOVE** | Testing infrastructure router. Not needed. |
| `router/devops.ts` | 880 | **REMOVE** | DevOps monitoring/deployment router. Not needed. |
| `router/reporting.ts` | 506 | **REMOVE** | Reporting/analytics engine. Not needed. |
| `router/communication.ts` | 542 | **REMOVE** | Multi-channel communication system. Not needed. |
| `router/advancedSearch.ts` | 392 | **REMOVE** | Elasticsearch-style search. Not needed. |
| `router/pushNotifications.ts` | 525 | **REMOVE** | Push notification system. Not needed. |
| `router/dataExportImport.ts` | 576 | **REMOVE** | Data migration/export tools. Not needed. |
| `router/aiFeatures.ts` | 643 | **REMOVE** | AI/ML feature router. Not needed. |
| `router/advancedAnalytics.ts` | 453 | **REMOVE** | Advanced analytics. Not needed. |
| `router/performanceMonitoring.ts` | 444 | **REMOVE** | APM-style monitoring. Not needed. |
| `router/workflowAutomation.ts` | 535 | **REMOVE** | Workflow automation engine. Not needed. |
| `router/advancedSecurity.ts` | 487 | **REMOVE** | Security auditing system. Not needed. |
| `router/user.ts` | 212 | **REMOVE** | Multi-tenant user management. Will be replaced by member-focused auth. |
| `router/admin.ts` | 599 | **REMOVE** | Multi-tenant admin. Will be rebuilt for single-camp. |
| `router/events.ts` | 1096 | **REMOVE** | Over-engineered event system with RSVP, ticketing. Events are config-driven in frontend. |
| `router/payments.ts` | 597 | **REMOVE** | Multi-tenant payment processing. Will be rebuilt. |
| `router/members.ts` | 635 | **REMOVE** | Multi-tenant member management. Will be rebuilt. |
| `router/donations.ts` | 417 | **REMOVE** | Donation tracking. Will be rebuilt. |
| `router/auth.ts` | 677 | **REMOVE** | Multi-tenant auth with JWT. Will be rebuilt for single-camp. |

### Services to REMOVE

Every service file mirrors a router and is equally unused:

| File | Lines | Verdict |
|------|-------|---------|
| `services/admin.ts` | 820 | **REMOVE** |
| `services/advancedAnalytics.ts` | 922 | **REMOVE** |
| `services/advancedSearch.ts` | 795 | **REMOVE** |
| `services/advancedSecurity.ts` | 1,092 | **REMOVE** |
| `services/aiFeatures.ts` | 1,144 | **REMOVE** |
| `services/analytics.ts` | 487 | **REMOVE** |
| `services/auth.ts` | 810 | **REMOVE** |
| `services/backup.ts` | 640 | **REMOVE** |
| `services/cache.ts` | 448 | **REMOVE** |
| `services/cms.ts` | 834 | **REMOVE** |
| `services/combinedServices46-55.ts` | 309 | **REMOVE** |
| `services/combinedServices56-65.ts` | 599 | **REMOVE** |
| `services/combinedServices66-75.ts` | 640 | **REMOVE** |
| `services/combinedServices76-80.ts` | 544 | **REMOVE** |
| `services/communication.ts` | 1,175 | **REMOVE** |
| `services/dataExportImport.ts` | 1,086 | **REMOVE** |
| `services/devops.ts` | 917 | **REMOVE** |
| `services/documentation.ts` | 822 | **REMOVE** |
| `services/donations.ts` | 721 | **REMOVE** |
| `services/email.ts` | 375 | **REMOVE** |
| `services/events.ts` | 910 | **REMOVE** |
| `services/i18n.ts` | 729 | **REMOVE** |
| `services/integrations.ts` | 667 | **REMOVE** |
| `services/members.ts` | 651 | **REMOVE** |
| `services/notifications.ts` | 404 | **REMOVE** |
| `services/performanceMonitoring.ts` | 834 | **REMOVE** |
| `services/pushNotifications.ts` | 814 | **REMOVE** |
| `services/realtime.ts` | 341 | **REMOVE** |
| `services/reporting.ts` | 1,066 | **REMOVE** |
| `services/search.ts` | 708 | **REMOVE** |
| `services/security.ts` | 459 | **REMOVE** |
| `services/testing.ts` | 714 | **REMOVE** |
| `services/upload.ts` | 483 | **REMOVE** |
| `services/workflowAutomation.ts` | 981 | **REMOVE** |

### Combined Routers File

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `routers/combinedRouters46-65.ts` | 801 | **REMOVE** | Catch-all file combining routers 46-65 into a single module. Pure SaaS scaffolding. |

### Middleware

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `middleware/auth.ts` | 89 | **REMOVE** | JWT verification middleware. Will be rebuilt. |
| `middleware/apiAuth.ts` | 149 | **REMOVE** | API key authentication. Not needed for single-camp. |
| `middleware/tenant.ts` | 44 | **REMOVE** | Tenant resolution middleware. Not applicable. |
| `middleware/tenant.middleware.ts` | 213 | **REMOVE** | Duplicate tenant middleware. Not applicable. |
| `middleware/cache.ts` | 240 | **REMOVE** | Redis cache middleware. Over-engineered. |
| `middleware/security.ts` | 517 | **REMOVE** | Rate limiting, CORS, security headers. Helmet in `index.ts` handles this. |
| `middleware/errorHandler.ts` | 127 | **MODIFY** | Generic error handler. The pattern is useful; simplify and keep for new API. |

### Jobs

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `jobs/backup.ts` | 414 | **REMOVE** | Scheduled backup job. Over-engineered. |
| `jobs/webhooks.ts` | 371 | **REMOVE** | Webhook processing queue. Not needed. |

### Prisma Client

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `lib/prisma.ts` | -- | **MODIFY** | Prisma client singleton. Keep the pattern, update for new schema. |
| `lib/logger.ts` | -- | **REMOVE** | Custom logger. Use `console` or `pino` directly. |

---

## 6. Database (`packages/database/prisma/`)

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `schema.prisma` | 502 | **KEEP** | **This is the correct schema.** Single-camp member management with Season, Member, SeasonMember join table, Payment, Ticket, BuildDay, StrikeAssignment, Shift, InventoryItem, etc. Well-designed for ~130-165 member Burning Man camp. Uses proper enums (MemberRole, HousingType, PaymentType, PaymentMethod, etc.). Uses Decimal for amounts. Missing: Application model, Announcement model, AuditLog model (these exist in `schema.new.prisma`). |
| `schema.new.prisma` | 610 | **MODIFY** | Enhanced version of `schema.prisma`. Adds: Gender enum, ApplicationExperience/ApplicationStatus enums, Application model, Announcement model, AuditLog model, ShiftAssignmentStatus enum, InventoryRequestCategory enum, more BudgetCategory values. Uses `Int` (cents) instead of `Decimal` for amounts. Also adds `buildStartDate`/`strikeEndDate` to Season, `emailVerified`/`dietaryRestrictions` to Member, and `addedToWhatsApp`/`isAlborzVirgin`/`isBMVirgin` to SeasonMember. **Recommendation:** Merge the best of both schemas. Use `schema.new.prisma` as the base since it has the Application, Announcement, and AuditLog models the system needs. Rename to `schema.prisma` and drop the old one. |

---

## 7. Configuration (`config/`)

| File | Lines | Verdict | Rationale |
|------|-------|---------|-----------|
| `camp.config.ts` | 62 | **KEEP** | Camp identity: name, tagline, description, social links, feature flags. Clean and correct. |
| `brand.config.ts` | -- | **KEEP** | Brand design tokens (colors, typography, etc.). |
| `content.config.ts` | -- | **KEEP** | Page content configuration. Drives all public page content. This is the most important config file -- it powers the about, art, events, culture, donate, members, apply, and search pages. |
| `types.ts` | -- | **KEEP** | TypeScript interfaces for all config types. Well-typed. |
| `index.ts` | 20 | **KEEP** | Re-exports all config modules. |
| `README.md` | -- | **KEEP** | Documentation for the config system. |

---

## 8. Root-Level Files

| File | Verdict | Rationale |
|------|---------|-----------|
| `package.json` | **MODIFY** | Description says "Multi-tenant camp management platform". Keywords include "multi-tenant" and "saas". `workspaces` includes `scripts` directory that doesn't exist. Has unused dependencies: `@heroicons/react`, `recharts`. Update description and keywords. Remove dead dependencies. |
| `turbo.json` | **KEEP** | Turborepo config for monorepo. Works correctly. |
| `tsconfig.json` | **KEEP** | Root TypeScript config. |
| `.eslintrc.js` | **KEEP** | ESLint configuration. |
| `.prettierrc` | **KEEP** | Prettier configuration. |
| `.gitignore` | **KEEP** | Comprehensive gitignore. |
| `docker-compose.yml` | **KEEP** | PostgreSQL dev database. Useful for local development. |
| `nixpacks.toml` | **KEEP** | Deployment configuration. |
| `CLAUDE.md` | **KEEP** | Project instructions for Claude Code. |
| `README.md` | **MODIFY** | References multi-tenant SaaS platform. Needs rewrite for single-camp system. |
| `API_DOCUMENTATION.md` | **REMOVE** | Documents the 35+ SaaS routers that are being deleted. |
| `DEPLOYMENT.md` | **MODIFY** | Contains useful deployment info but references multi-tenant architecture. |
| `QUICK_START.md` | **REMOVE** | References multi-tenant setup workflow. |
| `SETUP_INSTRUCTIONS.md` | **REMOVE** | Multi-tenant setup guide. |
| `STRIPE_SETUP.md` | **KEEP** | Stripe integration guide. Still relevant for donations. |
| `TESTING.md` | **REMOVE** | Test documentation for the SaaS platform. No tests exist. |
| `create-clean-schema.js` | **REMOVE** | One-time migration script. Already used. |
| `fix-schema.js` | **REMOVE** | One-time schema fix script. Already used. |
| `packagesapiprismaschema.prisma` | **REMOVE** | Empty file (0 bytes). Appears to be a typo/artifact. |
| `Alborz_Guides_25.pdf` | **KEEP** | Camp guide document. Not code. |
| `Alborz Master Document 2026.xlsx` | **KEEP** | Master planning spreadsheet. Not code. Should probably be in `.gitignore`. |

---

## 9. Package-Level Issues

### `packages/web/package.json`

| Issue | Severity | Detail |
|-------|----------|--------|
| Name says "Multi-tenant web application" | Low | Update description |
| Depends on `@camp-platform/shared` | Medium | This package doesn't exist in the repo (was cleaned up). Remove dependency or create a minimal shared package. |
| Multiple unused Radix UI packages | Low | `@radix-ui/react-accordion`, `@radix-ui/react-dialog`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-avatar` -- verify usage and remove unused. |
| `class-variance-authority` | Low | Check if used anywhere; likely unused. |

### `packages/api/package.json`

| Issue | Severity | Detail |
|-------|----------|--------|
| Build script is `echo 'API build skipped'` | Critical | The API cannot be built or deployed. |
| Name says "Multi-tenant API server" | Low | Update description |
| Depends on `@camp-platform/shared` | Medium | Doesn't exist. |
| Heavy unused dependencies | High | `bull`, `ioredis`, `twilio`, `sharp`, `socket.io`, `ws`, `multer`, `nodemailer`, `node-cron`, `cron`, `@sendgrid/mail`, `stripe` (API-side), `express-rate-limit` -- most of these supported SaaS features being removed. Keep only what the new API needs: `express`, `cors`, `helmet`, `bcryptjs`, `jsonwebtoken`, `zod`, `dotenv`, `@prisma/client`. |

---

## 10. Migration Impact

### What Gets Deleted (~48,000 lines)

| Category | Files | Lines | Description |
|----------|-------|-------|-------------|
| API Routers | 36 files | ~18,200 | All `router/*.ts` files except a new `index.ts` |
| API Services | 34 files | ~24,000 | All `services/*.ts` files |
| API Middleware | 6 files | ~1,380 | tenant.ts, tenant.middleware.ts, apiAuth.ts, cache.ts, auth.ts, security.ts |
| API Jobs | 2 files | ~785 | backup.ts, webhooks.ts |
| API Combined | 1 file | ~801 | combinedRouters46-65.ts |
| API Misc | 4 files | ~463 | context.ts, trpc.ts, router.ts, simple-server.ts |
| Root Scripts | 2 files | ~12,000+ | create-clean-schema.js, fix-schema.js |
| Root Docs | 4 files | ~40,000+ | API_DOCUMENTATION.md, QUICK_START.md, SETUP_INSTRUCTIONS.md, TESTING.md |
| Root Misc | 1 file | 0 | packagesapiprismaschema.prisma |

### What Gets Rebuilt (~3,000-5,000 new lines)

| Component | Est. Lines | Description |
|-----------|-----------|-------------|
| `AuthContext.tsx` replacement | ~200 | Real API auth with httpOnly cookies, no demo mode |
| API `auth` router | ~300 | Login, register, logout, refresh, verify email |
| API `members` router | ~400 | CRUD for members, season membership, profile |
| API `seasons` router | ~300 | Season CRUD, activate/deactivate |
| API `payments` router | ~250 | Record payments, get payment summary |
| API `admin` router | ~400 | Dashboard stats, member management, approvals |
| API `applications` router | ~200 | Submit application, review applications |
| API `announcements` router | ~150 | Create/read camp announcements |
| API entry point | ~80 | Simplified Express server |
| API middleware | ~150 | Auth middleware, error handler |
| Admin dashboard rebuild | ~600 | Real data-driven admin with member management |
| `/apply` page fix | ~20 | Remove error-swallowing catch |
| Members page split | ~200 | Separate login from portal |
| Prisma schema finalization | ~610 | Adopt `schema.new.prisma` as primary |

### What Stays Untouched (~5,900 lines)

All public-facing pages, all shared components, all config files, all utility libraries, all SEO infrastructure.

---

## 11. Priority Order for Cleanup

### Phase 1: Immediate Cleanup (Day 1)
1. **Delete all 80+ unused API files** (routers, services, middleware, jobs, combined files)
2. **Delete root-level dead files** (scripts, outdated docs, empty files)
3. **Fix `apply/page.tsx`** -- remove the `.catch(() => ({ ok: true }))` on line 104
4. **Fix `layout.tsx`** -- remove double `<main>` nesting
5. **Update `package.json` files** -- remove "multi-tenant" references, clean unused dependencies

### Phase 2: Schema & API Foundation (Days 2-3)
6. **Finalize Prisma schema** -- adopt `schema.new.prisma`, run initial migration
7. **Build new API entry point** -- simplified Express server with 5-7 routes
8. **Build auth router** -- login, register, logout with JWT + bcrypt
9. **Build auth middleware** -- JWT verification, role checking

### Phase 3: Auth & Member System (Days 3-5)
10. **Replace `AuthContext.tsx`** -- real API calls, remove demo mode entirely
11. **Build members router** -- CRUD, season membership
12. **Build admin router** -- dashboard stats from database, member management
13. **Build applications router** -- handle `/apply` form submissions

### Phase 4: Frontend Integration (Days 5-7)
14. **Rebuild admin dashboard** -- replace hardcoded mock data with real API calls
15. **Split members page** -- separate login view from authenticated portal
16. **Fix donation flow** -- connect Stripe payment intent to real API
17. **Fix registration page** -- connect to real API

### Phase 5: Polish & Deploy (Days 7-10)
18. **Add application review UI** to admin dashboard
19. **Add payment recording UI** to admin dashboard
20. **Update search page** or remove it
21. **Update README and documentation**
22. **Deploy and test**

---

## Appendix A: Files Not Audited (Low Risk)

The following files were identified but not individually audited as they are standard configuration:

- `packages/web/next.config.js` -- Next.js config
- `packages/web/tailwind.config.ts` -- Tailwind with custom design tokens
- `packages/web/postcss.config.js` -- PostCSS config
- `packages/web/tsconfig.json` -- TypeScript config
- `packages/web/src/styles/globals.css` -- Global styles with design system classes
- `packages/web/public/` -- Static assets (images, fonts)

---

## Appendix B: Dependency Audit

### Root `package.json` -- Dependencies to Remove

| Package | Reason |
|---------|--------|
| `@heroicons/react` | Not used anywhere (Lucide React is used instead) |
| `recharts` | Not used anywhere |

### `packages/api/package.json` -- Dependencies to Remove

| Package | Reason |
|---------|--------|
| `bull` | Job queue for SaaS features |
| `ioredis` | Redis client for caching layer |
| `twilio` | SMS notifications |
| `sharp` | Image processing for uploads |
| `socket.io` | WebSocket for realtime features |
| `ws` | WebSocket library |
| `multer` | File upload middleware |
| `nodemailer` | Email sending (replace with SendGrid if needed) |
| `node-cron` | Scheduled jobs |
| `cron` | Duplicate cron library |
| `@sendgrid/mail` | Email sending (keep if using SendGrid) |
| `express-rate-limit` | Can add back later if needed |
| `@trpc/server` | tRPC over-engineering; use plain Express routes |
| `@camp-platform/shared` | Package does not exist |

### `packages/api/package.json` -- Dependencies to Keep

| Package | Reason |
|---------|--------|
| `express` | API framework |
| `cors` | CORS handling |
| `helmet` | Security headers |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT tokens |
| `zod` | Input validation |
| `dotenv` | Environment variables |
| `@prisma/client` | Database ORM |
| `stripe` | Payment processing (for donation webhooks) |
| `date-fns` | Date utilities |

### `packages/web/package.json` -- Dependencies to Verify Usage

| Package | Status |
|---------|--------|
| `@radix-ui/react-*` (12 packages) | Verify each; most appear unused |
| `class-variance-authority` | Likely unused |
| `tailwindcss-animate` | Verify usage in Tailwind config |
| `@camp-platform/shared` | Package does not exist; remove |
