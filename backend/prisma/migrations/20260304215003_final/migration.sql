/*
  Warnings:

  - You are about to drop the `PlayerNft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerNft" DROP CONSTRAINT "PlayerNft_publicKey_fkey";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "devnetDraw" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "devnetLoss" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "devnetRating" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "devnetSolLost" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "devnetSolWon" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "devnetWins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetDraw" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetLoss" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetRating" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "mainnetSolLost" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetSolWon" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetWins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "peakDevnetRating" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "peakMainnetRating" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "skrUsed" BIGINT NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "PlayerNft";
