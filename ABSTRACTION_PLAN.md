# Camp Abstraction Plan

## Executive Summary

This plan outlines the comprehensive strategy to transform the Camp Alborz website from a single-camp implementation into a multi-tenant platform framework. The goal is to abstract all Camp Alborz-specific references while maintaining the existing design and functionality, creating a reusable foundation that can be easily customized for any Burning Man theme camp.

## Current State Analysis

### Camp-Specific References Found

1. **Frontend Components**
   - Navigation: "CAMP ALBORZ" hardcoded in logo (line 96)
   - Hero: "Welcome to Camp Alborz" title (line 33)
   - Hero: "Persian hospitality meets Burning Man" tagline (line 45)
   - Hero: Persian culture references in description (line 57-58)
   - Layout metadata: Camp Alborz branding throughout (lines 24-48)
   - All page content (About, Art, Events, Culture, etc.)

2. **Design System**
   - Tailwind config: Persian-inspired color names (Persian Purple, Saffron, etc.)
   - Color scheme: Desert/Persian themed colors
   - Font choices: Playfair Display, Crimson Text (Persian aesthetic)
   - Background patterns: Persian pattern overlays
   - CSS animations: Persian-themed names

3. **Backend/Database**
   - Prisma schema: Tenant model already exists (good foundation!)
   - Theme model: Partially implemented for customization
   - Default colors in Tenant model reference Camp Alborz colors

4. **Configuration**
   - Package.json: Repository URL references campalborz.org
   - Environment files: May contain camp-specific URLs

5. **Documentation**
   - README.md: Camp Alborz-focused
   - CLAUDE.md: Camp Alborz project overview
   - All documentation files reference Camp Alborz

## Abstraction Strategy

### Phase 1: Configuration Infrastructure (Foundation)

#### 1.1 Create Configuration System
**Goal**: Centralize all camp-specific data in a single, easily configurable location.

**Tasks**:
- [ ] Create `config/camp.config.ts` (or `.json`) with camp-specific settings
- [ ] Create `config/brand.config.ts` for branding (colors, fonts, logos)
- [ ] Create `config/content.config.ts` for text content and messaging
- [ ] Create type definitions for all config files
- [ ] Create environment-based config loader

