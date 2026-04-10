# Camp Alborz - Project Goals & Vision

> *"Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there."* - Rumi

## Executive Summary

Camp Alborz is a 501(c)(3) non-profit Burning Man theme camp celebrating Persian culture and community. This document captures the aspirational vision, concrete goals, and current state of the campalborz.org platform -- a camp management system and public-facing website serving 500+ members (130-165 attending annually).

---

## 1. Vision

**Transform Camp Alborz's digital presence from a basic informational website into the operational backbone of one of Burning Man's most celebrated theme camps.**

The platform should be:
- **Beautiful** -- A world-class showcase of Persian-modern design that reflects the camp's artistry
- **Operational** -- The single source of truth for camp logistics, from dues collection to strike coordination
- **Self-service** -- Members manage their own profiles, payments, housing, and shift signups
- **Efficient** -- Admins spend minutes, not hours, on roster management and communications
- **Inclusive** -- Accessible to all skill levels, mobile-friendly, and culturally resonant

---

## 2. Strategic Goals

### 2.1 Public Website -- "The Front Door"

**Goal:** A visually stunning, culturally authentic website that attracts new members, tells the camp's story, and establishes Camp Alborz as a premier Burning Man community.

| Objective | Target | Status |
|-----------|--------|--------|
| Homepage with scroll animations, parallax, and Persian design motifs | World-class visual quality | DONE |
| About page with mission, values, timeline, and team | Complete narrative | DONE |
| Art pages for HOMA and DAMAVAND art cars | Rich media showcase | DONE |
| Culture page celebrating Persian heritage | Educational + immersive | DONE |
| Events page with calendar and guidelines | Current + informative | DONE |
| Donation system with Stripe integration | Functional payments | PARTIAL -- UI done, Stripe stubbed |
| Application form with review workflow | End-to-end recruitment | DONE |
| SEO optimization and social sharing | Discoverable | PARTIAL |
| Mobile-first responsive design | All breakpoints | DONE |
| Dark mode | Full support | DONE |
| Performance (Core Web Vitals) | LCP < 2.5s, CLS < 0.1 | UNTESTED |
| Accessibility (WCAG 2.1 AA) | Full compliance | UNTESTED |

### 2.2 Member Portal -- "The Home Base"

**Goal:** A self-service dashboard where members manage their season participation, track payments, sign up for shifts, and stay connected to the community.

| Objective | Target | Status |
|-----------|--------|--------|
| Authentication (login, register, password reset) | Secure JWT flow | DONE |
| Season enrollment and status tracking | Real-time status | PARTIAL -- basic dashboard |
| Payment history and dues progress | Self-service visibility | PARTIAL -- basic view |
| Profile management (contact, emergency, dietary) | Full self-editing | PARTIAL |
| Shift signup and calendar view | Volunteer coordination | NOT BUILT |
| Inventory request submission | Equipment requests | NOT BUILT |
| Announcements feed | Camp communications | EXISTS -- not integrated |
| Member directory | Community connection | EXISTS -- not integrated |
| Housing preferences and grid selection | Pre-event planning | NOT BUILT |
| Build/strike crew signup | Volunteer coordination | NOT BUILT |
| Real-time chat | Community engagement | EXISTS -- not integrated |
| Mobile-optimized portal | On-playa usability | PARTIAL |

### 2.3 Admin Dashboard -- "Mission Control"

**Goal:** A comprehensive operations center where leads and managers coordinate every aspect of camp logistics with minimal friction.

| Objective | Target | Status |
|-----------|--------|--------|
| Dashboard with KPIs and action items | At-a-glance health | DONE |
| Member management with search, filter, bulk actions | Efficient roster ops | DONE |
| Season lifecycle management | Year-over-year continuity | PARTIAL |
| Excel import/export for roster data | Bridge to existing workflows | DONE |
| Application review workflow | Streamlined recruitment | DONE |
| Payment recording and tracking | Financial accountability | DONE |
| Mass communications (email, segments) | Targeted outreach | PARTIAL -- backend exists, frontend minimal |
| Build/strike day scheduling | Construction coordination | PARTIAL -- models exist, UI minimal |
| Shift management and assignment | Volunteer scheduling | PARTIAL -- models exist, UI minimal |
| Inventory tracking and allocation | Equipment management | PARTIAL -- models exist, UI minimal |
| Ticket allocation (DGS, HOMA, etc.) | Fair distribution | PARTIAL -- models exist, UI minimal |
| Early arrival pass management | WAP coordination | PARTIAL -- models exist, UI minimal |
| Budget planning and expense tracking | Financial planning | PARTIAL -- models exist, UI minimal |
| Audit logging | Accountability | DONE (backend) |
| Real-time updates via WebSocket | Live collaboration | EXISTS -- partially integrated |

