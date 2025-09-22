# Camp Alborz Website Redesign Plan 2025
## Ethereum.org-Inspired Design with Persian/Burning Man Aesthetics

---

## 🎯 Vision Statement
Transform Camp Alborz's online presence into a modern, immersive digital experience that combines the clean, technical sophistication of Ethereum.org with the vibrant Persian culture and Burning Man ethos.

---

## 📐 Design System

### Color Palette
#### Primary Colors
- **Persian Purple**: `#6B46C1` (Royal purple from Persian carpets)
- **Desert Gold**: `#F59E0B` (Burning Man sunset)
- **Midnight Blue**: `#1E293B` (Night sky over Black Rock City)
- **Saffron**: `#FCD34D` (Persian spice accent)

#### Neutral Colors
- **Sand**: `#FEF3C7` (Light backgrounds)
- **Dust**: `#92400E` (Text on light)
- **Charcoal**: `#18181B` (Dark mode primary)
- **Smoke**: `#71717A` (Muted text)

#### Gradient Combinations
1. **Hero Gradient**: Persian Purple → Desert Gold (sunset vibes)
2. **Card Gradients**: Subtle purple to pink (mystical feel)
3. **Accent Gradients**: Saffron to orange (warmth and hospitality)

### Typography
- **Headings**: "Inter" or "Space Grotesk" (modern, clean)
- **Body**: "Inter" (excellent readability)
- **Persian/Farsi**: "Vazirmatn" (for bilingual content)
- **Display**: Custom font for "CAMP ALBORZ" logo

### Visual Elements
- **Geometric Patterns**: Persian tile patterns as background textures
- **Icons**: Custom SVG icons mixing tech + Persian motifs
- **Illustrations**: Minimalist line art of:
  - Persian architectural elements
  - Burning Man sculptures
  - Desert landscapes
  - Community gatherings

---

## 🏗️ Site Architecture

### Navigation Structure
```
Home
├── About
│   ├── Our Story
│   ├── Mission & Values
│   ├── Team & Leadership
│   └── 501(c)(3) Info
├── Experience
│   ├── At Burning Man
│   ├── Year-Round Events
│   ├── Virtual Gatherings
│   └── Photo Gallery
├── Get Involved
│   ├── Membership
│   ├── Volunteer
│   ├── Camp Application
│   └── Sponsorship
├── Art & Culture
│   ├── HOMA Fire Sculpture
│   ├── DAMAVAND Project
│   ├── Artist Showcase
│   └── Cultural Programs
├── Community
│   ├── Member Portal
│   ├── Forum
│   ├── Resources
│   └── Newsletter
└── Support
    ├── Donate
    ├── Shop
    ├── Partners
    └── Contact
```

---

## 🎨 Page Designs

### 1. Homepage Design

#### Hero Section
```
┌─────────────────────────────────────────────┐
│  [Logo]  About  Experience  Art  Community   │
│                              [Member Login]   │
├─────────────────────────────────────────────┤
│                                             │
│  Welcome to Camp Alborz                    │
│  ══════════════════════                    │
│  Where Persian hospitality meets           │
│  the spirit of Burning Man                 │
│                                             │
│  [Explore Our World] [Join Community]      │
│                                             │
│  [Animated Persian Pattern Background]     │
└─────────────────────────────────────────────┘
```

**Features:**
- Animated gradient background (purple → gold)
- Floating Persian geometric patterns
- Parallax scrolling effects
- Video background option showing camp life

#### Stats Section (Ethereum.org style)
```
┌──────────────┬──────────────┬──────────────┐
│   15 Years   │  500+ Members│  $50K Raised │
│   of Magic   │   Worldwide  │  for Charity │
├──────────────┼──────────────┼──────────────┤
│  20+ Events  │ 5 Art Projects│ 3 Countries │
│   Per Year   │    Funded    │   Reached   │
└──────────────┴──────────────┴──────────────┘
```

