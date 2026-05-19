-- Up Migration

ALTER TABLE "MessageCore" ADD COLUMN "index" INTEGER NOT NULL;

ALTER TABLE "EventCore" ADD COLUMN "transactionHash" TEXT;

-- Down Migration