**Config Structure**:
```typescript
// config/camp.config.ts
export const campConfig = {
  // Basic Info
  name: "Camp Alborz",
  tagline: "Where Persian hospitality meets the spirit of Burning Man",
  description: "For over 15 years, we've created a home on the playa...",

  // Organization
  legalName: "Camp Alborz Inc.",
  taxStatus: "501(c)(3)",
  ein: "XX-XXXXXXX",

  // Contact
  email: "info@campalborz.org",
  phone: "",
  location: "Black Rock City, NV",

  // URLs
  website: "https://campalborz.org",
  domain: "campalborz.org",
  subdomain: "alborz",

  // Social Media
  social: {
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
  },

  // Features
  features: {
    events: true,
    donations: true,
    membership: true,
    forum: true,
    gallery: true,
    newsletter: true,
  },

  // Cultural Identity
  cultural: {
    heritage: "Persian",
    artStyle: "Persian-Modern Fusion",
    values: ["Hospitality", "Art", "Community", "Self-Expression"],
  },
};

// config/brand.config.ts
export const brandConfig = {
  // Colors
  colors: {
    primary: "rgb(160, 82, 45)",      // Burnt Sienna
    secondary: "rgb(212, 175, 55)",   // Antique Gold
    accent: "rgb(255, 215, 0)",       // Royal Gold
    background: "rgb(255, 248, 240)", // Warm White
    text: {
      primary: "rgb(44, 36, 22)",     // Desert Night
      secondary: "rgb(237, 201, 175)", // Desert Sand
    },
  },

  // Typography
  fonts: {
    display: "Playfair Display",
    body: "Crimson Text",
    ui: "Montserrat",
  },

  // Theme
  theme: {
    style: "desert-mystical",  // or "modern", "traditional", "minimal", etc.
    patterns: ["persian-geometric", "desert-waves"],
  },

  // Assets
  assets: {
    logo: "/images/logo.svg",
    logoLight: "/images/logo-light.svg",
    logoDark: "/images/logo-dark.svg",
    favicon: "/favicon.ico",
    ogImage: "/og-image.jpg",
    heroBackground: "/images/hero-bg.jpg",
  },
};

// config/content.config.ts
export const contentConfig = {
  // Hero Section
  hero: {
    title: "Welcome to Camp Alborz",
    subtitle: "Where Persian hospitality meets the spirit of Burning Man",
    description: "For over 15 years, we've created a home on the playa where ancient Persian culture blends with radical self-expression...",
    cta: {
      primary: {
        text: "Explore Our World",
        icon: "tent",
        link: "/experience",
      },
      secondary: {
        text: "Join Our Community",
        icon: "heart",
        link: "/join",
      },
    },
  },

  // Navigation
  navigation: {
    // Custom navigation items can override defaults
    enabled: true,
    customItems: [],
  },

  // Footer
  footer: {
    tagline: "Building community through art, culture, and radical hospitality",
    copyright: "Camp Alborz",
  },

  // Stats
  stats: [
    { label: "Years on the Playa", value: "15+", icon: "calendar" },
    { label: "Community Members", value: "500+", icon: "users" },
    { label: "Art Installations", value: "25+", icon: "palette" },
    { label: "Events Hosted", value: "100+", icon: "star" },
  ],

  // Feature Cards
  features: [
    {
      title: "Persian Hospitality",
      description: "Experience authentic Persian tea service...",
      icon: "coffee",
      link: "/culture",
    },
    {
      title: "Fire Art",
      description: "Marvel at our iconic HOMA sculpture...",
      icon: "flame",
      link: "/art",
    },
    {
      title: "Community Events",
      description: "Join us for workshops, performances...",
      icon: "calendar",
      link: "/events",
    },
  ],
};
```

#### 1.2 Create Configuration Helper Functions
**Tasks**:
- [ ] Create `lib/config.ts` with helper functions to access config
- [ ] Create hook: `useConfig()` for React components
- [ ] Create server-side config loader
- [ ] Add config validation functions
- [ ] Create config type guards

#### 1.3 Environment Variable Setup
**Tasks**:
- [ ] Update `.env.example` with all required variables
- [ ] Document environment variables in README
- [ ] Create `.env.template` for quick setup
- [ ] Add environment validation on startup

### Phase 2: Database Abstraction (Multi-Tenant Foundation)

#### 2.1 Enhance Tenant Model
**Goal**: Make the existing Tenant model the source of truth for all camp customization.

**Tasks**:
- [ ] Extend Tenant model with additional fields:
  - Cultural identity fields
  - Social media links
  - Contact information
  - Feature flags
- [ ] Create migration for new fields
- [ ] Add seed data for Camp Alborz tenant
- [ ] Create default tenant configuration

**Schema Updates**:
```prisma
model Tenant {
  // ... existing fields ...

  // Camp Identity
  campName            String
  tagline             String?
  description         String?   @db.Text
  culturalHeritage    String?   // "Persian", "Japanese", "None", etc.

  // Contact
  contactEmail        String?
  contactPhone        String?
  physicalLocation    String?

  // Legal
  legalName           String?
  taxStatus           String?   // "501(c)(3)", "For-Profit", etc.
  ein                 String?

  // Social Media
  socialInstagram     String?
  socialFacebook      String?
  socialTwitter       String?
  socialYoutube       String?

  // Assets (URLs)
  logoUrl             String?
  logoLightUrl        String?
  logoDarkUrl         String?
  heroImageUrl        String?
  ogImageUrl          String?

  // Feature Toggles
  enableEvents        Boolean   @default(true)
  enableDonations     Boolean   @default(true)
  enableMembership    Boolean   @default(true)
  enableForum         Boolean   @default(false)
  enableGallery       Boolean   @default(true)
  enableNewsletter    Boolean   @default(true)

  // Content Overrides (JSON for flexibility)
  contentOverrides    Json      @default("{}")

  // ... existing relations ...
}
```

