export enum EventTypes {
  // iid
  createIid = "ixo.iid.v1beta1.IidDocumentCreatedEvent",
  updateIid = "ixo.iid.v1beta1.IidDocumentUpdatedEvent",
  // entity
  createEntity = "ixo.entity.v1beta1.EntityCreatedEvent",
  updateEntity = "ixo.entity.v1beta1.EntityUpdatedEvent",
  // claims
  createCollection = "ixo.claims.v1beta1.CollectionCreatedEvent",
  updateCollection = "ixo.claims.v1beta1.CollectionUpdatedEvent",
  submitClaim = "ixo.claims.v1beta1.ClaimSubmittedEvent",
  updateClaim = "ixo.claims.v1beta1.ClaimUpdatedEvent",
  disputeClaim = "ixo.claims.v1beta1.ClaimDisputedEvent",
  // token
  createToken = "ixo.token.v1beta1.TokenCreatedEvent",
  updateToken = "ixo.token.v1beta1.TokenUpdatedEvent",
  mintToken = "ixo.token.v1beta1.TokenMintedEvent",
  // bonds
  createBond = "ixo.bonds.v1beta1.BondCreatedEvent",
  updateBond = "ixo.bonds.v1beta1.BondUpdatedEvent",
  setNextAlphaBond = "ixo.bonds.v1beta1.BondSetNextAlphaEvent",
  buyOrderBond = "ixo.bonds.v1beta1.BondBuyOrderEvent",
  sellOrderBond = "ixo.bonds.v1beta1.BondSellOrderEvent",
  swapOrderBond = "ixo.bonds.v1beta1.BondSwapOrderEvent",
  outcomePaymentBond = "ixo.bonds.v1beta1.BondMakeOutcomePaymentEvent",
  shareWithdrawalBond = "ixo.bonds.v1beta1.BondWithdrawShareEvent",
  reserveWithdrawalBond = "ixo.bonds.v1beta1.BondWithdrawReserveEvent",
  // Wasm
  wasm = "wasm",
}

const EventTypesArray = Object.values(EventTypes) as string[];
export const EventTypesSet = new Set(EventTypesArray);

export type Attribute = {
  key: string;
  value: string;
};

export type ConvertedEvent = {
  type: string;
  attributes: Attribute[];
};
