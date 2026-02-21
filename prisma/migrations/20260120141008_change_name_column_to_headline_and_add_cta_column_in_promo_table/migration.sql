/*
  Warnings:

  - You are about to drop the column `name` on the `Promo` table. All the data in the column will be lost.
  - Added the required column `CTA` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headline` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "name",
ADD COLUMN     "CTA" VARCHAR(40) NOT NULL,
ADD COLUMN     "headline" VARCHAR(30) NOT NULL;
