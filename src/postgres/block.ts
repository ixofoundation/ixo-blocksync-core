import { withTransaction } from "./client";

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
};

export type MessageCore = {
  typeUrl: string;
  value: any; // JSON
  transactionHash: string;
};

export type EventCore = {
  type: string;
  attributes: any[]; // JSON
  beginBlockEvent: boolean;
  endBlockEvent: boolean;
};

const insertBlockSql = `
INSERT INTO "BlockCore" (height, hash, "time")
VALUES ($1, $2, $3);
`;
const insertTransactionSql = `
INSERT INTO "TransactionCore" (hash, code, fee, "gasUsed", "gasWanted", memo, "time", "blockHeight")
SELECT tr.hash, tr.code, tr.fee, tr."gasUsed", tr."gasWanted", tr.memo, $2, $3
FROM jsonb_to_recordset($1) AS tr(hash text, code int, fee jsonb, "gasUsed" text, "gasWanted" text, memo text);
`;
const insertMessageSql = `
INSERT INTO "MessageCore" ("typeUrl", value, "transactionHash")
SELECT msg."typeUrl", msg.value, msg."transactionHash"
FROM jsonb_to_recordset($1) AS msg("typeUrl" text, value jsonb, "transactionHash" text);
`;
const insertEventSql = `
INSERT INTO "EventCore" ("type", attributes, "beginBlockEvent", "endBlockEvent", "time", "blockHeight")
SELECT ev.type, ev.attributes, ev."beginBlockEvent", ev."endBlockEvent", $2, $3
FROM jsonb_to_recordset($1) AS ev("type" text, attributes jsonb[], "beginBlockEvent" boolean, "endBlockEvent" boolean);
`;

export const insertBlock = async (block: BlockCore): Promise<void> => {
  try {
    // do all the insertions in a single transaction
    await withTransaction(async (client) => {
      await client.query(insertBlockSql, [
        block.height,
        block.hash,
        block.time,
      ]);
      if (block.transactions.length) {
        await client.query(insertTransactionSql, [
          JSON.stringify(block.transactions),
          block.time,
          block.height,
        ]);
      }
      if (block.messages.length) {
        await client.query(insertMessageSql, [JSON.stringify(block.messages)]);
      }
      if (block.events.length) {
        await client.query(insertEventSql, [
          JSON.stringify(block.events),
          block.time,
          block.height,
        ]);
      }
    });
  } catch (error) {
    throw error;
  }
};
