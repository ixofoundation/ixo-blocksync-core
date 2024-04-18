import { Prisma } from "@prisma/client";
import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { EventTypesArray } from "../types/Event";
import { decodeEvent } from "../util/proto";

export const syncEvents = (
  beginBlockEvents: Event[],
  txEvents: Event[],
  endBlockEvents: Event[],
  timestamp: Date,
  blockHeight: number
): Prisma.EventCoreCreateManyInput[] => {
  let allEvents: Prisma.EventCoreCreateManyInput[] = new Array();

  for (const e of beginBlockEvents) {
    const eventData = getEventData(e, timestamp, true, false, blockHeight);
    if (eventData) allEvents.push(eventData);
  }

  for (const e of txEvents) {
    const eventData = getEventData(e, timestamp, false, false, blockHeight);
    if (eventData) allEvents.push(eventData);
  }

  for (const e of endBlockEvents) {
    const eventData = getEventData(e, timestamp, false, true, blockHeight);
    if (eventData) allEvents.push(eventData);
  }

  // First index begin block events, then tx events, then end block events
  return allEvents;
};

const getEventData = (
  event: Event,
  timestamp: Date,
  isBeginBlockEvent = false,
  isEndBlockEvent = false,
  blockHeight: number
): Prisma.EventCoreCreateManyInput | undefined => {
  try {
    if (EventTypesArray.includes(event.type)) {
      const eventDoc = decodeEvent(event);
      return {
        type: eventDoc.type,
        attributes: eventDoc.attributes,
        time: timestamp,
        endBlockEvent: isEndBlockEvent,
        beginBlockEvent: isBeginBlockEvent,
        blockHeight: blockHeight,
      };
    }
    return;
  } catch (error) {
    console.error("getEventData: ", error.message);
    return;
  }
};
