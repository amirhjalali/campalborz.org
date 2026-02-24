# Camp Alborz World-Class Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use superpowers:dispatching-parallel-agents for Phase 1 tasks which are fully independent.

**Goal:** Transform campalborz.org from a functional site into a world-class, visually stunning Burning Man theme camp website with scroll animations, parallax, grain textures, polished typography, and rich content across all pages.

**Architecture:** Next.js 14 App Router with Tailwind CSS. Framer Motion for all animations. Cormorant Garamond (accent/quotes) + Playfair Display (headings) + Inter (body). Shared `<Reveal>` component for scroll-triggered animations across all pages. Grain overlay on `<body>` for analog texture. All images served as WebP with JPG fallbacks.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion 10, Lucide React icons, next/font/google

**Dev Server:** `cd packages/web && npx next dev -p 3009`

**Browser Preview:** http://localhost:3009/

---

## Current State Summary

### What's Already Done (uncommitted changes in working tree)
- `layout.tsx` — Added Cormorant_Garamond as `--font-cormorant`
- `page.tsx` — Complete rewrite with Reveal component, parallax hero, offerings section, scroll animations
- `navigation.tsx` — Redesigned: opacity fade-in, removed duplicate Members link, cleaner hover states
- `footer.tsx` — Enhanced: decorative gold/terracotta gradient top border, better spacing
- `globals.css` — Major rewrite: grain overlay, `::selection` styling, image-hover-zoom, persian-line, ornate-divider, keyframe animations
- `tailwind.config.js` — Added `accent` font family
- **7 WebP images** created in `packages/web/public/images/` (93% size reduction)

### Critical Issue: Broken CSS Variables
The `globals.css` rewrite removed these CSS variables that **74 occurrences across 11 sub-page files** depend on:
- `--color-line-rgb` (used for border colors)
- `tan-300`, `tan-50` (Tailwind classes used in sub-pages)
- `gold-500` (Tailwind class used in sub-pages)

These MUST be restored or all sub-pages will have broken styling.

### Known Issues to Fix
1. Hero image isn't visible at initial viewport (requires scrolling ~300px to see)
2. Sub-pages reference old Tailwind color classes not in current config
3. Need to verify dark mode works across all changes

---

## Phase 0: Foundation (MUST complete before Phase 1)

> This phase fixes broken things and creates shared infrastructure. Run sequentially.

### Task 0.1: Fix CSS Variable Compatibility

**Files:**
- Modify: `packages/web/src/styles/globals.css`
- Modify: `packages/web/tailwind.config.js`

**What to do:**
1. Read current `globals.css` and `tailwind.config.js`
2. Add back missing CSS variables that sub-pages depend on. Add to `:root`:
```css
--color-line-rgb: 224, 216, 204;
--color-tan-50: 250, 247, 240;
```
3. Add back missing Tailwind color tokens to `tailwind.config.js`:
```js
colors: {
  // ... existing colors ...
  tan: {
    50: '#FAF7F0',
    100: '#f3ebe0',
    200: '#e8ddd0',
    300: '#d4c8b4',
  },
}
```
4. Ensure `gold` in Tailwind config has numbered shades:
```js
gold: {
  DEFAULT: '#b8960c',
  muted: '#c4a94d',
  400: '#c4a94d',
  500: '#b8960c',
  600: '#a08000',
},
```

**Verify:** Run `npx next build 2>&1 | head -50` — should compile without CSS errors.

### Task 0.2: Create Shared Reveal Component

**Files:**
- Create: `packages/web/src/components/reveal.tsx`

**What to do:**
Extract the `Reveal` component from `page.tsx` into a shared component so all pages can use it:

```tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const directionMap = {
    up: { y: 32, x: 0 },
    down: { y: -32, x: 0 },
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x, y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

Then update `page.tsx` to import from `'../components/reveal'` instead of defining it inline.

### Task 0.3: Fix Homepage Hero Image Visibility

**Files:**
- Modify: `packages/web/src/app/page.tsx`

**Problem:** The hero text column has `justify-end` which pushes content to the bottom, leaving the top ~40% of the left column empty. On desktop, this means you must scroll to see the hero image.

**Fix:** Change the hero left column from `justify-end` to `justify-center` and adjust padding:
```tsx
// Change this:
className="relative flex flex-col justify-end px-8 py-16 md:px-16 md:py-20 lg:px-20 lg:pb-24 z-10"
// To this:
className="relative flex flex-col justify-center px-8 py-24 md:px-16 md:py-20 lg:px-20 z-10"
```

Also move the scroll indicator to be absolutely positioned at the bottom of the hero section (not inside the left column).

### Task 0.4: Commit Foundation

```bash
git add packages/web/src/components/reveal.tsx packages/web/src/styles/globals.css packages/web/tailwind.config.js packages/web/src/app/layout.tsx packages/web/src/app/page.tsx packages/web/src/components/navigation.tsx packages/web/src/components/footer.tsx packages/web/public/images/*.webp packages/web/public/images/*_optimized.jpg
git commit -m "feat: foundation for world-class redesign — shared Reveal component, grain overlay, Cormorant font, WebP images, CSS fixes"
```

---

## Phase 1: Page Upgrades (Run in PARALLEL — 6 independent agents)

> Each task below is a complete, independent page rewrite. They share only the foundation from Phase 0. Each agent should:
> 1. Read `CLAUDE.md` for design system reference
> 2. Read `packages/web/src/components/reveal.tsx` for shared animation component
> 3. Read `packages/web/src/styles/globals.css` for available CSS classes
> 4. Read the relevant content config from `config/content.config.ts`
> 5. Open the browser at `http://localhost:3009/<page>` to verify their work visually

### Design Principles for ALL Pages

Every page must follow these rules:

1. **Import and use `<Reveal>`** from `../../components/reveal` for scroll-triggered animations on every section
2. **Add `<div className="grain-overlay" aria-hidden="true" />` ONCE** right after `<Navigation />` inside `<main>` (NOT on every page — it's already in the grain-overlay CSS as `position: fixed`)
3. **Use Cormorant Garamond** (`font-accent`) for blockquotes, pull quotes, and large italic text
4. **Use eyebrow text** (`text-[11px] tracking-[0.3em] uppercase font-medium` with `color: var(--color-terracotta)`) above section headings
5. **Use `image-hover-zoom`** class on image containers for hover effects
6. **Use CSS variables** (not Tailwind color classes) for colors: `var(--color-ink)`, `var(--color-ink-soft)`, `var(--color-terracotta)`, `var(--color-cream-warm)`, `var(--color-warm-border)`, `var(--color-gold-muted)`
7. **Section spacing**: `py-24 md:py-32` for content sections
8. **Max width**: `max-w-[1200px] mx-auto px-5 md:px-10`
9. **Decorative lines** between sections: `<div className="h-px" style={{ backgroundColor: 'var(--color-warm-border)' }} />`
10. **CTA buttons**: Use `cta-primary` and `cta-secondary` CSS classes (they have hover slide effects built in)
11. **Add `<span>` inside cta-primary** buttons for z-index layering: `<Link className="cta-primary"><span>Text</span></Link>`
12. **No more `bg-cream` Tailwind class** in section backgrounds — use `style={{ backgroundColor: 'var(--color-cream)' }}` or the CSS classes `section-base`, `section-alt`

---

### Task 1.1: Homepage Polish (Agent 1)

**Files:**
- Modify: `packages/web/src/app/page.tsx`

**Scope:** The homepage rewrite is 90% done. This agent fixes remaining issues and polishes.

**Steps:**
1. Read current `page.tsx`
2. Import `Reveal` from `'../components/reveal'` instead of the inline definition (remove the inline `Reveal` function)
3. Fix the hero layout (Task 0.3 details)
4. Verify the offerings section renders (4 cards with SVG icons: Chai, Art Cars, Sound, Hookah)
5. Add grain overlay: `<div className="grain-overlay" aria-hidden="true" />` right after `<Navigation />`
6. Test in browser: scroll through entire page, verify all animations trigger, verify hero image is visible without scrolling
7. Verify dark mode toggle works

**Browser test checklist:**
- [ ] Hero: text + image visible simultaneously on load
- [ ] Stats bar: numbers animate in on scroll
- [ ] Story section: slides in from left/right
- [ ] Offerings: 4 cards with icons appear
- [ ] Rumi quote: parallax background texture
- [ ] Panorama image: parallax scroll
- [ ] Artist spotlight: staggered card reveals + hover zoom
- [ ] CTA: "Apply to Join" + "Support Our Camp" buttons
- [ ] FAQ: 4 Q&A pairs in 2-column grid

---

### Task 1.2: About Page (Agent 2)

**Files:**
- Modify: `packages/web/src/app/about/page.tsx`

**Current state:** Has framer-motion, parallax hero, timeline section. Uses old color tokens.

**Steps:**
1. Read current about page fully
2. Read content config for about data: `config/content.config.ts`
3. Add `import { Reveal } from '../../components/reveal';`
4. Replace any old color tokens (`gold-500` → use CSS var, `tan-300` → use CSS var, `color-line-rgb` → use `var(--color-warm-border)`)
5. Wrap each section's content in `<Reveal>` components with staggered delays
6. Add eyebrow text above major headings (small terracotta uppercase labels)
7. Add `image-hover-zoom` class to any image containers
8. Ensure the hero has the gradient overlay for text readability
9. Add a CTA section at the bottom: "Join Us on the Playa" with `cta-primary` button
10. Test in browser at `/about` — verify scroll animations work on every section

---

### Task 1.3: Art Pages (Agent 3)

**Files:**
- Modify: `packages/web/src/app/art/page.tsx`
- Modify: `packages/web/src/app/art/homa/page.tsx`
- Modify: `packages/web/src/app/art/damavand/page.tsx`

**Current state:** Has framer-motion, parallax. Uses old color tokens.

**Steps:**
1. Read all three art page files fully
2. Read content config for art data
3. Add `Reveal` imports, replace old color tokens
4. **Art index page:** Make the art car cards larger and more dramatic — full-width stacked layout instead of grid. Each art car gets:
   - Full-bleed image with `image-hover-zoom`
   - Eyebrow label (e.g., "Art Car 001")
   - Large Playfair Display title
   - Description in Cormorant Garamond italic
   - "Explore HOMA →" link
5. **HOMA page:** Add `Reveal` to all sections, fix colors, add image gallery feel
6. **DAMAVAND page:** Same treatment as HOMA
7. Test all three pages in browser

---

### Task 1.4: Culture Page (Agent 4)

**Files:**
- Modify: `packages/web/src/app/culture/page.tsx`

**Current state:** Has framer-motion, parallax hero. Uses old color tokens.

**Steps:**
1. Read current culture page fully
2. Read content config for culture data
3. Add `Reveal` imports, replace old color tokens
4. Wrap every section in `<Reveal>` with direction and delay variations
5. Add eyebrow text labels above sections
6. Use Cormorant Garamond italic for any Persian poetry or cultural quotes
7. Add `image-hover-zoom` to image containers
8. Add decorative `ornate-divider` between major sections
9. End with a CTA: "Experience Persian Culture" linking to `/events`
10. Test at `/culture` in browser

---

### Task 1.5: Events Page (Agent 5)

**Files:**
- Modify: `packages/web/src/app/events/page.tsx`

**Current state:** Has framer-motion, parallax hero. Uses old color tokens.

**Steps:**
1. Read current events page fully
2. Read content config for events data
3. Add `Reveal` imports, replace old color tokens
4. Wrap each event card in `<Reveal>` with staggered delays
5. Event cards should have `luxury-card` class with hover lift effect
6. Add eyebrow text and section dividers
7. Add a "Don't miss out" CTA at the bottom linking to `/apply`
8. Test at `/events` in browser

---

### Task 1.6: Donate & Apply Pages (Agent 6)

**Files:**
- Modify: `packages/web/src/app/donate/page.tsx`
- Modify: `packages/web/src/app/donate/success/page.tsx`
- Modify: `packages/web/src/app/apply/page.tsx`

**Current state:** Both have framer-motion, parallax heroes, forms. Use old color tokens.

**Steps:**
1. Read all three files fully
2. Add `Reveal` imports, replace old color tokens
3. **Donate page:**
   - Wrap impact stats and tier cards in `<Reveal>`
   - Use `luxury-card` for donation tiers
   - Add eyebrow text above sections
   - Form inputs should use `form-input` and `form-label` classes
4. **Donate success:**
   - Add a celebratory animation (scale-in effect)
   - Clean up color tokens
5. **Apply page:**
   - Wrap form sections in `<Reveal>` for progressive disclosure feel
   - Use `form-input` and `form-label` classes
   - Add progress indicator styling
   - Fix all color token references
6. Test all three pages in browser

---

## Phase 2: Polish & Review (Run after Phase 1 completes)

### Task 2.1: Cross-Page Consistency Audit

**Steps:**
1. Open browser and navigate through EVERY page:
   - `/` → `/about` → `/art` → `/art/homa` → `/art/damavand` → `/events` → `/culture` → `/donate` → `/apply`
2. Check for:
   - Consistent heading styles (Playfair Display, same sizes)
   - Consistent eyebrow text styling (terracotta, 11px, tracking)
   - Consistent section spacing (py-24 md:py-32)
   - Consistent CTA button styling
   - Grain overlay visible on all pages (it's `position: fixed` so should be global)
   - Navigation working on all pages
   - Footer consistent on all pages
3. Fix any inconsistencies found

### Task 2.2: Dark Mode Verification

**Steps:**
1. Toggle dark mode via the nav button
2. Scroll through every page
3. Check for:
   - All text readable against dark backgrounds
   - Images still look good (not washed out)
   - Grain overlay works in dark mode (should use `mix-blend-mode: screen`)
   - CTA buttons invert properly
   - Form inputs have proper dark backgrounds
4. Fix any issues

### Task 2.3: Performance & Accessibility Audit

**Steps:**
1. Run `npx next build` — check for warnings
2. Open Chrome DevTools Lighthouse audit on homepage
3. Check:
   - All images use WebP where possible
   - No layout shift from font loading
   - All `<Image>` components have proper `sizes` attributes
   - All interactive elements have focus-visible styles
   - Color contrast ratios pass WCAG 2.1 AA
   - `aria-label` on all nav elements
   - `prefers-reduced-motion` media query disables animations
4. Fix any critical issues

### Task 2.4: Final Commit & Cleanup

```bash
git add -A
git status  # Review all changes
git commit -m "feat: world-class website redesign — scroll animations, parallax, grain texture, WebP images, polished typography across all pages"
```

---

## Architecture Reference

### File Tree
```
packages/web/src/
├── app/
│   ├── layout.tsx          ← Fonts: Playfair, Inter, Cormorant
│   ├── page.tsx            ← Homepage (fully rewritten)
│   ├── about/page.tsx      ← Phase 1.2
│   ├── art/
│   │   ├── page.tsx        ← Phase 1.3
│   │   ├── homa/page.tsx   ← Phase 1.3
│   │   └── damavand/page.tsx ← Phase 1.3
│   ├── culture/page.tsx    ← Phase 1.4
│   ├── events/page.tsx     ← Phase 1.5
│   ├── donate/
│   │   ├── page.tsx        ← Phase 1.6
│   │   └── success/page.tsx ← Phase 1.6
│   └── apply/page.tsx      ← Phase 1.6
├── components/
│   ├── reveal.tsx          ← NEW: Shared scroll animation wrapper
│   ├── navigation.tsx      ← Redesigned
│   └── footer.tsx          ← Enhanced
├── styles/
│   └── globals.css         ← Rewritten with grain, animations, design tokens
└── ...
```

### Color System (CSS Variables)
| Variable | Light | Use |
|---|---|---|
| `--color-cream` | #FAF7F0 | Page background |
| `--color-cream-warm` | #f3ebe0 | Alt section bg |
| `--color-ink` | #1a1a18 | Primary text, buttons |
| `--color-ink-soft` | #4a4a42 | Body text |
| `--color-ink-faint` | #8a8578 | Captions, labels |
| `--color-terracotta` | #a0522d | Accent, eyebrows, links |
| `--color-gold` | #b8960c | Highlights |
| `--color-gold-muted` | #c4a94d | Decorative |
| `--color-warm-border` | #e0d8cc | Borders, dividers |

### Typography Classes
| Class | Font | Use |
|---|---|---|
| `font-heading` / `font-display` | Playfair Display | h1-h6, display text |
| `font-accent` | Cormorant Garamond italic | Quotes, pull text |
| `font-body` | Inter | Body, UI elements |
| `text-eyebrow` | Inter 11px, 0.25em tracking, uppercase, terracotta | Section labels |

### Key CSS Component Classes
| Class | Effect |
|---|---|
| `grain-overlay` | Fixed full-page noise texture |
| `image-hover-zoom` | Zoom image on hover (add to container, not img) |
| `luxury-card` | Card with border, hover lift + shadow |
| `cta-primary` | Dark button with terracotta slide-fill on hover |
| `cta-secondary` | Bordered outline button |
| `ornate-divider` | Decorative divider with gold lines |
| `persian-line` | Line with gradient fade on both sides |
| `section-base` | Standard section padding |
| `section-alt` | Section with warm background |
| `form-input` | Styled input with focus ring |
