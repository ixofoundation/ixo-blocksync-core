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
  const events: any = syncEvents(
    beginBlockEvents,
    transactionResponses.flatMap((txRes) => txRes.events),
    endBlockEvents,
    timestamp
  );
  const transactions: any = syncTransactions(transactionResponses, timestamp);

  try {
    await prisma.block.create({
      data: {
        height: blockHeight,
        hash: upperHexFromUint8Array(blockHash),
        time: timestamp,
        transactions: { create: transactions },
        events: { createMany: { data: events } },
      },
    });
    return;
  } catch (error) {
    console.error("syncBlock: ", error);
    return;
  }
};
