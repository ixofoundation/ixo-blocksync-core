import { Prisma } from "@prisma/client";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { decodeMessage, decodeTransaction } from "../util/proto";

export const syncTransactions = (
  transactionResponses: TxResponse[],
  timestamp: Date,
  blockHeight: number
) => {
  const allMessages: Prisma.MessageCoreCreateManyInput[] = [];
  const allTransactions: Prisma.TransactionCoreUncheckedCreateInput[] = [];

  for (const tr of transactionResponses) {
    const transaction = decodeTransaction(tr);

    if (transaction) {
      // Extract and map messages to their decoded form
      for (const m of transaction.body.messages) {
        const value = decodeMessage(m);

        // Only add valid decoded messages to allMessages
        if (value) {
          allMessages.push({
            typeUrl: m.typeUrl,
            value,
            transactionHash: tr.txhash,
          });
        }
      }

      // Add the transaction if there are valid messages
      allTransactions.push({
        hash: tr.txhash,
        code: tr.code,
        fee: transaction.authInfo.fee,
        memo: transaction.body.memo,
        gasUsed: tr.gasUsed.toString(),
        gasWanted: tr.gasWanted.toString(),
        time: timestamp,
        blockHeight,
      });
    }
  }

  return { allMessages, allTransactions };
};