### 2.4 Communications -- "Staying Connected"

**Goal:** A multi-channel communication system that keeps members informed and engaged year-round.

| Objective | Target | Status |
|-----------|--------|--------|
| Mass email with segmented lists | Targeted communications | PARTIAL -- backend router exists |
| Email templates (welcome, invite, status updates) | Branded communications | DONE (backend) -- not triggered |
| Announcement system with priorities | Urgent + routine updates | DONE (backend) |
| WhatsApp integration tracking | Cross-platform coordination | TRACKED (flag only) |
| SMS notifications (Twilio) | Critical alerts | DEPENDENCY INSTALLED -- not implemented |
| Newsletter/mailing list | Year-round engagement | NOT BUILT |

### 2.5 Financial Operations -- "Keeping the Lights On"

**Goal:** Transparent, auditable financial management that simplifies dues collection and expense tracking.

| Objective | Target | Status |
|-----------|--------|--------|
| Payment tracking (manual entry) | Record-keeping | DONE |
| Dues progress visualization | At-a-glance status | DONE |
| Stripe integration for online payments | Self-service payments | DEPENDENCY INSTALLED -- not implemented |
| Expense tracking with reimbursements | Camp cost management | PARTIAL -- models exist |
| Budget planning by category | Seasonal planning | PARTIAL -- models exist |
| Financial reports and exports | Board/transparency | NOT BUILT |
| GiveButter/PayPal integration | Multi-platform donations | TRACKED (payment method enum) |
| Tax receipt generation | 501(c)(3) compliance | NOT BUILT |

### 2.6 Infrastructure & DevOps -- "The Foundation"

**Goal:** A reliable, maintainable, and scalable technical foundation.

| Objective | Target | Status |
|-----------|--------|--------|
| Monorepo with Turborepo | Organized codebase | DONE |
| TypeScript end-to-end | Type safety | DONE |
| tRPC for type-safe API | Zero-drift client/server | DONE |
| PostgreSQL with Prisma | Reliable data layer | DONE |
| Automated testing (unit + e2e) | Confidence in changes | MINIMAL -- test files exist, coverage unknown |
| CI/CD pipeline | Automated deployment | NOT CONFIGURED |
| Production deployment (Coolify / Docker Compose) | Live site | READY -- Dockerfiles + compose created |
| Error monitoring (Sentry) | Proactive issue detection | NOT CONFIGURED |
| Analytics (Plausible/GA) | Usage insights | ENV VARS READY -- not configured |
| Database backups | Data safety | NOT CONFIGURED |
| Rate limiting | Security | DONE (backend) |
| CORS + Helmet security | API hardening | DONE |

---

## 3. Aspirational Goals (2026 Season & Beyond)

### 3.1 The 2026 Season Launch Checklist

For Camp Alborz's 2026 Burning Man season, the platform should enable:

1. **Recruitment** -- New members discover the camp, apply, and get reviewed
2. **Onboarding** -- Accepted members create accounts, fill profiles, pay dues
3. **Pre-event coordination** -- Housing selection, grid power, arrival/departure, ride shares
4. **Build week** -- Build day signup, WAP pass distribution, task assignment
5. **On-playa** -- Shift scheduling, announcements, real-time coordination
6. **Strike** -- Strike crew coordination, departure scheduling
7. **Post-event** -- Financial reconciliation, feedback collection, season close-out

### 3.2 Dream Features

