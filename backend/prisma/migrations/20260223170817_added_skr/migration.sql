/*
  Warnings:

  - The values [WHITE_WON,BLACK_WON] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('IN_PROGRESS', 'DRAW', 'CHECKMATE', 'STALEMATE', 'TIME_OUT');
ALTER TABLE "Game" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "public"."GameStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "skr" BIGINT NOT NULL DEFAULT 0,
ALTER COLUMN "lamports" SET DEFAULT 0;
