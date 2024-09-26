import * as Proto from "../util/proto";
import * as BlockSyncHandler from "../sync_handlers/block_sync_handler";
import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { currentChain } from "./sync_chain";
import { utils } from "@ixo/impactxclient-sdk";
import { sleep } from "../util/helpers";
import { getChain, updateChain } from "../postgres/chain";
import { getMemoryUsage } from "../util/memory";
import { withTransaction } from "../postgres/client";
import { PoolClient } from "pg";

let syncing: boolean;

const logIndexTime = false;
const logFetchTime = false;
const logSync100Time = true;

export let currentPool: PoolClient | undefined;

export const startSync = async () => {
  syncing = true;

  let currentBlock = (await getChain(currentChain.chainId))?.blockHeight || 1;
  console.log(`Starting Syncing at Block ${currentBlock}`);

  // if already has synced, start from next block
  if (currentBlock !== 1) currentBlock++;

  // currentBlock = 2792944; // if need custom start block

  if (logSync100Time) console.time("sync");
  let count = 0;
  let errorCount = 0;
  while (syncing) {
    currentPool = undefined;

    // if (currentBlock === 2792945) return; // if need custom end block
    // console.log("wait then get block:", currentBlock, getMemoryUsage().rss);
    // await sleep(4000);

    try {
      if (logFetchTime) console.time("fetch");
      const [block, txsEvent, blockTM] = await Promise.all([
        Proto.getBlockbyHeight(currentBlock),
        Proto.getTxsEvent(currentBlock),
        Proto.getTMBlockbyHeight(currentBlock),
      ]);
      if (logFetchTime) console.timeEnd("fetch");

      if (block && txsEvent && blockTM) {
        count = 0;
        if (logIndexTime) console.time("index");
        // if block and events is not null, check if block has txs and then if events has
        // no trx, means abci layer is behind tendermint layer, wait 1 seconds and try again
        if (block.block?.data?.txs.length && !txsEvent.txs.length) {
          console.log(
            "ABCI Layer behind Tendermint Layer, waiting 1 seconds and trying again"
          );
          await sleep(1000);
          continue;
        }

        const blockHeight = Number(block.block!.header!.height.low);

        await withTransaction(async (client) => {
          currentPool = client;
          await Promise.all([
            BlockSyncHandler.syncBlock(
              blockHeight,
              block.blockId!.hash!,
              utils.proto.fromTimestamp(block.block!.header!.time!),
              txsEvent.txResponses,
              blockTM.beginBlockEvents as Event[],
              blockTM.endBlockEvents as Event[]
            ),
            updateChain({
              chainId: currentChain.chainId,
              blockHeight: blockHeight,
            }),
          ]);
        });

        if (blockHeight % 100 === 0) {
          console.log(`Synced Block ${blockHeight}`);
          if (logSync100Time) console.timeLog("sync");
        }

        if (logIndexTime) console.timeEnd("index");
        currentBlock++;
      } else {
        count++;
        // if count is 10, log that already on 10th attempt
        if (count === 10) {
          console.log(`Next block, 10th attempt: ${currentBlock}`);
        }
        // if count is more than 20, error out to indicate something might be wrong
        if (count > 20) {
          throw new Error("More than 20 attempts in a row, erroring...");
        }
        await sleep(1100);
      }
      errorCount = 0;
    } catch (error) {
      errorCount++;

      // if error, log error and sleep for 2 seconds, to attempt self healing and retry
      console.error(`ERROR::Adding Block ${currentBlock}:: ${error}`);
      await sleep(2000);

      // if more than 5 errors in a row, exit
      if (errorCount > 5) {
        console.error("Errors for more than 10 times in a row, exiting...");
        throw error;
      }
    }
  }
};
