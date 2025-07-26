-- Migration script to transform from grade-based to category-based system
-- This script handles data transformation and schema changes

-- Step 1: Create new enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROFESSOR', 'STUDENT');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Step 2: Create new tables
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymobOrderId" TEXT,
    "paymobTxnId" TEXT,
    "paymobResponse" JSONB,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "watchedDuration" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewingHistory_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add new columns to existing tables
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'STUDENT';
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "expertise" TEXT[];
ALTER TABLE "User" ALTER COLUMN "parentPhone" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "studentId" DROP NOT NULL;

ALTER TABLE "Course" ADD COLUMN "price" DECIMAL(65,30);
ALTER TABLE "Course" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EGP';
ALTER TABLE "Course" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Course" ADD COLUMN "professorId" TEXT;

ALTER TABLE "Lesson" ADD COLUMN "duration" INTEGER;

ALTER TABLE "Enrollment" ADD COLUMN "totalWatchTime" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN "lastAccessedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 4: Create default categories for migration
INSERT INTO "Category" ("id", "name", "description", "slug", "createdAt", "updatedAt") VALUES
('cat_math_general', 'الرياضيات العامة', 'دورات الرياضيات للمراحل الدراسية المختلفة', 'math-general', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_pt_fitness', 'التربية البدنية واللياقة', 'دورات التربية البدنية واللياقة البدنية', 'pt-fitness', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_nutrition', 'التغذية والصحة', 'دورات التغذية والصحة العامة', 'nutrition', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_swimming', 'السباحة والرياضات المائية', 'دورات السباحة والرياضات المائية', 'swimming', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_muscle_training', 'تدريب العضلات', 'دورات تدريب العضلات وكمال الأجسام', 'muscle-training', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 5: Transform existing data
-- Convert admin users
UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;

-- Assign existing courses to default math category and create professor accounts
-- First, create a default professor for existing courses
INSERT INTO "User" ("id", "phone", "name", "password", "role", "bio", "expertise", "createdAt", "updatedAt")
VALUES ('prof_default_math', '+201000000000', 'أستاذ الرياضيات', '$2a$10$defaulthashedpassword', 'PROFESSOR', 'أستاذ الرياضيات للمراحل الدراسية', ARRAY['الرياضيات', 'الجبر', 'الهندسة'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("phone") DO NOTHING;

-- Assign all existing courses to math category and default professor
UPDATE "Course" SET 
    "categoryId" = 'cat_math_general',
    "professorId" = 'prof_default_math',
    "isPublished" = true;

-- Step 6: Create unique constraints and indexes
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");
CREATE UNIQUE INDEX "Payment_paymobOrderId_key" ON "Payment"("paymobOrderId");
CREATE UNIQUE INDEX "ViewingHistory_userId_lessonId_key" ON "ViewingHistory"("userId", "lessonId");

-- Step 7: Create indexes for performance
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");
CREATE INDEX "Course_professorId_idx" ON "Course"("professorId");
CREATE INDEX "Course_isPublished_idx" ON "Course"("isPublished");
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_courseId_idx" ON "Payment"("courseId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "ViewingHistory_userId_idx" ON "ViewingHistory"("userId");
CREATE INDEX "ViewingHistory_lessonId_idx" ON "ViewingHistory"("lessonId");
CREATE INDEX "ViewingHistory_completed_idx" ON "ViewingHistory"("completed");

-- Step 8: Add foreign key constraints
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ViewingHistory" ADD CONSTRAINT "ViewingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ViewingHistory" ADD CONSTRAINT "ViewingHistory_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Make required fields NOT NULL after data transformation
ALTER TABLE "Course" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Course" ALTER COLUMN "professorId" SET NOT NULL;

-- Step 10: Drop old columns and constraints (commented out for safety - run manually after verification)
-- ALTER TABLE "User" DROP COLUMN "grade";
-- ALTER TABLE "User" DROP COLUMN "isAdmin";
-- ALTER TABLE "Course" DROP COLUMN "targetGrade";
-- DROP TYPE "Grade";