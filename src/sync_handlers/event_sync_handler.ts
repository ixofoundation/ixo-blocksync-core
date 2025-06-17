import { EventTypesSet } from "../types/Event";
import { decodeEvent } from "../util/proto";
import { EventCore } from "../postgres/block";
import { Event } from "@ixo/impactxclient-sdk/types/codegen/tendermint/abci/types";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";

export const syncEvents = (
  beginBlockEvents: Event[],
  txResponses: TxResponse[],
  endBlockEvents: Event[]
): EventCore[] => {
  let allEvents: EventCore[] = new Array();

  // First index begin block events, then tx events, then end block events
  for (const e of beginBlockEvents) {
    const eventData = getEventData(e, true, false);
    if (eventData) allEvents.push(eventData);
  }

  for (let i = 0; i < txResponses.length; i++) {
    for (const e of txResponses[i].events) {
      const eventData = getEventData(e, false, false, txResponses[i].txhash);
      if (eventData) allEvents.push(eventData);
    }
  }

  for (const e of endBlockEvents) {
    const eventData = getEventData(e, false, true);
    if (eventData) allEvents.push(eventData);
  }

  return allEvents;
};

const getEventData = (
  event: Event,
  isBeginBlockEvent = false,
  isEndBlockEvent = false,
  transactionHash?: string
): EventCore | undefined => {
  try {
    if (EventTypesSet.has(event.type)) {
      const eventDoc = decodeEvent(event);
      return {
        type: eventDoc.type,
        attributes: eventDoc.attributes,
        endBlockEvent: isEndBlockEvent,
        beginBlockEvent: isBeginBlockEvent,
        transactionHash,
      };
    }
    return;
  } catch (error) {
    console.error("ERROR::getEventData:: ", error.message);
    return;
  }
};
