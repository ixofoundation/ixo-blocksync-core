import { prisma } from "../prisma/prisma_client";
import { ChainCore } from "@prisma/client";

export const createChain = async (chainDoc: ChainCore) => {
  return await prisma.chainCore.create({ data: chainDoc });
};

export const updateChain = async (chainDoc: ChainCore) => {
  try {
    const res = await prisma.chainCore.update({
      where: { chainId: chainDoc.chainId },
      data: { blockHeight: chainDoc.blockHeight },
    });
    return res;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const getChain = async (chainId: string) => {
  try {
    const res = await prisma.chainCore.findFirst({
      where: {
        chainId: chainId,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const getLastSyncedBlockHeight = async (chainDoc: ChainCore) => {
  try {
    const res = await prisma.chainCore.findFirst({
      where: { chainId: chainDoc.chainId },
    });
    if (res) return res.blockHeight;
    else return 1;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
