# Known Issues

This document tracks known issues that exist in the codebase.

## Build Errors (Pre-existing)

The following pages have build errors due to missing dependencies:

### Admin Page (`/admin`)
**Status**: Pre-existing (before abstraction work)

**Errors**:
- Missing UI components: `../ui/select`, `../ui/tabs`
- Missing dependency: `react-dropzone`
- Missing utility: `../../lib/trpc`

**Files affected**:
- `packages/web/src/components/admin/AnalyticsDashboard.tsx`
- `packages/web/src/components/admin/MediaLibrary.tsx`
- `packages/web/src/app/admin/page.tsx`

**Impact**: Admin page does not compile. Main site pages (home, about, etc.) are unaffected.

**Solution needed**:
- Install missing dependencies: `npm install react-dropzone`
- Create missing UI components or remove references
- Implement or mock tRPC client

## Abstraction Progress

### ✅ Completed Components (All Working)
- Navigation
- Hero
- Stats
- FeatureCards
- Layout metadata

### 🔄 Not Yet Abstracted
- All page content (About, Art, Events, Culture, etc.)
- Footer
- Other page-specific components

---
*Last updated: 2025-10-01*
