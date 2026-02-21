-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('PATIENT', 'GENERAL_PUBLIC', 'MEDICAL_PROFESSIONAL', 'INTERNAL_STAFF');

-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('META_ANALYSIS', 'RANDOMIZED_CONTROL', 'OBSERVATIONAL', 'EXPERT_OPINION');

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" VARCHAR(500),
    "categoryId" INTEGER NOT NULL,
    "tags" TEXT[],
    "targetAudiance" "Audience" NOT NULL DEFAULT 'GENERAL_PUBLIC',
    "evidenceLevel" "EvidenceLevel",
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "featuredImage" TEXT,
    "sourceLinks" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_publishedAt_idx" ON "News"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
