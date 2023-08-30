import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { EventTypesArray } from "../types/Event";
import { decodeEvent } from "../util/proto";

export const syncEvents = (
  beginBlockEvents: Event[],
  txEvents: Event[],
  endBlockEvents: Event[],
  timestamp: Date
) => {
  // First index begin block events, then tx events, then end block events
  return beginBlockEvents
    .map((e) => getEventData(e, timestamp, true))
    .concat(
      txEvents.map((e) => getEventData(e, timestamp)),
      endBlockEvents.map((e) => getEventData(e, timestamp, false, true))
    )
    .filter((e) => !!e);
};

const getEventData = (
  event: Event,
  timestamp: Date,
  isBeginBlockEvent = false,
  isEndBlockEvent = false
) => {
  try {
    if (EventTypesArray.includes(event.type)) {
      const eventDoc = decodeEvent(event);
      return {
        type: eventDoc.type,
        attributes: eventDoc.attributes,
        time: timestamp,
        endBlockEvent: isEndBlockEvent,
        beginBlockEvent: isBeginBlockEvent,
      };
    }
    return;
  } catch (error) {
    console.error("getEventData: ", error.message);
    return;
  }
};
