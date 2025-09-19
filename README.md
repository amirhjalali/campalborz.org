# Camp Management Platform

A multi-tenant SaaS platform for Burning Man camps and festival organizations, initially built for Camp Alborz.

## Architecture

- **Multi-tenant**: Each camp gets their own isolated data and customizable experience
- **White-label**: Full branding customization per tenant
- **Scalable**: Built with modern tech stack for growth
- **Configurable**: Feature modules can be enabled/disabled per tenant

## Tech Stack

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js with tRPC and Prisma
- **Database**: PostgreSQL with tenant isolation
- **Infrastructure**: Turborepo monorepo

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/amirhjalali/campalborz.org.git
   cd campalborz.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database**
   ```bash
   docker-compose up -d
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Set up Camp Alborz tenant**
   ```bash
   npm run setup:tenant
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

### Access

- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database Studio**: `npm run db:studio`

## Project Structure

```
├── packages/
│   ├── shared/         # Shared types, utilities, constants
│   ├── api/           # tRPC API server with Prisma
│   ├── web/           # Next.js tenant application
│   └── admin/         # Admin dashboard
├── scripts/           # Setup and utility scripts
├── OLD/              # Legacy Camp Alborz website files
└── docs/             # Documentation
```

## Development

### Available Commands

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Camp Alborz Demo

After running setup, you can access Camp Alborz at:
- Login: admin@campalborz.org / admin123
- URL: http://campalborz.localhost:3000

## Business Model

### Target Market
- Burning Man theme camps (500+ registered camps)
- Music festivals and art collectives
- Community organizations

### Pricing Tiers
- **Starter**: $29/month (< 50 members)
- **Professional**: $99/month (< 200 members) 
- **Enterprise**: $299/month (< 1000 members)
- **Custom**: Enterprise solutions

## Features

- ✅ Multi-tenant architecture
- ✅ Tenant management and provisioning
- ✅ Role-based access control
- ✅ Database with tenant isolation
- 🚧 Web application (in progress)
- 🚧 Admin dashboard (planned)
- 🚧 Payment processing (planned)
- 🚧 Content management system (planned)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details