#### Feature Cards (Interactive)
```
┌─────────────────────────────┐
│ 🏕️ Experience Burning Man   │
│ Join us in Black Rock City  │
│ → Learn More                │
├─────────────────────────────┤
│ 🎨 Discover Persian Art     │
│ Explore our cultural heritage│
│ → View Gallery              │
├─────────────────────────────┤
│ 🤝 Build Community          │
│ Connect with amazing people │
│ → Join Us                   │
└─────────────────────────────┘
```

### 2. About Page
- **Hero**: Full-width image of camp at sunset
- **Timeline**: Interactive history from 2008 to present
- **Values Grid**: Cards showing core principles
- **Team Section**: Profile cards with hover effects

### 3. Experience Page
- **Virtual Tour**: 360° camp walkthrough
- **Event Calendar**: Modern calendar with filters
- **Photo Gallery**: Masonry grid with lightbox
- **Testimonials**: Carousel of member stories

### 4. Art & Culture Page
- **Project Showcase**: Large feature cards
- **Artist Profiles**: Grid with bio modals
- **Cultural Education**: Interactive lessons
- **Virtual Museum**: 3D models of art pieces

### 5. Community Portal
- **Member Dashboard**: Personalized content
- **Forum Integration**: Discourse-style discussions
- **Resource Library**: Downloadable guides
- **Event RSVP**: Integrated calendar

### 6. Donation Page
- **Impact Metrics**: Live donation tracker
- **Transparency Report**: Financial breakdowns
- **Donor Recognition**: Interactive wall
- **Recurring Options**: Subscription model

---

## 🚀 Technical Implementation

### Frontend Stack
```javascript
{
  "framework": "Next.js 14",
  "styling": "Tailwind CSS",
  "animations": "Framer Motion",
  "3D": "Three.js",
  "components": "Radix UI",
  "forms": "React Hook Form",
  "state": "Zustand",
  "i18n": "next-i18next"
}
```

### Key Features to Implement

#### Phase 1: Foundation (Weeks 1-4)
- [ ] Design system setup
- [ ] Component library
- [ ] Homepage with animations
- [ ] Responsive navigation
- [ ] Dark/light mode toggle

#### Phase 2: Core Pages (Weeks 5-8)
- [ ] About section
- [ ] Event calendar
- [ ] Photo gallery
- [ ] Contact forms
- [ ] Newsletter signup

#### Phase 3: Interactive Features (Weeks 9-12)
- [ ] Member portal
- [ ] Donation system
- [ ] Event registration
- [ ] Forum integration
- [ ] Search functionality

#### Phase 4: Advanced Features (Weeks 13-16)
- [ ] 3D art gallery
- [ ] Virtual tour
- [ ] Multi-language support
- [ ] Performance optimization
- [ ] Analytics integration

---

## 🎭 Unique Camp Alborz Features

### 1. Persian Pattern Generator
- Dynamic backgrounds using Islamic geometric patterns
- Customizable colors based on user preferences
- Exportable as wallpapers for members

### 2. Playa Time Converter
- Shows current time in Black Rock City
- Countdown to next Burning Man
- Event schedule in Playa time

### 3. Hospitality Tracker
- "Cups of Tea Served" counter
- Guest book with world map
- Stories from camp visitors

### 4. Art Project Timeline
- Interactive timeline of HOMA and DAMAVAND
- 360° views of installations
- Build process documentation

### 5. Persian Recipe Database
- Traditional recipes from camp
- Video tutorials
- Community cookbook contributions

### 6. Dust Storm Mode
- Special UI theme during Burning Man
- Real-time weather from Black Rock City
- Survival tips and updates

---

## 📱 Mobile Experience

### Progressive Web App Features
- Offline access to essential info
- Push notifications for events
- Camera integration for photo uploads
- GPS for finding camp at Burning Man

### Mobile-First Components
- Swipeable galleries
- Touch-friendly navigation
- Bottom sheet modals
- Gesture controls

