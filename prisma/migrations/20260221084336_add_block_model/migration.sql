/*
  Warnings:

  - You are about to drop the column `block` on the `rooms` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."rooms_block_idx";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "block",
ADD COLUMN     "blockId" TEXT;

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalFloors" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocks_name_key" ON "blocks"("name");

-- CreateIndex
CREATE INDEX "blocks_name_idx" ON "blocks"("name");

-- CreateIndex
CREATE INDEX "rooms_blockId_idx" ON "rooms"("blockId");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
