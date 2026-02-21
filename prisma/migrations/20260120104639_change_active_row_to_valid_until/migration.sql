/*
  Warnings:

  - Changed the type of `display` on the `Promo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "display",
ADD COLUMN     "display" TIMESTAMP(3) NOT NULL;
