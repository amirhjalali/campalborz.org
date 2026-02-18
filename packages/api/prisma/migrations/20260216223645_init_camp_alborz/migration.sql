-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "SeasonMemberStatus" AS ENUM ('INTERESTED', 'MAYBE', 'CONFIRMED', 'WAITLISTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('TENT', 'SHIFTPOD', 'RV', 'TRAILER', 'DORM', 'SHARED', 'HEXAYURT', 'OTHER');

-- CreateEnum
CREATE TYPE "GridPower" AS ENUM ('NONE', 'AMP_30', 'AMP_50');

-- CreateEnum
CREATE TYPE "PreApprovalForm" AS ENUM ('YES', 'MAYBE', 'NO');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DUES', 'GRID', 'FOOD', 'DONATION', 'RV_VOUCHER', 'BEER_FUND', 'TENT', 'TICKET', 'STRIKE_DONATION', 'FUNDRAISING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('VENMO', 'ZELLE', 'CASH', 'CARD', 'PAYPAL', 'GIVEBUTTER', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('DGS', 'HOMA', 'BOOFER', 'STEWARD', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('SHADE', 'TENT', 'AC_UNIT', 'MATTRESS', 'COT', 'KITCHEN', 'BIKE', 'RUG', 'CONTAINER', 'GENERATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryRequestCategory" AS ENUM ('AC', 'MATTRESS', 'COT', 'TENT', 'BIKE', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'FULFILLED', 'DENIED');

-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('GENERATOR', 'FUEL', 'STORAGE', 'TRUCKS', 'SOUND', 'FOOD', 'CONTAINERS', 'BATHROOMS', 'WATER', 'GREY_WATER', 'SHOWERS', 'DECORATION', 'TRASH', 'SUPPLIES', 'ART', 'INFRASTRUCTURE', 'MISC');

-- CreateEnum
CREATE TYPE "ShiftAssignmentStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ApplicationExperience" AS ENUM ('FIRST_TIMER', 'BEEN_BEFORE', 'VETERAN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "playaName" TEXT,
    "phone" TEXT,
    "gender" "Gender",
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "dietaryRestrictions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "duesAmount" INTEGER NOT NULL,
    "gridFee30amp" INTEGER NOT NULL,
    "gridFee50amp" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "buildStartDate" TIMESTAMP(3),
    "strikeEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_members" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "SeasonMemberStatus" NOT NULL DEFAULT 'INTERESTED',
    "housingType" "HousingType",
    "housingSize" TEXT,
    "sharedWithId" TEXT,
    "gridPower" "GridPower" NOT NULL DEFAULT 'NONE',
    "arrivalDate" TIMESTAMP(3),
    "departureDate" TIMESTAMP(3),
    "rideDetails" TEXT,
    "preApprovalForm" "PreApprovalForm",
    "mapObject" TEXT,
    "specialRequests" TEXT,
    "buildCrew" BOOLEAN NOT NULL DEFAULT false,
    "strikeCrew" BOOLEAN NOT NULL DEFAULT false,
    "isAlborzVirgin" BOOLEAN NOT NULL DEFAULT false,
    "isBMVirgin" BOOLEAN NOT NULL DEFAULT false,
    "addedToWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paidTo" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidBy" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "receiptUrl" TEXT,
    "needsReimbursement" BOOLEAN NOT NULL DEFAULT false,
    "reimbursed" BOOLEAN NOT NULL DEFAULT false,
    "reimbursedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_lines" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "description" TEXT,
    "estimatedAmount" INTEGER NOT NULL,
    "actualAmount" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "TicketType" NOT NULL DEFAULT 'DGS',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "vehiclePass" BOOLEAN NOT NULL DEFAULT false,
    "purchaseConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_arrival_passes" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "passId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "early_arrival_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_days" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_assignments" (
    "id" TEXT NOT NULL,
    "buildDayId" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "wapTicketId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strike_assignments" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strike_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "dimensions" TEXT,
    "condition" TEXT,
    "storageLocation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_requests" (
    "id" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "category" "InventoryRequestCategory" NOT NULL,
    "status" "InventoryRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxVolunteers" INTEGER,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "seasonMemberId" TEXT NOT NULL,
    "status" "ShiftAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "playaName" TEXT,
    "referredBy" TEXT,
    "experience" "ApplicationExperience" NOT NULL,
    "interests" TEXT,
    "contribution" TEXT,
    "dietaryRestrictions" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "housingPreference" TEXT,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_role_idx" ON "members"("role");

-- CreateIndex
CREATE INDEX "members_isActive_idx" ON "members"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_year_key" ON "seasons"("year");

-- CreateIndex
CREATE INDEX "seasons_isActive_idx" ON "seasons"("isActive");

-- CreateIndex
CREATE INDEX "season_members_seasonId_idx" ON "season_members"("seasonId");

-- CreateIndex
CREATE INDEX "season_members_memberId_idx" ON "season_members"("memberId");

-- CreateIndex
CREATE INDEX "season_members_status_idx" ON "season_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "season_members_seasonId_memberId_key" ON "season_members"("seasonId", "memberId");

-- CreateIndex
CREATE INDEX "payments_seasonMemberId_idx" ON "payments"("seasonMemberId");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE INDEX "expenses_seasonId_idx" ON "expenses"("seasonId");

-- CreateIndex
CREATE INDEX "budget_lines_seasonId_idx" ON "budget_lines"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_lines_seasonId_category_key" ON "budget_lines"("seasonId", "category");

-- CreateIndex
CREATE INDEX "tickets_seasonId_idx" ON "tickets"("seasonId");

-- CreateIndex
CREATE INDEX "tickets_memberId_idx" ON "tickets"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "early_arrival_passes_seasonMemberId_key" ON "early_arrival_passes"("seasonMemberId");

-- CreateIndex
CREATE INDEX "early_arrival_passes_seasonId_idx" ON "early_arrival_passes"("seasonId");

-- CreateIndex
CREATE INDEX "build_days_seasonId_idx" ON "build_days"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "build_assignments_buildDayId_seasonMemberId_key" ON "build_assignments"("buildDayId", "seasonMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "strike_assignments_seasonMemberId_key" ON "strike_assignments"("seasonMemberId");

-- CreateIndex
CREATE INDEX "strike_assignments_seasonId_idx" ON "strike_assignments"("seasonId");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_requests_seasonMemberId_idx" ON "inventory_requests"("seasonMemberId");

-- CreateIndex
CREATE INDEX "inventory_requests_status_idx" ON "inventory_requests"("status");

-- CreateIndex
CREATE INDEX "shifts_seasonId_idx" ON "shifts"("seasonId");

-- CreateIndex
CREATE INDEX "shifts_date_idx" ON "shifts"("date");

-- CreateIndex
CREATE UNIQUE INDEX "shift_assignments_shiftId_seasonMemberId_key" ON "shift_assignments"("shiftId", "seasonMemberId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_email_idx" ON "applications"("email");

-- CreateIndex
CREATE INDEX "announcements_authorId_idx" ON "announcements"("authorId");

-- CreateIndex
CREATE INDEX "announcements_isPublished_expiresAt_idx" ON "announcements"("isPublished", "expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_memberId_idx" ON "audit_logs"("memberId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "season_members" ADD CONSTRAINT "season_members_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_members" ADD CONSTRAINT "season_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_members" ADD CONSTRAINT "season_members_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "season_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_arrival_passes" ADD CONSTRAINT "early_arrival_passes_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_arrival_passes" ADD CONSTRAINT "early_arrival_passes_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_days" ADD CONSTRAINT "build_days_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_assignments" ADD CONSTRAINT "build_assignments_buildDayId_fkey" FOREIGN KEY ("buildDayId") REFERENCES "build_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_assignments" ADD CONSTRAINT "build_assignments_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strike_assignments" ADD CONSTRAINT "strike_assignments_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strike_assignments" ADD CONSTRAINT "strike_assignments_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_requests" ADD CONSTRAINT "inventory_requests_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_requests" ADD CONSTRAINT "inventory_requests_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_seasonMemberId_fkey" FOREIGN KEY ("seasonMemberId") REFERENCES "season_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
