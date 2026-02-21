-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING');

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "block" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN     "pricePerNight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "rooms_block_idx" ON "rooms"("block");

-- CreateIndex
CREATE INDEX "rooms_floor_idx" ON "rooms"("floor");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "rooms"("status");
