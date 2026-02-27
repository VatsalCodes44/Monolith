-- CreateEnum
CREATE TYPE "Asset" AS ENUM ('SOL', 'SKR');

-- CreateTable
CREATE TABLE "Transactions" (
    "signature" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "asset" "Asset" NOT NULL,
    "amount" BIGINT NOT NULL,
    "network" "Network" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("signature")
);

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_from_fkey" FOREIGN KEY ("from") REFERENCES "Player"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;
