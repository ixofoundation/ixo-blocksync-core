import { prisma } from "../prisma/prisma_client";
import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { upperHexFromUint8Array } from "../util/helpers";
import { syncEvents } from "./event_sync_handler";
import { syncTransactions } from "./transactions_sync_handler";

export const syncBlock = async (
  blockHeight: number,
  blockHash: Uint8Array,
  timestamp: Date,
  transactionResponses: TxResponse[],
  beginBlockEvents: Event[],
  endBlockEvents: Event[]
) => {
  // console.log("Syncing Block 1 wait then sync events", getMemoryUsage());
  // await sleep(wait);
  const events = syncEvents(
    beginBlockEvents,
    transactionResponses.flatMap((txRes) => txRes.events),
    endBlockEvents,
    timestamp,
    blockHeight
  );
  const { allMessages, allTransactions } = syncTransactions(
    transactionResponses,
    timestamp,
    blockHeight
  );

  try {
    await prisma.$transaction([
      prisma.blockCore.create({
        data: {
          height: blockHeight,
          hash: upperHexFromUint8Array(blockHash),
          time: timestamp,
        },
        select: { height: true },
      }),
      // spread creations as more performant than createMany
      ...events.map((event) =>
        prisma.eventCore.create({ data: event, select: { id: true } })
      ),
      ...allTransactions.map((tx) =>
        prisma.transactionCore.create({ data: tx, select: { code: true } })
      ),
      ...allMessages.map((msg) =>
        prisma.messageCore.create({ data: msg, select: { id: true } })
      ),
    ]);

    return;
  } catch (error) {
    console.error("ERROR::syncBlock:: ", error);
    return;
    // throw error;
  }
};
