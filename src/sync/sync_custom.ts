import * as Proto from "../util/proto";
import { sleep } from "../util/helpers";
import { prisma } from "../prisma/prisma_client";

export const startSync = async () => {
  const syncing = true;
  let index = 0;
  let pageSize = 100;
  let nextCursor: string | undefined = undefined;

  const query = async (take = 1, cursor?: string) =>
    await prisma.transactionCore.findMany({
      take: take,
      ...(cursor
        ? {
            cursor: { hash: cursor },
            skip: 1,
          }
        : {}),
      orderBy: {
        blockHeight: "asc",
      },
      select: {
        hash: true,
      },
    });

  while (syncing) {
    try {
      console.log("Batch Index: ", index++);
      const res = await query(pageSize, nextCursor);
      if (res.length == 0) {
        console.log("Done!!!!!!!!!!!");
        break;
      }
      nextCursor = res[res.length - 1].hash;

      for (const tx of res) {
        const txRes = await Proto.getTx(tx.hash);
        if (!txRes) {
          console.log("Tx not found, skipping");
          continue;
        }
        if (txRes.tx?.body?.memo) {
          // console.log("hash: ", tx.hash, " memo: ", txRes.tx?.body?.memo);
          await prisma.transactionCore.update({
            where: { hash: tx.hash },
            data: {
              memo: txRes.tx?.body?.memo,
            },
          });
        }
      }

      // wait 1 second to not overload the node
      await sleep(1000);
    } catch (error) {
      console.error(`Error Getting Transactions: ${error}`);
    }
  }
};