#### 2.2 Create Tenant Context Provider
**Tasks**:
- [ ] Create `contexts/TenantContext.tsx` (already exists, enhance it)
- [ ] Add tenant configuration to context
- [ ] Create `useTenant()` hook for easy access
- [ ] Implement tenant loading from database or config
- [ ] Add fallback to config file if no database tenant

#### 2.3 Tenant Seeding & Migration
**Tasks**:
- [ ] Create seed script for Camp Alborz tenant
- [ ] Create migration for existing data
- [ ] Document tenant setup process
- [ ] Create CLI tool for creating new tenants

### Phase 3: Frontend Component Abstraction

#### 3.1 Abstract Navigation Component
**File**: `packages/web/src/components/navigation.tsx`

**Tasks**:
- [ ] Replace "CAMP ALBORZ" with `{config.camp.name}`
- [ ] Make navigation items configurable
- [ ] Add tenant/config-based logo
- [ ] Support custom navigation structures
- [ ] Add tenant color scheme integration

**Changes**:
```typescript
// Before
<div className="text-2xl font-display font-bold">
  CAMP ALBORZ
</div>

// After
import { useTenant } from '@/contexts/TenantContext';
import { campConfig } from '@/config/camp.config';

const { tenant } = useTenant();
const campName = tenant?.campName || campConfig.name;

<div className="text-2xl font-display font-bold">
  {campName}
</div>
```

#### 3.2 Abstract Hero Component
**File**: `packages/web/src/components/hero.tsx`

**Tasks**:
- [ ] Replace hardcoded title with config
- [ ] Replace tagline with config
- [ ] Replace description with config
- [ ] Make CTA buttons configurable
- [ ] Support custom hero images
- [ ] Make background gradient configurable

#### 3.3 Abstract Stats Component
**File**: `packages/web/src/components/stats.tsx`

**Tasks**:
- [ ] Make stats data come from config
- [ ] Support custom stat configurations
- [ ] Allow tenants to define their own stats

#### 3.4 Abstract Feature Cards Component
**File**: `packages/web/src/components/feature-cards.tsx`

**Tasks**:
- [ ] Make feature cards configurable
- [ ] Support custom icons and links
- [ ] Allow tenants to define featured content

#### 3.5 Abstract Layout & Metadata
**File**: `packages/web/src/app/layout.tsx`

**Tasks**:
- [ ] Replace hardcoded metadata with config
- [ ] Support dynamic OpenGraph images
- [ ] Make SEO fields configurable
- [ ] Support custom fonts per tenant

#### 3.6 Abstract All Page Components
**Files**: All pages in `packages/web/src/app/*/page.tsx`

**Tasks**:
- [ ] Audit each page for hardcoded content
- [ ] Create page-specific content configs
- [ ] Replace static content with config references
- [ ] Support page-level content overrides
- [ ] Document content structure for each page

### Phase 4: Design System Abstraction

#### 4.1 Create Dynamic Tailwind Theme
**File**: `packages/web/tailwind.config.js`

**Tasks**:
- [ ] Create theme generator function
- [ ] Support runtime color scheme changes
- [ ] Abstract color names (e.g., `persian-purple` → `primary`)
- [ ] Create semantic color tokens
- [ ] Support multiple theme presets

**Approach**:
```javascript
// tailwind.config.js
const { generateTheme } = require('./lib/theme-generator');
const { brandConfig } = require('./config/brand.config');

module.exports = {
  theme: {
    extend: {
      colors: generateTheme(brandConfig.colors),
      fontFamily: {
        display: [brandConfig.fonts.display, 'serif'],
        body: [brandConfig.fonts.body, 'serif'],
        ui: [brandConfig.fonts.ui, 'sans-serif'],
      },
      // ... other theme properties
    },
  },
};
```

