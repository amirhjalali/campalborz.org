# Camp Alborz - Community Platform

A comprehensive web platform for Camp Alborz, a Persian-themed Burning Man camp that bridges ancient Persian culture with radical self-expression. Built as a modern SaaS platform with multi-tenant capabilities for future expansion to other camps and communities.

## 🏜️ About Camp Alborz

Camp Alborz has been creating magical experiences at Burning Man for over 15 years, combining Persian hospitality with art, music, and community building. This platform serves as the digital home for our global community of 500+ members.

## 🎨 Design Philosophy

Our platform embodies three core principles:
- **Mystical**: Inspired by Persian art and Burning Man's transformative spirit
- **Clean**: Minimalist interface with intuitive navigation
- **Luxurious**: Rich earth tones and elegant typography reflecting our Persian heritage

### Visual Identity
- **Color Palette**: Playa dust earth tones (burnt sienna, antique gold, desert sand)
- **Typography**: 
  - Display: Playfair Display (elegant serif)
  - Body: Crimson Text (readable serif)
  - UI: Montserrat (clean sans-serif)
- **Animations**: Subtle dust particles and smooth transitions

## 🚀 Features

### 📱 Core Platform Features

#### Public Pages
- **Homepage** (`/`): Hero section with camp introduction, statistics, and feature cards
- **About** (`/about`): Our story, mission, values, and leadership team
- **Art & Culture** (`/art`): HOMA fire sculpture, DAMAVAND project, artist showcases
- **Events** (`/events`): Burning Man participation, year-round gatherings, virtual events
- **Community** (`/community`): Forums, resources, newsletter signup
- **Donate** (`/donate`): Support our 501(c)(3) mission with secure donations
- **Apply** (`/apply`): Camp membership application form

#### Member Features
- **Member Portal** (`/members`): 
  - Exclusive content and resources
  - Event RSVPs and schedules
  - Community directory
  - Discussion forums
- **Authentication System**:
  - Secure login/registration
  - Password reset functionality
  - Session management

#### Administrative Features
- **Admin Dashboard** (`/admin`):
  - Member management
  - Event management
  - Donation tracking
  - Content management
  - Analytics dashboard
  - Security monitoring
  - Backup management
  - Integration hub (Stripe, Mailchimp, etc.)
  - Cache management

### 🔧 Technical Features

#### Frontend Architecture
- **Next.js 14** with App Router for optimal performance
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system
- **Framer Motion** for smooth animations
- **Responsive Design** - Mobile-first approach
- **PWA Ready** - Installable web app capabilities
- **i18n Support** - Multi-language ready (English/Farsi)

#### Backend Capabilities
- **tRPC** for type-safe API communication
- **Prisma ORM** with PostgreSQL
- **Multi-tenant Architecture** - Scalable to support multiple camps
- **Real-time Features** - Socket.io for live updates
- **Email Integration** - SendGrid for transactional emails
- **Payment Processing** - Stripe integration
- **SMS Notifications** - Twilio integration
- **Image Processing** - Sharp for optimization
- **Background Jobs** - Bull queue system
- **Redis Caching** - Performance optimization

#### Security & Compliance
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Data Encryption** at rest and in transit
- **GDPR Compliant** data handling
- **501(c)(3) Compliant** donation processing
- **Rate Limiting** and DDoS protection
- **Security Headers** with Helmet.js

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.0.4 (React 18)
- **Language**: TypeScript 5.1.6
- **Styling**: Tailwind CSS 3.4 + CSS Modules
- **State Management**: Zustand 4.4.7
- **Data Fetching**: TanStack Query 5.17
- **Forms**: React Hook Form 7.48
- **Icons**: Lucide React + HeroIcons
- **Animation**: Framer Motion 10.17
- **3D Graphics**: Three.js 0.160

