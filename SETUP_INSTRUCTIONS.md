# Camp Alborz Platform - Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - Already installed ✓

## Quick Start Guide

### 1. Clone the Repository (Already Done ✓)
You already have the repository cloned at `C:\Users\amirh\campalborz.org`

### 2. Install Dependencies
Open a terminal in the project root directory and run:

```bash
cd C:\Users\amirh\campalborz.org
npm install
```

This will install all dependencies for the monorepo and all packages.

### 3. Set Up Environment Variables

Create a `.env` file in the `packages/api` directory:

```bash
cd packages\api
```

Copy `packages/api/.env.example` to `packages/api/.env` and fill in values. The canonical variables the API reads are:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/campalborz?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3005
HOST=0.0.0.0
NODE_ENV=development

# CORS / Frontend origin(s)
# FRONTEND_URL: single allowed web origin (simplest case)
# CORS_ORIGIN: comma-separated list; takes precedence over FRONTEND_URL when set
FRONTEND_URL="http://localhost:3006"
CORS_ORIGIN="http://localhost:3006,http://localhost:3000"

# Email Service (optional) -- use either SendGrid or SMTP
SENDGRID_API_KEY=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="Camp Alborz <noreply@campalborz.org>"
APP_URL="http://localhost:3006"

# Stripe (placeholder -- not currently wired to real payments; donations are handled by Givebutter)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AWS S3 (optional, for file storage)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
```

See `packages/api/.env.example` for the source of truth.

### 4. Set Up PostgreSQL Database

1. **Create a PostgreSQL database:**

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE campalborz;

-- Create a user (optional, for production)
CREATE USER campalborz_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE campalborz TO campalborz_user;

-- Exit
\q
```

### 5. Initialize the Database Schema

Run Prisma migrations to create all database tables:

```bash
cd C:\Users\amirh\campalborz.org
npm run db:generate
npm run db:migrate
```

**Note:** The migration might take a while due to the extensive schema (80 steps worth of models).

### 6. Seed Initial Data (Optional)

Create an initial tenant and admin user:

```bash
cd scripts
npm run setup-tenant
```

Follow the prompts to create:
- Organization name
- Admin email
- Admin password

### 7. Start the Development Servers

Start all services in development mode:

```bash
cd C:\Users\amirh\campalborz.org
npm run dev
```

This will start:
- **Web Frontend (Next.js)**: http://localhost:3006
- **API Server (Express)**: http://localhost:3005

There is no separate admin dashboard or mobile API process. Admin pages (`/admin/*`) are served by the main web app on port 3006.

## Verify Installation

### 1. Check API Health
Open your browser and navigate to:
```
http://localhost:3005/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-xx-xx..."
}
```

### 2. Check Database Connection
Open Prisma Studio to view your database:

```bash
npm run db:studio
```

This opens a browser at http://localhost:5555 where you can explore your database tables.

### 3. Access the Web Application
Navigate to http://localhost:3006 in your browser. You should see the Camp Alborz homepage.

### 4. Access the Admin Dashboard
Navigate to http://localhost:3006/admin for the admin interface (authentication required).

## Common Issues & Solutions

### Issue: Database Connection Failed
**Error:** `P1001: Can't reach database server`

**Solution:**
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Or check PostgreSQL status in Services
   ```
2. Verify your DATABASE_URL in `.env` file
3. Check PostgreSQL is listening on port 5432

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3005` (API) or `:::3006` (web)

**Solution:**
1. Kill the process using the port:
   ```bash
   # macOS / Linux
   lsof -ti :3005 | xargs kill -9
   lsof -ti :3006 | xargs kill -9

   # Windows
   netstat -ano | findstr :3005
   taskkill /PID <PID> /F
   ```
2. Or change the API `PORT` in `packages/api/.env` (the web port is pinned in `packages/web/package.json`)

### Issue: Prisma Migration Fails
**Error:** `P3009: migrate found failed migrations`

**Solution:**
1. Reset the database (WARNING: This deletes all data):
   ```bash
   cd packages\api
   npx prisma migrate reset
   ```
2. Run migrations again:
   ```bash
   npx prisma migrate dev
   ```

### Issue: Module Not Found
**Error:** `Cannot find module '@camp-platform/shared'`

**Solution:**
1. Rebuild the shared package:
   ```bash
   cd packages\shared
   npm run build
   ```
2. Clean and reinstall:
   ```bash
   cd C:\Users\amirh\campalborz.org
   npm run clean
   npm install
   ```

## Production Deployment

For production deployment:

1. **Build all packages:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   - Use strong, unique passwords
   - Configure production database
   - Set up proper SMTP for emails
   - Configure production Stripe keys
   - Set up CDN and file storage

3. **Run database migrations:**
   ```bash
   NODE_ENV=production npx prisma migrate deploy
   ```

4. **Start with PM2 or similar:**
   ```bash
   npm install -g pm2
   pm2 start packages/api/dist/index.js --name camp-api
   ```

## Docker Deployment (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Next Steps

1. **Configure Authentication:** Set up proper JWT secrets and session management
2. **Set Up Email:** Configure SMTP for sending emails
3. **Enable Payments:** Set up Stripe for donation processing
4. **Configure Storage:** Set up S3 or local storage for file uploads
5. **Set Up Monitoring:** Configure error tracking and performance monitoring
6. **Enable Analytics:** Set up analytics and reporting dashboards

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/amirhjalali/campalborz.org/issues)
- Review the documentation in `/docs` (to be created)
- Contact: amirhjalali@gmail.com

## Development Commands Reference

```bash
# Development
npm run dev                 # Start all services in dev mode
npm run build              # Build all packages
npm run test               # Run tests
npm run lint               # Lint code
npm run type-check         # TypeScript type checking

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:studio          # Open Prisma Studio

# Utilities
npm run setup:tenant       # Create new tenant
npm run clean             # Clean all build artifacts
```

---

🎉 **Congratulations!** Your Camp Alborz platform should now be running locally!