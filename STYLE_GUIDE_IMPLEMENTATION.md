# Camp Alborz Style Guide Implementation Plan
## Based on Alborz_Guides_25.pdf

---

## 🎨 Design System Analysis

### Color Palette
**Primary Colors:**
- **Sage Green:** `#4A5D5A` (main backgrounds, section headers)
- **Desert Tan:** `#D4C4A8` (text on dark backgrounds, accents)
- **Warm Beige:** `#F5EFE6` (light backgrounds, alternating sections)
- **Antique Gold:** `#D4AF37` (decorative elements, icons, CTAs)

**Accent Colors:**
- **Deep Teal:** `#2F4243` (darker variations)
- **Light Sage:** `#8A9D9A` (muted text)
- **Cream:** `#FAF7F2` (lightest backgrounds)

**Photography Colors:**
- Desert blues, sunset oranges, vibrant stage lighting (cyan, magenta, orange)

### Typography System

**Display Font (Headings):**
- Font: "Cinzel" or "Playfair Display" (elegant serif, thin weight)
- Usage: Page titles, major headings
- Characteristics: Thin, elegant, sophisticated
- Examples: "CAMP ALBORZ", "WELCOME (BACK)"

**Accent Font (Subheadings):**
- Font: "Cinzel" or "Cormorant" (italic serif)
- Usage: Questions, decorative text
- Characteristics: Elegant italic, flowing

**Body Font:**
- Font: "Inter" or "Lato" (clean sans-serif)
- Usage: Paragraph text, descriptions
- Characteristics: Highly readable, modern

**Special Typography:**
- "TOMORROW-TODAY" tagline: Tall, condensed sans-serif
- Section headers: All caps with decorative dividers

### Decorative Elements

**Horizontal Dividers:**
```
◇═══════════════════════◇◇◇◇◇═══════════════════════◇
```
- Thin gold lines with diamond/circular ornaments
- Used above and below section headers
- Creates elegant visual separation

**Section Header Frames:**
- Rounded rectangle backgrounds in sage green
- Decorative borders with geometric patterns
- Centered text with generous padding

**Icons & Symbols:**
- Mountain/sun logo (geometric, art deco style)
- Phoenix/griffin symbol (Persian mythological)
- Persian carpet patterns
- Geometric Islamic tile patterns

### Layout Principles

1. **Centered Content:**
   - Max-width containers (900px-1200px)
   - Generous left/right margins
   - Symmetrical layouts

2. **Section Structure:**
   - Decorative header with frame
   - Q&A format (italic questions, regular answers)
   - Alternating background colors (sage/beige)

3. **Whitespace:**
   - Large padding between sections
   - Breathing room around text
   - Generous line-height

4. **Photography:**
   - Full-width hero images
   - Natural, candid camp photos
   - Dramatic stage/art car photography

---

## 🚀 Implementation Phases

### Phase 1: Brand & Design System Update ✅

**Files to Update:**
- `/config/brand.config.ts` - Colors, fonts, visual identity
- `tailwind.config.js` - Extend with new colors/fonts
- `/src/styles/globals.css` - Custom CSS, font imports

**Tasks:**
1. Add new color palette to Tailwind
2. Import Google Fonts (Cinzel, Cormorant, Inter)
3. Create custom CSS utilities for decorative elements
4. Define typography scale

### Phase 2: Component Library 🔧

**New Components to Create:**
- `<DecorativeDivider />` - Ornamental section separators
- `<SectionHeader />` - Framed headers with decorative borders
- `<QASection />` - Q&A format component
- `<PatternBackground />` - Persian geometric patterns
- `<PageHero />` - Full-width hero with overlay text

**Components to Update:**
- `Navigation` - Match new color scheme
- `Hero` - Add pattern overlays, update typography
- `Footer` - New decorative style

### Phase 3: Page Updates 📄

**Priority Pages:**

1. **Homepage (`/`)**
   - Hero with "TOMORROW-TODAY" theme
   - Mountain/sun logo integration
   - Decorative section dividers
   - Camp photo gallery

2. **About (`/about`)**
   - Mission statement in Q&A format
   - Timeline with decorative styling
   - Team section with photo frames

3. **Events (`/events`)**
   - Q&A format for event details
   - Calendar with decorative styling
   - Burning Man schedule section

4. **Art (`/art`)**
   - HOMA and DAMAVAND showcases
   - Dramatic photography
   - Project timelines

5. **Donate (`/donate`)**
   - Elegant donation tiers
   - 501(c)(3) information highlight
   - Impact stats with decorative frames

6. **Culture (`/culture`)**
   - Persian heritage section
   - Tea & hookah offerings
   - Workshop descriptions

### Phase 4: Content & Imagery 🖼️

**Content Updates:**
- Use Q&A format from guide
- Update mission statement
- Add "TOMORROW-TODAY" theme
- Include camp gifts, offerings details

**Image Assets Needed:**
- Hero backgrounds (desert, mountains, camp setup)
- Art car photos (HOMA, DAMAVAND redesign sketches)
- Camp amenity photos (Lotus Belle, stage, dining area)
- Community photos (group shots, events)

### Phase 5: Interactive Elements ✨

**Animations:**
- Smooth scroll transitions
- Decorative divider animations
- Hover effects on cards
- Pattern fade-ins

**Enhancements:**
- Interactive camp map
- Photo galleries with lightbox
- Music lineup visualization
- Shift signup integration

---

## 📐 Component Specifications

### DecorativeDivider Component
```tsx
<DecorativeDivider variant="ornate" color="gold" />
```
- Variants: simple, ornate, double
- Colors: gold, sage, tan
- Animations: fade-in, slide

### SectionHeader Component
```tsx
<SectionHeader
  title="MISSION STATEMENT"
  bgColor="sage"
  decorated={true}
/>
```
- Background: rounded sage green frame
- Decorative borders
- Icon support

### QASection Component
```tsx
<QASection
  question="Will there be food all week?"
  answer="Camp meals officially kick off on Monday..."
/>
```
- Italic question styling
- Regular answer text
- Optional subsections

### PatternBackground Component
```tsx
<PatternBackground
  pattern="geometric"
  opacity={0.1}
  color="gold"
/>
```
- Persian tile patterns
- Geometric Islamic designs
- Subtle overlay effects

---

## 🎯 Success Criteria

1. **Visual Consistency:**
   - All pages match PDF aesthetic
   - Consistent color usage
   - Uniform typography

2. **Brand Identity:**
   - Strong Persian cultural elements
   - Burning Man desert vibe
   - Elegant, sophisticated feel

3. **User Experience:**
   - Easy navigation
   - Clear information hierarchy
   - Mobile-responsive design

4. **Performance:**
   - Fast load times
   - Optimized images
   - Smooth animations

---

## 📋 Next Steps

1. ✅ Create this implementation plan
2. ⏳ Update brand configuration
3. ⏳ Implement new design system
4. ⏳ Create component library
5. ⏳ Update all pages
6. ⏳ Add content from guide
7. ⏳ Test and refine
8. ⏳ Deploy updates

---

## 🔗 References

- **Source Document:** `/Users/amirjalali/Downloads/Alborz_Guides_25.pdf`
- **Current Config:** `/config/`
- **Components:** `/packages/web/src/components/`
- **Styles:** `/packages/web/src/styles/`

---

*Last Updated: 2025-11-10*
*Implementing Burning Man 2025 Style Guide*