- **Interactive camp map** -- Visual grid layout where members can see/claim their spot
- **Ride share board** -- Match members traveling from same cities
- **Photo/video gallery** -- Curated media from past burns (with proper image optimization)
- **Music archive** -- Integration with SoundCloud for camp DJ sets
- **Meal planning** -- Food coordination and dietary management
- **Equipment checkout** -- Members reserve specific inventory items
- **Mentorship matching** -- Pair virgin burners with veterans
- **Camp timeline/history** -- Interactive visual history since 2008
- **Multilingual support** -- Farsi translations for cultural content
- **Progressive Web App** -- Offline capability for on-playa use (no cell service)
- **QR code check-in** -- Arrival/departure tracking at camp

---

## 4. Technical Architecture Goals

### Current Architecture (Implemented)
```
Browser → Next.js 14 (App Router) → tRPC Client
                                       ↓
                                    Express.js → tRPC Server → Prisma → PostgreSQL
                                       ↓
                                    Socket.io (real-time)
                                       ↓
                                    SendGrid/SMTP (email)
```

### Target Architecture (Coolify / Docker Compose)
```
Browser/PWA → Coolify Proxy (Traefik) → Next.js (web container, :3000)
                                              ↓ (INTERNAL_API_URL)
                                         Express.js (api container, :3005)
                                              ↓
                                         PostgreSQL (db container, :5432)

External Services:
  SendGrid (email) | Stripe (payments) | S3/R2 (files) | Sentry (errors)
```

**Deployment:** Self-hosted on Coolify via `docker-compose.yml` with three services:
- `web` -- Next.js standalone (port 3000)
- `api` -- Express/tRPC (port 3005)
- `db` -- PostgreSQL 16 with persistent volume

---

## 5. Design Philosophy

### Visual Identity
- **Persian-modern fusion** -- Ancient patterns meet contemporary minimalism
- **Warm earth tones** -- Sage, desert tan, antique gold, cream
- **Elegant typography** -- Playfair Display for headings/accents/editorial, Inter for body/UI (loaded via `next/font/google` in `packages/web/src/app/layout.tsx`)
- **Textural depth** -- Grain overlays, parallax, scroll-triggered animations
- **Cultural authenticity** -- Rumi poetry, Persian motifs, mountain silhouettes

### UX Principles
- **Mobile-first** -- Many members will access on phones, especially on-playa
- **Progressive disclosure** -- Don't overwhelm; reveal complexity as needed
- **Self-service first** -- Members should rarely need to ask an admin for help
- **Accessible** -- WCAG 2.1 AA compliance for all public pages
- **Fast** -- Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)

---

## 6. Success Metrics

### Platform Adoption (2026 Season)
- 80%+ of active members have accounts and use the portal
- 100% of dues tracked through the platform
- 50%+ of communications sent through the platform
- Zero data entry from paper forms

### Website Performance
- Google PageSpeed Insights: 90+ on all pages
- Time to first meaningful paint: < 1.5s
- Zero accessibility violations (axe-core)

### Operational Efficiency
- Season rollover time: < 30 minutes (from days of Excel wrangling)
- Member onboarding: < 5 minutes self-service
- Dues collection tracking: Real-time visibility

---

## 7. Current Gap Analysis

### Critical Gaps (Must-Have for 2026)
1. **Production deployment** -- Dockerfiles + docker-compose.yml created for Coolify; needs final deploy
2. **Stripe payment integration** -- Donation flow is stubbed
3. **Email delivery** -- Email templates exist but aren't triggered in workflows
4. **Member portal completion** -- Basic dashboard exists, but profile editing, shift signup, and housing selection are missing
5. **CI/CD pipeline** -- No automated testing or deployment
6. **Database hosting** -- No production database configured

### Significant Gaps (Should-Have)
7. **Admin build/strike/shift/inventory UIs** -- Data models exist but admin pages are minimal
8. **Communications UI** -- Backend supports mass email but frontend is minimal
9. **Test coverage** -- Near-zero automated tests
10. **Error handling** -- No error monitoring (Sentry)
11. **Image optimization** -- No CDN or image processing pipeline
12. **SEO** -- Structured data exists but needs validation

### Nice-to-Have Gaps
13. **Real-time features** -- Socket.io exists but frontend integration is incomplete
14. **Mobile PWA** -- Not configured
15. **Analytics** -- Env vars ready but not connected
16. **Multi-language** -- No Farsi support
17. **Interactive camp map** -- Not started
18. **Photo gallery** -- Not started

---

*Last updated: 2026-03-17*
*Document maintainer: Project Lead*
