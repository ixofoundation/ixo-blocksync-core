-- INITIALIZATION SCRIPT, creating all tables and indexes

-- Up Migration

-- CreateTable
CREATE TABLE "ChainCore" (
    "chainId" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,

    CONSTRAINT "ChainCore_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "BlockCore" (
    "height" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockCore_pkey" PRIMARY KEY ("height")
);

-- CreateTable
CREATE TABLE "TransactionCore" (
    "hash" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "fee" JSONB NOT NULL,
    "gasUsed" TEXT NOT NULL,
    "gasWanted" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "memo" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TransactionCore_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "MessageCore" (
    "id" SERIAL NOT NULL,
    "typeUrl" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "transactionHash" TEXT NOT NULL,

    CONSTRAINT "MessageCore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCore" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "attributes" JSONB[],
    "time" TIMESTAMP(3) NOT NULL,
    "beginBlockEvent" BOOLEAN NOT NULL DEFAULT false,
    "endBlockEvent" BOOLEAN NOT NULL DEFAULT false,
    "blockHeight" INTEGER NOT NULL,

    CONSTRAINT "EventCore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockCore_hash_key" ON "BlockCore"("hash");

-- CreateIndex
CREATE INDEX "TransactionCore_blockHeight_idx" ON "TransactionCore"("blockHeight");

-- CreateIndex
CREATE INDEX "MessageCore_transactionHash_idx" ON "MessageCore"("transactionHash");

-- CreateIndex
CREATE INDEX "EventCore_blockHeight_idx" ON "EventCore"("blockHeight");

-- AddForeignKey
ALTER TABLE "TransactionCore" ADD CONSTRAINT "TransactionCore_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "BlockCore"("height") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCore" ADD CONSTRAINT "MessageCore_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "TransactionCore"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCore" ADD CONSTRAINT "EventCore_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "BlockCore"("height") ON DELETE CASCADE ON UPDATE CASCADE;

-- Down Migration