---

## 🌐 Internationalization

### Language Support
- English (primary)
- Farsi/Persian
- Spanish
- French

### Cultural Adaptations
- RTL layout for Farsi
- Date/time localization
- Currency conversion for donations
- Regional event listings

---

## 📊 Success Metrics

### User Engagement
- Average session duration > 3 minutes
- Bounce rate < 40%
- Return visitor rate > 30%
- Newsletter signup rate > 5%

### Community Growth
- Member registrations: +50% YoY
- Event attendance: +30% YoY
- Volunteer applications: +40% YoY
- Social media referrals: +100% YoY

### Technical Performance
- Lighthouse score > 90
- Core Web Vitals: All green
- Page load time < 2 seconds
- Mobile responsiveness: 100%

---

## 🎨 Visual Mockup Concepts

### Homepage Hero Variations
1. **Desert Sunrise**: Gradient background with animated sun
2. **Persian Garden**: Illustrated paradise with parallax
3. **Playa Dust**: Particle effects with camp silhouette
4. **Community Mosaic**: Grid of member photos forming logo

### Card Hover Effects
- Gradient shift on hover
- Subtle float animation
- Icon rotation
- Border glow effect

### Loading Animations
- Persian pattern spinner
- Dust particle loader
- Tent assembly animation
- Fire animation (for HOMA)

---

## 🔧 Development Roadmap

### Month 1: Design & Setup
- Week 1: Design system finalization
- Week 2: Component library development
- Week 3: Homepage implementation
- Week 4: Core navigation and routing

### Month 2: Content Pages
- Week 5-6: About and Experience sections
- Week 7-8: Art & Culture showcase

### Month 3: Community Features
- Week 9-10: Member portal
- Week 11-12: Forum and resources

### Month 4: Polish & Launch
- Week 13-14: Donation system and shop
- Week 15: Performance optimization
- Week 16: Testing and launch

---

## 🚀 Next Steps

1. **Immediate Actions:**
   - Set up Next.js project with Tailwind
   - Create design tokens and component library
   - Implement homepage hero section
   - Set up CMS for content management

2. **Design Deliverables:**
   - High-fidelity Figma mockups
   - Component style guide
   - Animation specifications
   - Mobile design variations

3. **Technical Setup:**
   - GitHub repository structure
   - CI/CD pipeline
   - Hosting on Vercel
   - Analytics and monitoring

---

## 💫 Inspiration & References

### Visual Inspiration
- **Ethereum.org**: Clean layouts, technical sophistication
- **Awwwards Sites**: Creative animations and interactions
- **Persian Architecture**: Geometric patterns, color palettes
- **Burning Man**: Desert aesthetics, community vibes

### Functional Inspiration
- **Patreon**: Community and membership features
- **Eventbrite**: Event management and registration
- **Medium**: Content presentation and reading experience
- **Discord**: Community engagement tools

---

## 📝 Content Strategy

### Storytelling Approach
- Personal stories from camp members
- Photo essays from events
- Video documentaries
- Interactive timelines

### SEO Strategy
- Keyword focus: "Burning Man camp", "Persian culture", "art collective"
- Blog content calendar
- Social media integration
- Local event optimization

### Content Types
- Long-form articles
- Photo galleries
- Video content
- Podcasts
- Interactive experiences

---

## 🎉 Launch Strategy

### Soft Launch (Beta)
- Limited access to members
- Feedback collection
- Bug fixes and iterations
- Content population

### Public Launch
- Social media campaign
- Email announcement
- Press release
- Launch party event

### Post-Launch
- Weekly content updates
- Monthly feature releases
- Quarterly design refreshes
- Annual major updates

---

This plan combines the clean, modern aesthetic of Ethereum.org with the rich cultural heritage of Camp Alborz and the adventurous spirit of Burning Man. The result will be a stunning, functional website that serves as both a digital home for the community and a welcoming portal for newcomers.