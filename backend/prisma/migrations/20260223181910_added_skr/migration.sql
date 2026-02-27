/*
  Warnings:

  - You are about to drop the column `lamports` on the `Player` table. All the data in the column will be lost.
  - Added the required column `network` to the `PlayerNft` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "lamports",
ADD COLUMN     "devnetLamports" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "mainnetLamports" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayerNft" ADD COLUMN     "network" "Network" NOT NULL;
