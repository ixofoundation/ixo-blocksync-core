-- CreateTable
CREATE TABLE "Chain" (
    "chainId" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "Block" (
    "height" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("height")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "fee" JSONB NOT NULL,
    "gasUsed" TEXT NOT NULL,
    "gasWanted" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "blockHeight" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "typeUrl" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "transactionHash" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "attributes" JSONB[],
    "time" TIMESTAMP(3) NOT NULL,
    "beginBlockEvent" BOOLEAN NOT NULL DEFAULT false,
    "endBlockEvent" BOOLEAN NOT NULL DEFAULT false,
    "blockHeight" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;
