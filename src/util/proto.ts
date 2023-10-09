import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { cosmos, utils } from "@ixo/impactxclient-sdk";
import Long from "long";
import { queryClient, registry, tendermintClient } from "../sync/sync_chain";

export const getLatestBlock = async () => {
  try {
    const res =
      await queryClient.cosmos.base.tendermint.v1beta1.getLatestBlock();
    return res;
  } catch (error) {
    console.error("getLatestBlock: ", error.message);
    return;
  }
};

export const getBlockbyHeight = async (height: number | string) => {
  try {
    const res =
      await queryClient.cosmos.base.tendermint.v1beta1.getBlockByHeight({
        height: Long.fromNumber(Number(height)),
      });
    return res;
  } catch (error) {
    if (error.toString().includes("(18)")) {
      console.log("Waiting for Blocks");
      return;
    }
    console.error("getBlockbyHeight: ", error.message);
    return;
  }
};

export const getTxsEvent = async (height: number) => {
  try {
    const res = await queryClient.cosmos.tx.v1beta1.getTxsEvent({
      events: [`tx.height=${height}`],
      orderBy: cosmos.tx.v1beta1.OrderBy.ORDER_BY_ASC,
    });
    return res;
  } catch (error) {
    console.error("getTxsEvent: ", error.message);
    return;
  }
};

export const getTMBlockbyHeight = async (height: number) => {
  try {
    const res = await tendermintClient.blockResults(height);
    return res;
  } catch (error) {
    if (!error.toString().includes('"code":-32603'))
      console.error("getTMBlockbyHeight: ", error.message);
    return;
  }
};

export const getTx = async (hash: string) => {
  try {
    const res = await queryClient.cosmos.tx.v1beta1.getTx({ hash });
    return res;
  } catch (error) {
    console.error("getTx: ", error.message);
    return;
  }
};

export const decodeTransaction = (tx: TxResponse) => {
  try {
    const res = registry.decode(tx.tx!);
    return res;
  } catch (error) {
    console.error("decodeTransaction: ", error);
    return;
  }
};

export const decodeMessage = (tx: any) => {
  try {
    return registry.decode(tx);
  } catch (error) {
    console.error("decodeMessage: ", error.message);
    return;
  }
};

export const decodeEvent = (event: Event) => {
  const attributes = event.attributes.map((attr) => ({
    key: utils.conversions.Uint8ArrayToJS(attr.key),
    value: utils.conversions.Uint8ArrayToJS(attr.value),
  }));

  return {
    type: event.type,
    attributes: attributes,
  };
};
