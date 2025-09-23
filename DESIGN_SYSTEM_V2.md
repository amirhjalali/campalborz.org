# Camp Alborz Design System V2
## Mystical • Clean • Luxurious

### 🎯 Design Philosophy
**"Experience Persian hospitality in the desert"** - A mystical yet clean aesthetic that balances Burning Man's radical artistic expression with Persian cultural warmth and luxury.

---

## 🎨 Visual Identity

### Logo System
- **Primary**: Diamond sacred geometry with mountain/sun motif (static)
- **Day Version**: Golden sun rays, warm earth tones
- **Night Version**: Deep blues/purples with subtle glow effects
- **Navigation**: Diamond logo as central navigation hub

### Typography

#### Primary Fonts
```css
/* Display Font - Cultural/Artistic with warmth */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');

/* Body Font - Organic/Desert feel */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap');

/* Supporting Sans - Clean luxury */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');
```

**Usage:**
- **Headlines**: Playfair Display - Elegant, slightly Persian influence
- **Body Text**: Crimson Text - Warm, readable, organic
- **UI Elements**: Montserrat - Clean, luxurious, modern

---

## 🌈 Color Palette

### Playa Dust Base (Earth Tones)
```css
:root {
  /* Primary Earth Tones */
  --dust-khaki: #C4A57B;
  --burnt-sienna: #A0522D;
  --sage-green: #87A96B;
  --desert-sand: #EDC9AF;
  
  /* Instagram Green/Gold Influences */
  --persian-emerald: #50C878;
  --royal-gold: #FFD700;
  --antique-gold: #D4AF37;
  
  /* Mystical Accents */
  --twilight-purple: #5D4E60;
  --sunrise-coral: #FF6B6B;
  --moonlight-silver: #C0C0C0;
  
  /* Neutrals */
  --warm-white: #FFF8F0;
  --desert-night: #2C2416;
  --dust-grey: #9B9B9B;
}
```

### Day/Night Transformation
```css
/* Day Mode - Harsh Desert Sun */
.day-mode {
  --bg-primary: var(--warm-white);
  --bg-secondary: var(--desert-sand);
  --text-primary: var(--desert-night);
  --accent: var(--royal-gold);
  --glow: transparent;
}

/* Night Mode - Playa Nights */
.night-mode {
  --bg-primary: var(--desert-night);
  --bg-secondary: var(--twilight-purple);
  --text-primary: var(--warm-white);
  --accent: var(--persian-emerald);
  --glow: 0 0 20px rgba(80, 200, 120, 0.4);
}
```

---

## 🏜️ Visual Elements

### Must-Have Components

1. **Diamond Logo Navigation**
   - Central hub design
   - Hover reveals navigation spokes
   - Day/night version switches with time

2. **Mount Damavand Hero**
   - Layered parallax mountains
   - Subtle dust particle animation
   - Golden hour lighting effects

3. **HOMA Art Car Feature**
   - Gallery section with glow effects
   - Night photography with LED highlights
   - Interactive story points

4. **Persian Patterns (Subtle)**
   - Background textures, not overwhelming
   - Geometric overlays at 5-10% opacity
   - Focus on hospitality imagery over patterns

5. **Desert Effects**
   - Subtle dust particle animations
   - Heat shimmer on hover effects
   - Sand texture overlays

---

## 📸 Photography Style

### Visual Hierarchy
1. **Professional Burning Man photos** - Hero sections
2. **Member-submitted camp photos** - Community sections
3. **Persian cultural elements** - Accent pieces
4. **Artistic renderings** - Background elements

### Photo Treatment
- Warm color grading
- Slight desaturation for dusty feel
- Golden hour preference
- Night photos with LED/fire emphasis

---

## ✨ Interaction Design

### Animation Philosophy
- **Subtle luxury**: Smooth, refined transitions
- **No excessive movement**: Focus on content
- **Hover states**: Elegant reveals and transforms
- **Loading**: Minimal, dust particle fade-ins

### Key Interactions
```css
/* Subtle hover with warmth */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(196, 165, 123, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Luxurious button states */
.btn-primary {
  background: linear-gradient(135deg, var(--royal-gold), var(--antique-gold));
  transition: all 0.4s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--antique-gold), var(--persian-emerald));
  box-shadow: var(--glow);
}
```

---

## 🌟 Special Features

### Top 3 Priority Features

1. **Interactive Art Gallery**
   - HOMA art car showcase
   - Project stories with timeline
   - Member contributions
   - Lightbox with story overlays

2. **Day-to-Night Visual Transformation**
   - Automatic based on user time
   - Manual toggle option
   - Smooth color transitions
   - LED/glow effects at night

3. **Persian Music Integration (Optional)**
   - Ambient background option
   - User-controlled toggle
   - Subtle, non-intrusive
   - Cultural authenticity

---

## 📐 Layout Principles

### Grid System
- **12-column grid** for flexibility
- **Golden ratio spacing** (1.618) for luxury feel
- **Asymmetric layouts** to avoid corporate look
- **Generous whitespace** for breathing room

### Component Architecture
```
Homepage
├── Diamond Logo Nav (Fixed)
├── Mount Damavand Hero
├── Welcome Section (Persian Hospitality)
├── Art Gallery (HOMA Feature)
├── Community Hub
├── Events Calendar
└── Desert Footer
```

---

## 🎭 Content Tone

### Voice & Messaging
- **Warm and welcoming** (Persian hospitality)
- **Mystical but grounded** (desert wisdom)
- **Inclusive and radical** (Burning Man ethos)
- **Luxurious but not pretentious**

### Example Copy
Instead of: "Join our organization"
Use: "Find your home in the desert"

Instead of: "View our projects"
Use: "Explore the magic we create"

---

## 🚀 Implementation Priority

### Phase 1: Foundation
1. Replace tech fonts with Playfair/Crimson
2. Implement earth-tone color palette
3. Add diamond logo to navigation
4. Create day/night toggle

### Phase 2: Visual Elements
1. Add Mount Damavand hero with parallax
2. Integrate camp photography
3. Implement subtle dust animations
4. Add HOMA art car gallery

### Phase 3: Polish
1. Interactive art gallery
2. Refined hover states
3. Loading animations
4. Mobile optimizations

---

## 📱 Responsive Approach

### Breakpoints
- **Mobile**: 320px - 768px (dust in your pocket)
- **Tablet**: 768px - 1024px (playa shade viewing)
- **Desktop**: 1024px+ (full desert panorama)

### Mobile Considerations
- Simplified animations
- Touch-friendly interactions
- Reduced particle effects
- Focus on content over effects

---

## Reference Sites Analysis

### Ethereum.org
- Take: Clean information architecture
- Leave: Tech-focused aesthetics

### MayanWarrior.com
- Take: Artistic expression, night photography
- Leave: Dark-only theme

### PlayAlchemist.com
- Take: Community focus, event emphasis
- Leave: Corporate structure

---

## Success Metrics

The design succeeds when visitors feel:
1. **Welcomed** - Persian hospitality shines through
2. **Intrigued** - Mystical elements create curiosity
3. **Inspired** - Burning Man artistic spirit is evident
4. **Comfortable** - Clean, luxurious interface is easy to navigate
5. **Connected** - Community warmth is palpable