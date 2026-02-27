/*
  Warnings:

  - You are about to drop the column `player1Color` on the `Game` table. All the data in the column will be lost.
  - Added the required column `network` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Network" AS ENUM ('MAINNET', 'DEVNET');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "player1Color",
ADD COLUMN     "network" "Network" NOT NULL;
