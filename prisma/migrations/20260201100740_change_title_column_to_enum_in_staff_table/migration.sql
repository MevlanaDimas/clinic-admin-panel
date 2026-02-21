/*
  Warnings:

  - The `title` column on the `Staff` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StaffTitle" AS ENUM ('Staff', 'Doctor', 'Admin');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLING', 'DONE');

-- CreateEnum
CREATE TYPE "CounterNumber" AS ENUM ('ONE', 'TWO');

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "title",
ADD COLUMN     "title" "StaffTitle" NOT NULL DEFAULT 'Staff';

-- CreateTable
CREATE TABLE "QueueTicket" (
    "id" TEXT NOT NULL,
    "tokenNumber" SERIAL NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "counterNumber" "CounterNumber",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QueueTicket_status_idx" ON "QueueTicket"("status");
