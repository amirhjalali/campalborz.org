# Quick Start Guide - Camp Alborz Platform

## Current Status
✅ Dependencies installed  
✅ Prisma client generated  
❌ PostgreSQL needs to be installed and running

## Next Steps

### 1. Install PostgreSQL

#### Option A: Download PostgreSQL for Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port is 5432

#### Option B: Use PostgreSQL Portable (No Admin Required)
1. Download from: https://github.com/garethflowers/postgresql-portable/releases
2. Extract to a folder
3. Run `PostgreSQLPortable.exe`

### 2. Create Database

Once PostgreSQL is running, create the database:

```bash
# Open Command Prompt and connect to PostgreSQL
psql -U postgres

# Enter your postgres password when prompted

# Create the database
CREATE DATABASE campalborz;

# Exit
\q
```

### 3. Update Database Connection

Edit `packages\api\.env` file and update the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campalborz?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 4. Run Database Migration

```bash
cd C:\Users\amirh\campalborz.org
npm run db:migrate
```

When prompted for migration name, type: `initial_setup`

### 5. Start the Development Server

```bash
npm run dev
```

## Alternative: Use SQLite for Quick Testing

If you want to quickly test without PostgreSQL, you can use SQLite:

1. Edit `packages\api\prisma\schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update `.env`:
```env
DATABASE_URL="file:./dev.db"
```

3. Regenerate Prisma client:
```bash
npm run db:generate
npm run db:migrate
```

## Alternative: Use Docker

If you have Docker installed:

```bash
# Start PostgreSQL in Docker
docker run --name campalborz-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=campalborz -p 5432:5432 -d postgres:14

# Update .env with:
DATABASE_URL="postgresql://postgres:password@localhost:5432/campalborz?schema=public"

# Run migrations
npm run db:migrate
```

## Troubleshooting

### PostgreSQL Not Starting on Windows

1. Check if PostgreSQL service is running:
   - Open Services (Win+R, type `services.msc`)
   - Look for "postgresql-x64-14" (or similar)
   - Right-click and select "Start"

2. Check if port 5432 is in use:
   ```bash
   netstat -an | findstr :5432
   ```

3. Try a different port:
   - Edit PostgreSQL's `postgresql.conf`
   - Change `port = 5432` to `port = 5433`
   - Update DATABASE_URL accordingly

### Permission Denied Errors

Run Command Prompt as Administrator when installing PostgreSQL or creating databases.

## What's Working Now

The platform has been built with:
- ✅ Multi-tenant architecture
- ✅ Core models (Tenants, Users, Organizations, Campaigns, Events, Donations)
- ✅ Prisma ORM setup
- ✅ TypeScript configuration
- ✅ Monorepo structure with Turborepo

## Services Available (Once Running)

- **API Server**: http://localhost:3001
- **Web Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3002
- **Prisma Studio**: http://localhost:5555 (run `npm run db:studio`)

## Quick Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development
npm run dev

# Open database GUI
npm run db:studio
```

---

💡 **Tip**: For the quickest setup without installing PostgreSQL, use the SQLite option above!