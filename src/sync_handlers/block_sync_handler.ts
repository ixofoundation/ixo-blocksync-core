import { Event } from "@ixo/impactxclient-sdk/types/codegen/tendermint/abci/types";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { upperHexFromUint8Array } from "../util/helpers";
import { syncEvents } from "./event_sync_handler";
import { syncTransactions } from "./transactions_sync_handler";
import { insertBlock } from "../postgres/block";

export const syncBlock = async (
  blockHeight: number,
  blockHash: Uint8Array,
  timestamp: Date,
  transactionResponses: TxResponse[],
  beginBlockEvents: Event[],
  endBlockEvents: Event[]
) => {
  const events = syncEvents(
    beginBlockEvents,
    transactionResponses.flatMap((txRes) => txRes.events),
    endBlockEvents
  );
  const { allMessages, allTransactions } =
    syncTransactions(transactionResponses);

  try {
    await insertBlock({
      height: blockHeight,
      hash: upperHexFromUint8Array(blockHash),
      time: timestamp,
      transactions: allTransactions,
      messages: allMessages,
      events: events,
    });
  } catch (error) {
    throw error;
  }
};
