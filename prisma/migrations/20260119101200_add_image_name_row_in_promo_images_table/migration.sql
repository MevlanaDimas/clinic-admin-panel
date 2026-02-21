/*
  Warnings:

  - Added the required column `imageName` to the `PromoImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PromoImages" ADD COLUMN     "imageName" VARCHAR(50) NOT NULL;
