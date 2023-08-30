import { Prisma } from "@prisma/client";
import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { decodeMessage, decodeTransaction } from "../util/proto";

export const syncTransactions = (
  transactionResponses: TxResponse[],
  timestamp: Date
) => {
  return transactionResponses
    .map((tr) => {
      const transaction = decodeTransaction(tr);
      if (!transaction) return;

      let messages: Prisma.TransactionUncheckedCreateInput =
        transaction.body.messages
          .map((m) => {
            const value = decodeMessage(m);
            if (!value) return;

            return {
              typeUrl: m.typeUrl,
              value: value,
            };
          })
          .filter((m) => !!m);

      return {
        hash: tr.txhash,
        code: tr.code,
        fee: transaction.authInfo.fee,
        gasUsed: tr.gasUsed.toString(),
        gasWanted: tr.gasWanted.toString(),
        time: timestamp,
        messages: { createMany: { data: messages } },
      };
    })
    .filter((t) => !!t);
};
