-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'WHITE_WON', 'BLACK_WON', 'DRAW', 'CHECKMATE', 'STALEMATE');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('w', 'b');

-- CreateTable
CREATE TABLE "Player" (
    "publicKey" TEXT NOT NULL,
    "lamports" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("publicKey")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "player1PublicKey" TEXT NOT NULL,
    "player2PublicKey" TEXT NOT NULL,
    "player1Color" "Color" NOT NULL,
    "fen" TEXT NOT NULL,
    "winner" TEXT,
    "status" "GameStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerNft" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "mintedNft" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerNft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player1PublicKey_fkey" FOREIGN KEY ("player1PublicKey") REFERENCES "Player"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player2PublicKey_fkey" FOREIGN KEY ("player2PublicKey") REFERENCES "Player"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerNft" ADD CONSTRAINT "PlayerNft_publicKey_fkey" FOREIGN KEY ("publicKey") REFERENCES "Player"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;
