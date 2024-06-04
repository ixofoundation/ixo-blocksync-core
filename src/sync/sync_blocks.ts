import * as Proto from "../util/proto";
import * as BlockSyncHandler from "../sync_handlers/block_sync_handler";
import { Event } from "@cosmjs/tendermint-rpc/build/tendermint34/responses";
import { currentChain } from "./sync_chain";
import { utils } from "@ixo/impactxclient-sdk";
import { sleep } from "../util/helpers";
import { getChain, updateChain } from "../postgres/chain";
import { getMemoryUsage } from "../util/memory";

let syncing: boolean;

const logIndexTime = false;
const logFetchTime = false;
const logSync100Time = true;

export const startSync = async () => {
  syncing = true;

  let currentBlock = (await getChain(currentChain.chainId))?.blockHeight || 1;
  console.log(`Starting Syncing at Block ${currentBlock}`);

  // if already has synced, start from next block
  if (currentBlock !== 1) currentBlock++;

  // currentBlock = 2792944; // if need custom start block

  if (logSync100Time) console.time("sync");
  let count = 0;
  while (syncing) {
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

        if (blockHeight % 100 === 0) {
          console.log(`Synced Block ${blockHeight}`);
          if (logSync100Time) console.timeLog("sync");
        }

        if (logIndexTime) console.timeEnd("index");
        currentBlock++;
      } else {
        count++;
        if (count === 10) {
          console.log(`Next block, 10th attempt: ${currentBlock}`);
        }
        await sleep(1100);
      }
    } catch (error) {
      console.error(`ERROR::Adding Block ${currentBlock}:: ${error}`);
      break;
    }
  }
};
