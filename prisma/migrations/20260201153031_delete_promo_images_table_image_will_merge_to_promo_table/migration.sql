/*
  Warnings:

  - You are about to drop the `PromoImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PromoImages" DROP CONSTRAINT "PromoImages_promoId_fkey";

-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "image" TEXT NOT NULL;

-- DropTable
DROP TABLE "PromoImages";
