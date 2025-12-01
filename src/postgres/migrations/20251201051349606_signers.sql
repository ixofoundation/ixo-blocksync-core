-- Up Migration

-- Add signer-related fields to TransactionCore
-- feePayer: extracted from tx events (acc_seq or fee_payer)
-- signerInfos: raw signer info array from authInfo (contains sequence, publicKey info)
-- nonCriticalExtensionOptions: raw extension options (contains TxExtension for smart accounts)
ALTER TABLE "TransactionCore" ADD COLUMN "feePayer" TEXT;
ALTER TABLE "TransactionCore" ADD COLUMN "signerInfos" JSONB;
ALTER TABLE "TransactionCore" ADD COLUMN "nonCriticalExtensionOptions" JSONB;

-- Down Migration
-- ALTER TABLE "TransactionCore" DROP COLUMN "nonCriticalExtensionOptions";
-- ALTER TABLE "TransactionCore" DROP COLUMN "signerInfos";
-- ALTER TABLE "TransactionCore" DROP COLUMN "feePayer";
