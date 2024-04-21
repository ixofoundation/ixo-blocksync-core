import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { EventTypesSet } from "../types/Event";
import { decodeEvent } from "../util/proto";
import { EventCore } from "../postgres/block";

export const syncEvents = (
  beginBlockEvents: Event[],
  txEvents: Event[],
  endBlockEvents: Event[]
): EventCore[] => {
  let allEvents: EventCore[] = new Array();

  // First index begin block events, then tx events, then end block events
  for (const e of beginBlockEvents) {
    const eventData = getEventData(e, true, false);
    if (eventData) allEvents.push(eventData);
  }

  for (const e of txEvents) {
    const eventData = getEventData(e, false, false);
    if (eventData) allEvents.push(eventData);
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
  isEndBlockEvent = false
): EventCore | undefined => {
  try {
    if (EventTypesSet.has(event.type)) {
      const eventDoc = decodeEvent(event);
      return {
        type: eventDoc.type,
        attributes: eventDoc.attributes,
        endBlockEvent: isEndBlockEvent,
        beginBlockEvent: isBeginBlockEvent,
      };
    }
    return;
  } catch (error) {
    console.error("ERROR::getEventData:: ", error.message);
    return;
  }
};
