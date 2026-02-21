/*
  Warnings:

  - You are about to drop the column `image` on the `Promo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "PromoImages" (
    "id" SERIAL NOT NULL,
    "promoId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoImages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoImages_promoId_idx" ON "PromoImages"("promoId");

-- AddForeignKey
ALTER TABLE "PromoImages" ADD CONSTRAINT "PromoImages_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "Promo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
