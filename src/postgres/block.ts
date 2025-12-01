import { dbQuery } from "./client";

export type BlockCore = {
  height: number;
  time: Date;
  hash: string;
  transactions: TransactionCore[];
  messages: MessageCore[];
  events: EventCore[];
};

export type TransactionCore = {
  hash: string;
  code: number;
  fee: any; // JSON
  gasUsed: string;
  gasWanted: string;
  memo: string;
  feePayer?: string;
  signerInfos?: any; // JSON - raw signer info array from authInfo
  nonCriticalExtensionOptions?: any; // JSON - raw extension options (contains TxExtension for smart accounts)
};

export type MessageCore = {
  typeUrl: string;
  value: any; // JSON
  transactionHash: string;
  index: number;
};

export type EventCore = {
  type: string;
  attributes: any[]; // JSON
  beginBlockEvent: boolean;
  endBlockEvent: boolean;
  transactionHash?: string;
};

const insertBlockSql = `
INSERT INTO "BlockCore" (height, hash, "time")
VALUES ($1, $2, $3);
`;
const insertTransactionSql = `
INSERT INTO "TransactionCore" (hash, code, fee, "gasUsed", "gasWanted", memo, "time", "blockHeight", "feePayer", "signerInfos", "nonCriticalExtensionOptions")
SELECT tr.hash, tr.code, tr.fee, tr."gasUsed", tr."gasWanted", tr.memo, $2, $3, tr."feePayer", tr."signerInfos", tr."nonCriticalExtensionOptions"
FROM jsonb_to_recordset($1) AS tr(hash text, code int, fee jsonb, "gasUsed" text, "gasWanted" text, memo text, "feePayer" text, "signerInfos" jsonb, "nonCriticalExtensionOptions" jsonb);
`;
const insertMessageSql = `
INSERT INTO "MessageCore" ("typeUrl", value, "transactionHash", "index")
SELECT msg."typeUrl", msg.value, msg."transactionHash", msg."index"
FROM jsonb_to_recordset($1) AS msg("typeUrl" text, value jsonb, "transactionHash" text, "index" int);
`;
const insertEventSql = `
INSERT INTO "EventCore" ("type", attributes, "beginBlockEvent", "endBlockEvent", "time", "blockHeight", "transactionHash")
SELECT ev.type, ev.attributes, ev."beginBlockEvent", ev."endBlockEvent", $2, $3, ev."transactionHash"
FROM jsonb_to_recordset($1) AS ev("type" text, attributes jsonb[], "beginBlockEvent" boolean, "endBlockEvent" boolean, "transactionHash" text);
`;

export const insertBlock = async (block: BlockCore): Promise<void> => {
  try {
    await dbQuery(insertBlockSql, [block.height, block.hash, block.time]);
    if (block.transactions.length) {
      await dbQuery(insertTransactionSql, [
        JSON.stringify(block.transactions),
        block.time,
        block.height,
      ]);
    }
    if (block.messages.length) {
      await dbQuery(insertMessageSql, [JSON.stringify(block.messages)]);
    }
    if (block.events.length) {
      await dbQuery(insertEventSql, [
        JSON.stringify(block.events),
        block.time,
        block.height,
      ]);
    }
  } catch (error) {
    throw error;
  }
};
