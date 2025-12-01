import { TxResponse } from "@ixo/impactxclient-sdk/types/codegen/cosmos/base/abci/v1beta1/abci";
import { decodeMessage, decodeTransaction } from "../util/proto";
import { MessageCore, TransactionCore } from "../postgres/block";

export const syncTransactions = (transactionResponses: TxResponse[]) => {
  const allMessages: MessageCore[] = [];
  const allTransactions: TransactionCore[] = [];

  for (const tr of transactionResponses) {
    const transaction = decodeTransaction(tr);

    if (transaction) {
      const feePayer = extractFeePayer(tr);
      const signerInfos = extractSignerInfos(transaction);
      const nonCriticalExtensionOptions =
        extractNonCriticalExtensionOptions(transaction);

      // Extract and map messages to their decoded form
      for (let i = 0; i < transaction.body.messages.length; i++) {
        const m = transaction.body.messages[i];
        const value = decodeMessage(m);

        // Only add valid decoded messages to allMessages
        if (value) {
          allMessages.push({
            typeUrl: m.typeUrl,
            value,
            transactionHash: tr.txhash,
            index: i,
          });
        }
      }

      // Add the transaction with raw signer data
      allTransactions.push({
        hash: tr.txhash,
        code: tr.code,
        fee: transaction.authInfo.fee,
        memo: transaction.body.memo,
        gasUsed: tr.gasUsed.toString(),
        gasWanted: tr.gasWanted.toString(),
        feePayer,
        signerInfos,
        nonCriticalExtensionOptions,
      });
    }
  }

  return { allMessages, allTransactions };
};

/**
 * Extract fee payer address from transaction events.
 * Looks for 'fee_payer' or 'acc_seq' (format: address/sequence) in tx events.
 */
const extractFeePayer = (tr: TxResponse): string | undefined => {
  let acc_seq: string | undefined = undefined;
  for (const event of tr.events) {
    if (event.type === "tx") {
      for (const attr of event.attributes) {
        if (attr.key === "fee_payer") {
          return attr.value;
        }
        if (attr.key === "acc_seq") {
          // Format: "ixo1.../sequence" - extract address before the slash
          const parts = attr.value?.split("/");
          if (parts && parts.length > 0) {
            acc_seq = parts[0];
          }
        }
      }
    }
  }
  // If no fee payer found, return acc_seq
  return acc_seq;
};

/**
 * Extract raw signerInfos from transaction authInfo.
 * Converts to a JSON-serializable format (handles Long values).
 */
const extractSignerInfos = (transaction: any): any[] | undefined => {
  const signerInfos = transaction.authInfo?.signerInfos;
  if (!signerInfos || signerInfos.length === 0) return undefined;

  // Convert to JSON-safe format (Long values to numbers/strings)
  return signerInfos.map((info: any) => ({
    publicKey: info.publicKey
      ? {
          typeUrl: info.publicKey.typeUrl,
          // Store public key value as base64 if it's Uint8Array
          value:
            info.publicKey.value instanceof Uint8Array
              ? Buffer.from(info.publicKey.value).toString("base64")
              : info.publicKey.value,
        }
      : null,
    modeInfo: info.modeInfo,
    sequence:
      typeof info.sequence === "object" && info.sequence !== null
        ? Number(info.sequence)
        : info.sequence,
  }));
};

/**
 * Extract raw nonCriticalExtensionOptions from transaction body.
 * Converts to a JSON-serializable format.
 */
const extractNonCriticalExtensionOptions = (
  transaction: any
): any[] | undefined => {
  const extensions = transaction.body?.nonCriticalExtensionOptions;
  if (!extensions || extensions.length === 0) return undefined;

  // Convert to JSON-safe format (Uint8Array to base64)
  return extensions.map((ext: any) => ({
    typeUrl: ext.typeUrl,
    // Store value as base64 if it's Uint8Array
    value:
      ext.value instanceof Uint8Array
        ? Buffer.from(ext.value).toString("base64")
        : ext.value,
  }));
};
