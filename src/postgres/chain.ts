import { corePool } from "./client";

export type Chain = {
  chainId: string;
  blockHeight: number;
};

const getChainSql = `
SELECT * FROM "ChainCore" WHERE "chainId" = $1
`;
export const getChain = async (chainId: string): Promise<Chain | undefined> => {
  try {
    const res = await corePool.query(getChainSql, [chainId]);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const createChainSql = `
INSERT INTO "ChainCore" ("chainId", "blockHeight") VALUES ($1, $2) RETURNING *
`;
export const createChain = async (chainDoc: Chain): Promise<Chain> => {
  try {
    const res = await corePool.query(createChainSql, [
      chainDoc.chainId,
      chainDoc.blockHeight,
    ]);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateChainSql = `
UPDATE "ChainCore" SET "blockHeight" = $2 WHERE "chainId" = $1
`;
export const updateChain = async (chainDoc: Chain): Promise<Chain> => {
  try {
    const res = await corePool.query(updateChainSql, [
      chainDoc.chainId,
      chainDoc.blockHeight,
    ]);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};
