/*
  Warnings:

  - You are about to drop the column `buttonLink` on the `HomepageHero` table. All the data in the column will be lost.
  - You are about to drop the column `buttonLink2` on the `HomepageHero` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `HomepageHero` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText2` on the `HomepageHero` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PageLocation" AS ENUM ('HEADER', 'FOOTER', 'BOTH', 'NONE');

-- AlterTable
ALTER TABLE "HomepageHero" DROP COLUMN "buttonLink",
DROP COLUMN "buttonLink2",
DROP COLUMN "buttonText",
DROP COLUMN "buttonText2",
ADD COLUMN     "youtubeUrls" TEXT[];

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "showIn" "PageLocation" NOT NULL DEFAULT 'NONE',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
