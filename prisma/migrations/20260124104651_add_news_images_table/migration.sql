/*
  Warnings:

  - You are about to drop the column `featuredImage` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "featuredImage";

-- CreateTable
CREATE TABLE "NewsImages" (
    "id" SERIAL NOT NULL,
    "newsId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsImages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsImages_newsId_idx" ON "NewsImages"("newsId");

-- AddForeignKey
ALTER TABLE "NewsImages" ADD CONSTRAINT "NewsImages_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;
