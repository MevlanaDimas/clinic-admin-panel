/*
  Warnings:

  - You are about to alter the column `name` on the `Promo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - You are about to alter the column `description` on the `Promo` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(130)`.
  - Made the column `description` on table `Promo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `PromoImages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Promo" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(130);

-- AlterTable
ALTER TABLE "PromoImages" ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "imageName" SET DATA TYPE TEXT;
