/*
  Warnings:

  - You are about to drop the column `targetAudiance` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "targetAudiance",
ADD COLUMN     "targetAudience" "Audience" NOT NULL DEFAULT 'GENERAL_PUBLIC';
