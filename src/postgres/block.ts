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
  txIndex: number;
};

export type MessageCore = {
  typeUrl: string;
  value: any; // JSON
  transactionHash: string;
  index: number;
  txIndex: number; // transient: matches parent TransactionCore.txIndex within the block
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
INSERT INTO "TransactionCore" (hash, code, fee, "gasUsed", "gasWanted", memo, "time", "blockHeight", "feePayer", "signerInfos", "nonCriticalExtensionOptions", "txIndex")
SELECT tr.hash, tr.code, tr.fee, tr."gasUsed", tr."gasWanted", tr.memo, $2, $3, tr."feePayer", tr."signerInfos", tr."nonCriticalExtensionOptions", tr."txIndex"
FROM jsonb_to_recordset($1) AS tr(hash text, code int, fee jsonb, "gasUsed" text, "gasWanted" text, memo text, "feePayer" text, "signerInfos" jsonb, "nonCriticalExtensionOptions" jsonb, "txIndex" int)
RETURNING id, "txIndex";
`;
const insertMessageSql = `
INSERT INTO "MessageCore" ("typeUrl", value, "transactionHash", "transactionId", "blockHeight", "index")
SELECT msg."typeUrl", msg.value, msg."transactionHash", msg."transactionId", $2, msg."index"
FROM jsonb_to_recordset($1) AS msg("typeUrl" text, value jsonb, "transactionHash" text, "transactionId" int, "index" int);
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
      const txResult = await dbQuery(insertTransactionSql, [
        JSON.stringify(block.transactions),
        block.time,
        block.height,
      ]);

      // Map txIndex -> generated id so messages can be linked to their parent tx.
      const txIdByIndex = new Map<number, number>(
        txResult.rows.map((r: any) => [r.txIndex, r.id])
      );

      if (block.messages.length) {
        const messagesWithTxId = block.messages.map((m) => ({
          typeUrl: m.typeUrl,
          value: m.value,
          transactionHash: m.transactionHash,
          transactionId: txIdByIndex.get(m.txIndex),
          index: m.index,
        }));
        await dbQuery(insertMessageSql, [
          JSON.stringify(messagesWithTxId),
          block.height,
        ]);
      }
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
