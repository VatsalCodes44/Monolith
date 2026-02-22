/*
  Warnings:

  - You are about to drop the column `winner` on the `Game` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'TIME_OUT';

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "winner";