#### 4.2 Create CSS Custom Properties
**File**: `packages/web/src/styles/globals.css`

**Tasks**:
- [ ] Define CSS variables for all theme colors
- [ ] Support runtime theme switching
- [ ] Create theme presets (desert, ocean, forest, etc.)
- [ ] Document theme customization process

**Approach**:
```css
:root {
  --color-primary: rgb(160, 82, 45);
  --color-secondary: rgb(212, 175, 55);
  --color-accent: rgb(255, 215, 0);
  /* ... etc */
}

[data-theme="ocean"] {
  --color-primary: rgb(0, 119, 182);
  --color-secondary: rgb(0, 180, 216);
  /* ... etc */
}
```

#### 4.3 Abstract Pattern & Image Assets
**Tasks**:
- [ ] Move Persian patterns to configurable assets
- [ ] Create pattern library with multiple styles
- [ ] Support custom background patterns
- [ ] Create asset management system

### Phase 5: Content Management System

#### 5.1 Create CMS Structure
**Tasks**:
- [ ] Design content schema for pages
- [ ] Create database models for dynamic content
- [ ] Build simple admin interface for content editing
- [ ] Support markdown/rich text content

#### 5.2 Page Builder Foundation
**Tasks**:
- [ ] Create reusable section components
- [ ] Build section configuration system
- [ ] Support page composition from sections
- [ ] Create section library

### Phase 6: API & Backend Abstraction

#### 6.1 Tenant Middleware
**File**: `packages/api/src/middleware/tenant.middleware.ts`

**Tasks**:
- [ ] Enhance existing tenant middleware
- [ ] Support subdomain detection
- [ ] Support custom domain mapping
- [ ] Add tenant context to all requests

#### 6.2 API Endpoints
**Tasks**:
- [ ] Create tenant configuration API
- [ ] Create tenant theme API
- [ ] Add tenant context to all existing APIs
- [ ] Support multi-tenant data isolation

#### 6.3 Setup Scripts
**File**: `scripts/setup-tenant.ts`

**Tasks**:
- [ ] Enhance tenant setup script
- [ ] Support quick camp creation
- [ ] Generate configuration files
- [ ] Seed initial data

### Phase 7: Testing Strategy

#### 7.1 Configuration Testing
**Tasks**:
- [ ] Unit tests for config loading
- [ ] Validate config schema
- [ ] Test config merging (defaults + overrides)
- [ ] Test environment variable handling

**Test Files**:
- `config/__tests__/camp.config.test.ts`
- `config/__tests__/brand.config.test.ts`
- `config/__tests__/content.config.test.ts`

#### 7.2 Component Testing
**Tasks**:
- [ ] Test components with different configs
- [ ] Test theme switching
- [ ] Test tenant context
- [ ] Visual regression testing

**Test Files**:
- `components/__tests__/navigation.test.tsx`
- `components/__tests__/hero.test.tsx`
- `components/__tests__/stats.test.tsx`
- `components/__tests__/feature-cards.test.tsx`

#### 7.3 Integration Testing
**Tasks**:
- [ ] Test complete camp setup flow
- [ ] Test multi-tenant isolation
- [ ] Test theme application end-to-end
- [ ] Test content rendering

**Test Scenarios**:
1. **Camp Alborz (Existing)**
   - Verify all existing functionality works
   - Ensure design looks identical
   - Test all pages load correctly
   - Verify all links work

2. **New Camp (Generic)**
   - Create test camp with minimal config
   - Verify default theme applied
   - Test content rendering
   - Verify branding appears correctly

3. **New Camp (Custom)**
   - Create test camp with full customization
   - Test custom colors applied
   - Test custom fonts loaded
   - Test custom content rendered
   - Test custom features enabled

#### 7.4 Visual Regression Testing
**Tasks**:
- [ ] Set up Playwright/Chromatic
- [ ] Capture baseline screenshots of Camp Alborz
- [ ] Verify abstraction doesn't change appearance
- [ ] Test multiple themes

