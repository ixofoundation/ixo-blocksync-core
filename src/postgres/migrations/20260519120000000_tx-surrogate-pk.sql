-- Up Migration
-- Switch TransactionCore PK to surrogate `id`.
-- The same tx hash can legitimately appear in multiple blocks (and theoretically
-- multiple times in the same block) in cosmos-sdk, because failed-seq-mismatch txs
-- are still included on-chain and the bytes can be re-broadcast and re-included.

-- Step 1: Add surrogate id (SERIAL fills values for existing rows) and txIndex
ALTER TABLE "TransactionCore" ADD COLUMN "id" SERIAL;
ALTER TABLE "TransactionCore" ADD COLUMN "txIndex" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Backfill txIndex within each block using existing id order
UPDATE "TransactionCore" SET "txIndex" = sub.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "blockHeight" ORDER BY "id") - 1 AS rn
  FROM "TransactionCore"
) sub
WHERE "TransactionCore"."id" = sub."id";
ALTER TABLE "TransactionCore" ALTER COLUMN "txIndex" DROP DEFAULT;

-- Step 3: Add transactionId + blockHeight to MessageCore (nullable for backfill)
ALTER TABLE "MessageCore" ADD COLUMN "transactionId" INTEGER;
ALTER TABLE "MessageCore" ADD COLUMN "blockHeight" INTEGER;

UPDATE "MessageCore" m
SET "transactionId" = t."id", "blockHeight" = t."blockHeight"
FROM "TransactionCore" t
WHERE m."transactionHash" = t."hash";

ALTER TABLE "MessageCore" ALTER COLUMN "transactionId" SET NOT NULL;
ALTER TABLE "MessageCore" ALTER COLUMN "blockHeight" SET NOT NULL;

-- Step 4: Swap PK and FK
ALTER TABLE "MessageCore" DROP CONSTRAINT "MessageCore_transactionHash_fkey";
ALTER TABLE "TransactionCore" DROP CONSTRAINT "TransactionCore_pkey";
ALTER TABLE "TransactionCore" ADD CONSTRAINT "TransactionCore_pkey" PRIMARY KEY ("id");
ALTER TABLE "MessageCore" ADD CONSTRAINT "MessageCore_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "TransactionCore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Indexes — `hash` is no longer unique, replace its implicit PK index with a regular one
CREATE INDEX "TransactionCore_hash_idx" ON "TransactionCore"("hash");
CREATE INDEX "TransactionCore_hash_blockHeight_idx" ON "TransactionCore"("hash", "blockHeight");
CREATE INDEX "MessageCore_transactionId_idx" ON "MessageCore"("transactionId");
CREATE INDEX "MessageCore_blockHeight_idx" ON "MessageCore"("blockHeight");

-- Down Migration
