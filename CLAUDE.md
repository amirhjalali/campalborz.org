# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Camp Alborz is a Burning Man theme camp focused on Persian culture and community building. This repository contains the modernized website for campalborz.org, redesigned with an Ethereum.org-inspired aesthetic combined with Persian cultural elements.

## Current State

The project has been redesigned from a multi-tenant platform to a focused Camp Alborz website with modern design inspired by Ethereum.org. The website features Persian cultural colors and smooth animations while maintaining clean, professional aesthetics.

## Repository Structure

```
campalborz.org/
├── packages/
│   ├── web/             # Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/     # App router pages
│   │   │   ├── components/ # Reusable React components
│   │   │   ├── lib/     # Utility functions
│   │   │   └── styles/  # Global CSS and Tailwind config
│   │   └── package.json
│   ├── api/             # Express.js backend API
│   │   ├── src/
│   │   └── package.json
│   └── database/        # Prisma schema and migrations
├── plan.md              # Original modernization plan
├── WEBSITE_REDESIGN_PLAN.md # Ethereum.org-inspired redesign plan
├── PAGE_ERRORS_TRACKING.md  # Page error tracking and fixes
└── OLD/                 # Archive of the previous website
```

## Current Technology Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with custom Persian-inspired theme
- Framer Motion for animations
- Lucide React for icons

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- TypeScript
- Simple REST API (port 3005)

### Design System
- **Colors:** Persian Purple (#6B46C1), Desert Gold (#F59E0B), Saffron (#FCD34D), Midnight (#1E293B)
- **Typography:** Inter for body text, Space Grotesk for headings
- **Animations:** Framer Motion with smooth transitions
- **Icons:** Lucide React icon library

## Development Commands

### Web Application (Next.js)
From the `packages/web` directory:

- Development server: `npm run dev` (runs on port 3006)
- Build: `npm run build`
- Production: `npm run start`
- Type checking: `npm run typecheck`
- Linting: `npm run lint`

### API Server
From the `packages/api` directory:

- Development server: `npm run dev` (runs on port 3005)
- Build: `npm run build`

## IMPORTANT: Server Verification Process

**ALWAYS verify the Next.js development server is compiling correctly before claiming a page is working:**

1. **Check the terminal output** after making changes
2. **Look for compilation errors** like:
   - `Module not found: Can't resolve`
   - `Failed to compile`
   - Type errors
3. **Navigate to each page** in the browser to confirm it loads
4. **Only mark a page as "Working"** in tracking documents after:
   - No compilation errors in terminal
   - Page loads successfully in browser
   - No console errors in browser DevTools

### Common Issues to Check:
- **Missing component imports** (especially `@/components/ui/*` - these don't exist anymore)
- **Incorrect import paths** (use relative paths like `../../components/navigation`)
- **Missing npm packages** (check package.json)
- **TypeScript type errors**

### Before Claiming a Fix is Complete:
1. Save all files
2. Check Next.js dev server output for compilation errors
3. Refresh the browser page
4. Check browser console for runtime errors
5. Only then update tracking documents

## Available Components

The new design system includes these components:
- `Navigation` - Top navigation bar with dropdowns
- `Hero` - Hero section with gradient background
- `Stats` - Statistics display section
- `FeatureCards` - Feature showcase cards

## Pages Status

All pages have been redesigned to use the new Ethereum.org-inspired design system:
- Homepage (`/`)
- About (`/about`)
- Art (`/art`)
- Events (`/events`)
- Donate (`/donate`)
- Members (`/members`)
- Apply (`/apply`)
- Culture (`/culture`)
- Admin (`/admin`)
- Search (`/search`)

## Important Considerations

- The site must maintain 501(c)(3) non-profit compliance
- Accessibility standards (WCAG 2.1) must be followed
- Performance target: sub-3-second load times
- Mobile-first design approach
- Persian cultural elements should be tastefully integrated
- Clean, professional aesthetic inspired by Ethereum.org