/*
  Warnings:

  - You are about to drop the column `schedule` on the `DoctorPracticeSchedule` table. All the data in the column will be lost.
  - Added the required column `day` to the `DoctorPracticeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `DoctorPracticeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `DoctorPracticeSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoctorPracticeSchedule" DROP COLUMN "schedule",
ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TEXT NOT NULL;
