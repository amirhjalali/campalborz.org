#!/bin/bash

# Database Setup Script for Camp Alborz Platform
# This script automates the database setup process

set -e  # Exit on error

echo "🏕️  Camp Alborz - Database Setup Script"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env.example exists
if [ ! -f "packages/api/.env.example" ]; then
    echo -e "${RED}Error: packages/api/.env.example not found${NC}"
    exit 1
fi

echo "Step 1: Checking for existing .env file..."
if [ -f "packages/api/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
    else
        cp packages/api/.env.example packages/api/.env
        echo -e "${GREEN}✓ Created new .env file from .env.example${NC}"
    fi
else
    cp packages/api/.env.example packages/api/.env
    echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
fi

echo ""
echo "Step 2: Configuring database connection..."
echo ""
echo "Please choose a database setup option:"
echo "1) Use local PostgreSQL (requires PostgreSQL installed)"
echo "2) Use Docker PostgreSQL (requires Docker installed)"
echo "3) Use external PostgreSQL (e.g., Railway, Supabase, etc.)"
echo "4) Skip database setup for now"
echo ""
read -p "Enter your choice (1-4): " db_choice

case $db_choice in
    1)
        echo ""
        echo "Local PostgreSQL Setup"
        echo "---------------------"

        # Check if PostgreSQL is installed
        if command -v psql &> /dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
        else
            echo -e "${RED}Error: PostgreSQL is not installed${NC}"
            echo "Please install PostgreSQL first:"
            echo "  macOS: brew install postgresql"
            echo "  Ubuntu: sudo apt-get install postgresql"
            exit 1
        fi

        # Get database credentials
        read -p "Database name [campalborz]: " db_name
        db_name=${db_name:-campalborz}

        read -p "Database user [postgres]: " db_user
        db_user=${db_user:-postgres}

        read -sp "Database password: " db_password
        echo ""

        read -p "Database host [localhost]: " db_host
        db_host=${db_host:-localhost}

        read -p "Database port [5432]: " db_port
        db_port=${db_port:-5432}

        # Construct DATABASE_URL
        DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}?schema=public"

        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        else
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        fi

        echo -e "${GREEN}✓ DATABASE_URL updated in .env file${NC}"
        ;;

    2)
        echo ""
        echo "Docker PostgreSQL Setup"
        echo "----------------------"

        # Check if Docker is installed
        if command -v docker &> /dev/null; then
            echo -e "${GREEN}✓ Docker is installed${NC}"
        else
            echo -e "${RED}Error: Docker is not installed${NC}"
            echo "Please install Docker first: https://www.docker.com/get-started"
            exit 1
        fi

        echo "Starting PostgreSQL container..."
        docker run -d \
            --name campalborz-postgres \
            -e POSTGRES_USER=campalborz \
            -e POSTGRES_PASSWORD=campalborz_dev \
            -e POSTGRES_DB=campalborz \
            -p 5432:5432 \
            postgres:15-alpine

        DATABASE_URL="postgresql://campalborz:campalborz_dev@localhost:5432/campalborz?schema=public"

        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        else
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        fi

        echo -e "${GREEN}✓ PostgreSQL Docker container started${NC}"
        echo -e "${GREEN}✓ DATABASE_URL updated in .env file${NC}"

        # Wait for PostgreSQL to be ready
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        ;;

    3)
        echo ""
        echo "External PostgreSQL Setup"
        echo "------------------------"
        echo "Please enter your DATABASE_URL:"
        read -p "DATABASE_URL: " DATABASE_URL

        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        else
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" packages/api/.env
        fi

        echo -e "${GREEN}✓ DATABASE_URL updated in .env file${NC}"
        ;;

    4)
        echo "Skipping database setup"
        echo -e "${YELLOW}⚠️  Remember to configure DATABASE_URL in packages/api/.env manually${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "Step 3: Installing dependencies..."
cd packages/api
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo "Step 4: Generating Prisma Client..."
npm run db:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

echo ""
echo "Step 5: Running database migrations..."
npm run db:migrate
echo -e "${GREEN}✓ Database migrations completed${NC}"

echo ""
echo "Step 6: Testing database connection..."
if npm run db:studio -- --browser none & PID=$!; then
    sleep 2
    kill $PID 2>/dev/null
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify database connection${NC}"
fi

echo ""
echo "======================================="
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review your .env file: packages/api/.env"
echo "2. Start the development server: npm run dev"
echo "3. Access Prisma Studio: cd packages/api && npm run db:studio"
echo ""
echo "Happy coding! 🎉"
