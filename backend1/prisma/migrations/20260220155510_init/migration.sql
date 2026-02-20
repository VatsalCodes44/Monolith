/*
  Warnings:

  - Added the required column `lamports` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "lamports" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "lamports" SET DATA TYPE BIGINT;
