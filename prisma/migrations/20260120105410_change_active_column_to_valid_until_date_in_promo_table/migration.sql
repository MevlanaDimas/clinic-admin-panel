/*
  Warnings:

  - You are about to drop the column `display` on the `Promo` table. All the data in the column will be lost.
  - Added the required column `validUntil` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "display",
ADD COLUMN     "validUntil" TIMESTAMP(3) NOT NULL;