#### 7.5 Performance Testing
**Tasks**:
- [ ] Measure config loading performance
- [ ] Test with multiple tenants
- [ ] Benchmark theme switching
- [ ] Optimize if needed

### Phase 8: Documentation

#### 8.1 Developer Documentation
**Tasks**:
- [ ] Create `docs/ABSTRACTION.md` - overview of system
- [ ] Create `docs/CONFIGURATION.md` - config guide
- [ ] Create `docs/THEMING.md` - theme customization guide
- [ ] Create `docs/CONTENT.md` - content management guide
- [ ] Create `docs/DEPLOYMENT.md` - multi-tenant deployment
- [ ] Update CLAUDE.md with abstraction info

#### 8.2 Setup Documentation
**Tasks**:
- [ ] Create step-by-step new camp setup guide
- [ ] Document environment variables
- [ ] Create quick start template
- [ ] Create video walkthrough (optional)

#### 8.3 API Documentation
**Tasks**:
- [ ] Document tenant API endpoints
- [ ] Document theme API endpoints
- [ ] Document configuration API
- [ ] Create API examples

#### 8.4 Example Configurations
**Tasks**:
- [ ] Create example configs for different camp styles:
  - `examples/configs/desert-camp.ts` (Camp Alborz style)
  - `examples/configs/ocean-camp.ts`
  - `examples/configs/forest-camp.ts`
  - `examples/configs/minimal-camp.ts`
  - `examples/configs/tech-camp.ts`

### Phase 9: Migration & Deployment

#### 9.1 Camp Alborz Migration
**Tasks**:
- [ ] Create Camp Alborz configuration files
- [ ] Create Camp Alborz tenant in database
- [ ] Migrate existing data to new structure
- [ ] Test Camp Alborz site thoroughly
- [ ] Verify identical appearance and functionality

#### 9.2 Deployment Strategy
**Tasks**:
- [ ] Create deployment checklist
- [ ] Set up environment variables
- [ ] Configure subdomain routing
- [ ] Set up custom domain support
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Deploy to production

#### 9.3 Rollback Plan
**Tasks**:
- [ ] Document rollback procedure
- [ ] Create database backup
- [ ] Tag release in git
- [ ] Test rollback process

## Implementation Order

### Week 1-2: Foundation
1. Create configuration infrastructure (Phase 1)
2. Enhance database models (Phase 2)
3. Set up testing framework (Phase 7.1)

### Week 3-4: Frontend Abstraction
1. Abstract core components (Phase 3.1-3.4)
2. Abstract layout and metadata (Phase 3.5)
3. Begin page abstraction (Phase 3.6)
4. Test components (Phase 7.2)

### Week 5-6: Design System
1. Create dynamic theme system (Phase 4.1-4.2)
2. Abstract assets and patterns (Phase 4.3)
3. Visual regression testing (Phase 7.4)

### Week 7-8: Backend & API
1. Complete API abstraction (Phase 6)
2. Create tenant management tools (Phase 6.3)
3. Integration testing (Phase 7.3)

### Week 9: Documentation & Polish
1. Write all documentation (Phase 8)
2. Create example configurations (Phase 8.4)
3. Polish admin interface

### Week 10: Migration & Testing
1. Migrate Camp Alborz (Phase 9.1)
2. Complete testing (Phase 7.3)
3. Performance testing (Phase 7.5)
4. Final QA

### Week 11: Deployment
1. Deploy to staging
2. User acceptance testing
3. Deploy to production
4. Monitor and fix issues

## Success Criteria

### Must Have
- [ ] Camp Alborz website looks and functions identically to current version
- [ ] All Camp Alborz specific text comes from configuration
- [ ] All colors and fonts are configurable
- [ ] New camp can be created in under 30 minutes
- [ ] Zero breaking changes to existing functionality
- [ ] All tests pass
- [ ] Documentation complete

### Should Have
- [ ] Simple admin UI for configuration
- [ ] Multiple theme presets available
- [ ] Asset management system
- [ ] Content editing capability
- [ ] Performance maintained or improved

