# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Camp Alborz is a Burning Man theme camp focused on Persian culture and community building. This is a focused single-camp website for campalborz.org with a refined Persian-modern design aesthetic.

## Repository Structure

```
campalborz.org/
├── packages/
│   ├── web/             # Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/     # App router pages
│   │   │   ├── components/ # Reusable React components
│   │   │   ├── contexts/   # React contexts (AuthContext)
│   │   │   ├── hooks/      # Custom hooks (useConfig)
│   │   │   ├── lib/        # Utility functions
│   │   │   └── styles/     # Global CSS and Tailwind config
│   │   └── package.json
│   ├── api/             # Express.js backend API
│   │   ├── src/
│   │   └── package.json
│   └── database/        # Prisma schema and migrations
├── config/              # Brand, camp, and content configuration
├── CLAUDE.md
└── README.md
```

## Technology Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with custom design tokens
- Framer Motion for animations
- Lucide React for icons
- next-themes for dark mode

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- TypeScript
- Simple REST API (port 3005)

### Design System
- **Colors:** Sage (#4A5D5A), Desert Tan (#D4C4A8), Antique Gold (#D4AF37), Cream (#FAF7F2), Ink (#2C2416)
- **Typography:** Cinzel (display/headings), Cormorant (accent/quotes), Inter (body/UI) - loaded via next/font/google
- **Animations:** Framer Motion with scroll-triggered reveals
- **Icons:** Lucide React

### Key CSS Classes
- Sections: `section-base`, `section-alt`, `section-contrast`, `section-contained`
- Cards: `luxury-card`, `frame-panel`
- Typography: `text-display-thin`, `text-display-wide`, `text-body-relaxed`, `text-caption`, `text-optical-h1`, `text-optical-h2`
- Fonts: `font-display`, `font-accent`, `font-editorial`, `font-body`
- Buttons: `cta-primary`, `cta-secondary`, `cta-shimmer`
- Forms: `form-input`, `form-label`, `input-glow`
- Decorative: `ornate-divider`, `pill-header`, `blockquote-elegant`, `drop-cap`, `pattern-persian`, `mountain-silhouette`, `image-frame`, `image-grain`

## Development Commands

### Web Application (Next.js)
From the `packages/web` directory:

- Development server: `npm run dev` (runs on port 3006)
- Build: `npm run build`
- Production: `npm run start`
- Linting: `npm run lint`

### API Server
From the `packages/api` directory:

- Development server: `npm run dev` (runs on port 3005)
- Build: `npm run build`

## Components

```
components/
├── navigation.tsx       # Top nav with active states, mobile menu, dark mode toggle
├── footer.tsx           # Site footer with links and social
├── stats.tsx            # Animated statistics counters
├── feature-cards.tsx    # Feature showcase cards
├── theme-provider.tsx   # Dark mode provider
├── donation/
│   └── DonationForm.tsx # Multi-step donation form
└── home/
    ├── PageHero.tsx     # Homepage parallax hero
    └── FramedCTA.tsx    # Call-to-action sections
```

## Pages

- `/` - Homepage
- `/about` - About Camp Alborz
- `/art` - Art overview
- `/art/homa` - HOMA art car
- `/art/damavand` - DAMAVAND art car
- `/events` - Events listing
- `/culture` - Persian culture
- `/donate` - Donation form
- `/donate/success` - Donation confirmation
- `/members` - Member login
- `/apply` - Membership application
- `/search` - Site search
- `/admin` - Admin dashboard
- `/register` - Registration

## Important Considerations

- 501(c)(3) non-profit compliance required
- WCAG 2.1 accessibility standards
- Mobile-first responsive design
- Persian cultural elements integrated tastefully
- All fonts self-hosted via next/font/google (no CDN imports)
