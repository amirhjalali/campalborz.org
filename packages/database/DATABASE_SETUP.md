# Camp Alborz Database Setup

This guide covers how to set up the PostgreSQL database for local development.

## Prerequisites

- **Node.js** 18+ and **npm** 8+
- **PostgreSQL** 15+ (via Docker or local install)
- **Docker** and **Docker Compose** (recommended for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

**Option A: Docker (recommended)**

From the repository root:

```bash
docker compose up -d postgres
```

This starts PostgreSQL 15 on port 5432 with:
- User: `postgres`
- Password: `password`
- Database: `camp_platform_dev`

**Option B: Local PostgreSQL**

If you have PostgreSQL installed locally, create the database:

```bash
createdb camp_platform_dev
```

Or via psql:

```sql
CREATE DATABASE camp_platform_dev;
```

### 2. Configure Environment Variables

Copy the example environment file in the database package:

```bash
cp packages/database/.env.example packages/database/.env
```

Edit `packages/database/.env` if your PostgreSQL connection differs from the defaults:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/camp_platform_dev"
```

Also copy the API environment file:

```bash
cp packages/api/.env.example packages/api/.env
```

The `DATABASE_URL` must be identical in both files.

### 3. Install Dependencies

From the repository root:

```bash
npm install
```

Or install just the database package:

```bash
cd packages/database
npm install
```

### 4. Generate Prisma Client

```bash
# From repo root
npm run db:generate

# Or from packages/database
cd packages/database
npx prisma generate
```

### 5. Run Migrations

```bash
# From repo root
npm run db:migrate

# Or from packages/database
cd packages/database
npx prisma migrate dev
```

On the first run, Prisma will prompt you for a migration name. Use something descriptive like `init_camp_alborz`.

### 6. Seed the Database

```bash
# From repo root
npm run db:seed

# Or from packages/database
cd packages/database
npm run seed
```

The seed script populates:
- 2 seasons (2025 past, 2026 active)
- 1 admin user + 8 sample members
- Season member enrollments for both seasons
- Build days and volunteer shifts
- 5 announcements
- 6 membership applications (various statuses)
- 13 inventory items
- 15 budget lines for 2026
- 8 expenses for 2025
- 5 audit log entries

### 7. Explore with Prisma Studio (optional)

```bash
npm run db:studio
```

Opens a web-based database browser at http://localhost:5555.

## All-in-One Setup

Run all steps (generate + migrate + seed) at once:

```bash
# From repo root
npm run db:setup

# Or from packages/database
cd packages/database
npm run setup
```

## Login Credentials (Seed Data)

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@campalborz.org   | admin123   |
| Member  | bita@campalborz.org    | member123  |
| Member  | darius@campalborz.org  | member123  |
| Member  | sara@campalborz.org    | member123  |
| Member  | reza@campalborz.org    | member123  |
| Member  | yasmin@campalborz.org  | member123  |
| Member  | marco@campalborz.org   | member123  |
| Member  | nina@campalborz.org    | member123  |
| Member  | alex@campalborz.org    | member123  |

## Common Commands

| Command                | Description                                |
|------------------------|--------------------------------------------|
| `npm run db:generate`  | Regenerate Prisma client after schema edits |
| `npm run db:migrate`   | Create and apply a new migration            |
| `npm run db:seed`      | Run the seed script                         |
| `npm run db:studio`    | Open Prisma Studio GUI                      |
| `npm run db:reset`     | Reset DB, re-run all migrations and seed    |
| `npm run db:setup`     | Full setup: generate + migrate + seed       |

## Resetting the Database

To wipe the database and start fresh:

```bash
npm run db:reset
```

This drops all tables, re-runs migrations, and re-runs the seed script.

## Schema Location

The authoritative Prisma schema lives at:

```
packages/database/prisma/schema.prisma
```

The API package (`packages/api`) has its own copy of the schema for its migration history. Both should be kept in sync.

## Using the Database Client

The database package exports a shared PrismaClient singleton:

```typescript
import { prisma } from '@camp-platform/database';

// Use it in any package
const members = await prisma.member.findMany();
```

Or import the standalone utilities:

```typescript
import { prisma, disconnectDatabase, checkDatabaseHealth } from '@camp-platform/database';
```

## Troubleshooting

**"Can't reach database server"**
- Ensure PostgreSQL is running: `docker compose ps` or `pg_isready`
- Check your `DATABASE_URL` in `.env`

**"Migration failed"**
- Run `npm run db:reset` to start fresh
- Check for pending migrations: `cd packages/database && npx prisma migrate status`

**"Prisma Client not generated"**
- Run `npm run db:generate` before starting the API server

**"Port 5432 already in use"**
- Another PostgreSQL instance is running. Stop it or change the port in `docker-compose.yml`