### Backend
- **Runtime**: Node.js 18+
- **API**: tRPC 10.45 + Express 4.18
- **Database**: PostgreSQL + Prisma 5.3.1
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io 4.8
- **Queue**: Bull 4.16 + Redis
- **Email**: SendGrid 8.1 + Nodemailer
- **Payments**: Stripe 18.5
- **SMS**: Twilio 5.10
- **File Storage**: Sharp for images

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Testing**: Jest + React Testing Library (planned)
- **CI/CD**: GitHub Actions (planned)
- **Hosting**: Vercel/Railway (recommended)
- **Database**: Supabase/Neon (recommended)

## 📦 Project Structure

```
campalborz.org/
├── packages/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   ├── components/  # React components
│   │   │   │   ├── admin/   # Admin dashboard components
│   │   │   │   ├── auth/    # Authentication components
│   │   │   │   ├── chat/    # Real-time chat
│   │   │   │   ├── donation/# Donation forms
│   │   │   │   ├── layout/  # Layout components
│   │   │   │   ├── realtime/# Real-time features
│   │   │   │   ├── search/  # Search functionality
│   │   │   │   └── ui/      # UI primitives
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   └── styles/      # Global styles and themes
│   │   └── public/          # Static assets
│   ├── api/                 # Express + tRPC backend
│   │   ├── src/
│   │   │   ├── routers/     # tRPC routers
│   │   │   ├── services/    # Business logic
│   │   │   ├── utils/       # Helper functions
│   │   │   └── prisma/      # Database schema
│   │   └── uploads/         # User uploads
│   └── shared/              # Shared types and constants
├── scripts/                 # Setup and utility scripts
├── docs/                    # Documentation
├── OLD/                     # Legacy website files
└── plan.md                  # Original development plan
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amirhjalali/campalborz.org.git
   cd campalborz.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env
   ```

4. **Start PostgreSQL** (if using Docker)
   ```bash
   docker-compose up -d
   ```

5. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

### Access Points

- **Frontend**: http://localhost:3006
- **API Server**: http://localhost:3005
- **API Health Check**: http://localhost:3005/health
- **Prisma Studio**: `npm run db:studio` (http://localhost:5555)

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start all development servers concurrently
- `npm run build` - Build all packages for production
- `npm run test` - Run test suites
- `npm run lint` - Lint all packages
- `npm run type-check` - TypeScript type checking
- `npm run clean` - Clean build artifacts

### Database Management
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run setup:tenant` - Initialize Camp Alborz tenant

### Package-specific
- `cd packages/web && npm run dev` - Start frontend only
- `cd packages/api && npm run dev` - Start backend only

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Multi-tenant architecture
- [x] Basic authentication system
- [x] Homepage and core pages
- [x] Persian-inspired design system
- [x] Responsive navigation

### Phase 2: Community Features 🚧
- [x] Member portal structure
- [x] Admin dashboard skeleton
- [ ] Forum implementation
- [ ] Event RSVP system
- [ ] Newsletter integration

### Phase 3: Advanced Features 📋
- [ ] Payment processing (Stripe)
- [ ] Multi-language support (Farsi)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered features

### Phase 4: Scale & Expand 🌍
- [ ] White-label solution for other camps
- [ ] Marketplace for camp supplies
- [ ] Virtual event platform
- [ ] API for third-party integrations

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Some pages may have missing icon imports (being fixed)
- Color classes need additional Tailwind configuration
- Form styling classes need to be added to globals.css
- Dynamic gradient syntax needs adjustment in some components

## 📞 Support

- **Email**: info@campalborz.org
- **Website**: https://campalborz.org
- **GitHub Issues**: [Report bugs](https://github.com/amirhjalali/campalborz.org/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Camp Alborz community members
- Burning Man organization
- Persian cultural advisors
- Open source contributors

## 💰 Support Our Mission

Camp Alborz is a registered 501(c)(3) non-profit organization. Your donations help us:
- Create transformative art installations
- Support arts education in underserved communities
- Maintain and improve our camp infrastructure
- Develop this platform for the community

[Donate Now](https://campalborz.org/donate)

---

**Built with ❤️ by the Camp Alborz tech team**

*Where Persian hospitality meets radical self-expression*