### Nice to Have
- [ ] Visual page builder
- [ ] Theme marketplace
- [ ] Advanced CMS features
- [ ] Multi-language support
- [ ] A/B testing framework

## Risks & Mitigations

### Risk 1: Breaking Camp Alborz Site
**Mitigation**:
- Comprehensive testing at each step
- Visual regression testing
- Gradual rollout with feature flags
- Ability to rollback quickly

### Risk 2: Performance Degradation
**Mitigation**:
- Performance testing throughout
- Optimize config loading
- Cache tenant data
- Use static generation where possible

### Risk 3: Scope Creep
**Mitigation**:
- Strict adherence to phases
- Focus on "Must Have" criteria first
- Time-box each phase
- Regular progress reviews

### Risk 4: Over-Abstraction
**Mitigation**:
- Keep Camp Alborz as reference implementation
- Don't abstract until pattern is clear
- Balance flexibility with simplicity
- Regular reality checks

## File Structure After Abstraction

```
campalborz.org/
├── config/
│   ├── camp.config.ts          # Camp-specific info
│   ├── brand.config.ts         # Branding & design
│   ├── content.config.ts       # Content & copy
│   └── features.config.ts      # Feature flags
├── packages/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/            # Next.js pages
│   │   │   ├── components/     # Abstracted components
│   │   │   ├── contexts/
│   │   │   │   └── TenantContext.tsx
│   │   │   ├── lib/
│   │   │   │   ├── config.ts   # Config loader
│   │   │   │   └── theme.ts    # Theme generator
│   │   │   └── styles/
│   │   │       └── globals.css # CSS custom properties
│   │   └── tailwind.config.js  # Dynamic theme
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── tenant.ts   # Tenant CRUD
│   │   │   │   └── theme.ts    # Theme management
│   │   │   └── middleware/
│   │   │       └── tenant.middleware.ts
│   │   └── prisma/
│   │       └── schema.prisma   # Enhanced schema
├── docs/
│   ├── ABSTRACTION.md
│   ├── CONFIGURATION.md
│   ├── THEMING.md
│   ├── CONTENT.md
│   └── DEPLOYMENT.md
├── examples/
│   └── configs/
│       ├── desert-camp.ts
│       ├── ocean-camp.ts
│       └── minimal-camp.ts
├── scripts/
│   ├── setup-tenant.ts
│   └── migrate-to-config.ts
└── tests/
    ├── integration/
    ├── visual/
    └── performance/
```

## Git Workflow

### Branch Strategy
- `main` - Production code
- `develop` - Development integration
- `feature/abstraction-*` - Feature branches for each phase

### Commit Strategy
- Commit after each completed task
- Use conventional commits: `feat:`, `refactor:`, `test:`, `docs:`
- Push to GitHub after each phase completion
- No references to "Claude Code" in commit messages (as per requirement)

### Example Commits
```
feat: add camp configuration infrastructure
refactor: abstract navigation component to use config
test: add unit tests for config loader
docs: update CONFIGURATION.md with examples
```

## Next Steps

1. **Review this plan** with stakeholders
2. **Create initial branch**: `feature/abstraction-phase-1`
3. **Begin Phase 1**: Configuration Infrastructure
4. **Set up testing framework**
5. **Start implementation following phase order**

## Questions to Resolve

1. Should we support multiple camps on single deployment or separate deployments?
2. What level of customization do we want to support in v1?
3. Do we need a visual theme editor or is config file sufficient?
4. Should we build a marketplace for themes/configs?
5. What authentication system for multi-tenant access?

## Estimated Timeline

- **Total Duration**: 11 weeks
- **Developer Effort**: 1 full-time developer
- **Testing**: Continuous throughout
- **Documentation**: Final 1-2 weeks
- **Buffer**: 1-2 weeks for unexpected issues

---

**Last Updated**: 2025-10-01
**Status**: Planning Phase
**Next Milestone**: Phase 1 - Configuration Infrastructure
