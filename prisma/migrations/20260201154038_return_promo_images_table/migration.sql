/*
  Warnings:

  - A unique constraint covering the columns `[promoId]` on the table `PromoImages` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PromoImages_promoId_key" ON "PromoImages"("promoId");
