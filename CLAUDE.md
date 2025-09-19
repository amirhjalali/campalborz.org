# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant camp management platform initially built for Camp Alborz (a Burning Man theme camp), but designed from the ground up to be licensable to other camps and organizations. The platform provides white-label capabilities, configurable features, and scalable architecture.

## Current State

The project is in planning phase. The main development plan is documented in `plan.md`, which outlines a comprehensive 6-week development approach to build a multi-tenant platform with Camp Alborz as the initial tenant.

## Repository Structure

```
campalborz.org/
├── plan.md           # Multi-tenant platform development plan
└── OLD/             # Archive of Camp Alborz website for migration
    ├── *.html       # Static HTML pages from the old site
    └── */           # Subdirectories with images and assets
```

## Development Phases

As outlined in plan.md, the project consists of 6 phases (80 total steps):

1. **Project Setup & Infrastructure** - Multi-tenant architecture foundation
2. **Content Management & Tenant Setup** - CMS, tenant management, white-labeling
3. **Modern UI/UX Implementation** - Responsive design and user experience
4. **Organization Management Modules** - Configurable camp/organization features
5. **Performance & SEO Optimization** - Scalability and search optimization
6. **Testing & Quality Assurance** - Comprehensive testing and deployment

## Planned Technology Stack

### Frontend
- React/Next.js (multi-tenant routing)
- TypeScript (strict mode)
- Tailwind CSS (themeable design system)
- tRPC for type-safe API calls

### Backend
- Node.js monorepo (Turborepo/Nx)
- Prisma ORM (multi-tenant schema)
- PostgreSQL (tenant isolation)
- Redis for caching and sessions

### Infrastructure
- Multi-tenant deployment architecture
- CDN with tenant isolation
- Automated tenant provisioning
- Plugin marketplace infrastructure

### Key Integrations
- Stripe for multi-tenant payments
- Email marketing (tenant-specific)
- Social media APIs
- File storage with tenant isolation

## Development Commands

When development begins, commands will include:

- Monorepo build: `nx build`
- Development server: `nx dev`
- Testing: `nx test`
- Linting: `nx lint`
- Database: `prisma migrate dev`

## Core Platform Features

### Multi-Tenant Infrastructure
1. **Tenant management and provisioning**
2. **White-label branding and theming**
3. **Configurable feature modules**
4. **Plugin architecture and marketplace**
5. **Template and theme system**

### Organization Management
6. **Flexible member/participant management**
7. **Configurable payment and fundraising**
8. **Customizable event management**
9. **Task and project coordination**
10. **Resource and inventory tracking**
11. **Skills and expertise matching**
12. **Communication and messaging**
13. **Analytics and reporting engine**

### Content Management
14. **Drag-and-drop page builder**
15. **Content blocks and widgets**
16. **Media gallery system**
17. **Recognition and acknowledgment tools**

## Important Considerations

- The site must maintain 501(c)(3) non-profit compliance
- Accessibility standards (WCAG 2.1) must be followed
- Performance target: sub-3-second load times
- Mobile-first design approach (60%+ donations are mobile)
- Financial transparency and impact reporting are critical

## Git Workflow Instructions

### After Each Development Step
1. Stage all changes: `git add .`
2. Create descriptive commit following the format in PLAN.md
3. Push to GitHub: `git push origin main`
4. Continue to next step in PLAN.md

### Commit Message Format
```
type: Brief description of changes

- Detail 1 (if needed)
- Detail 2 (if needed)
```

### Commit Types
- feat: New feature implementation
- fix: Bug fixes
- docs: Documentation updates
- style: CSS/styling changes
- refactor: Code improvements
- test: Test additions/changes
- chore: Build process or config changes
- perf: Performance improvements
- security: Security enhancements

### Git Configuration
Ensure all commits are attributed correctly:
```bash
git config user.name "Amir Jalali"
git config user.email "amirhjalali@gmail.com"
```

### Important Notes
- Make commits after completing each step in PLAN.md
- Each commit should represent a complete, working state
- Never commit sensitive data or credentials
- Test locally before committing
- Push regularly to maintain backup on GitHub