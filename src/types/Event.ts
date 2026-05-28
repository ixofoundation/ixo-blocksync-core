export enum EventTypes {
  // iid
  createIid = "ixo.iid.v1beta1.IidDocumentCreatedEvent",
  updateIid = "ixo.iid.v1beta1.IidDocumentUpdatedEvent",
  // entity
  createEntity = "ixo.entity.v1beta1.EntityCreatedEvent",
  updateEntity = "ixo.entity.v1beta1.EntityUpdatedEvent",
  verifiedEntity = "ixo.entity.v1beta1.EntityVerifiedUpdatedEvent",
  transferEntity = "ixo.entity.v1beta1.EntityTransferredEvent",
  accountCreatedEntity = "ixo.entity.v1beta1.EntityAccountCreatedEvent",
  // claims
  createCollection = "ixo.claims.v1beta1.CollectionCreatedEvent",
  updateCollection = "ixo.claims.v1beta1.CollectionUpdatedEvent",
  submitClaim = "ixo.claims.v1beta1.ClaimSubmittedEvent",
  updateClaim = "ixo.claims.v1beta1.ClaimUpdatedEvent",
  evaluateClaim = "ixo.claims.v1beta1.ClaimEvaluatedEvent",
  disputeClaim = "ixo.claims.v1beta1.ClaimDisputedEvent",
  submitIntent = "ixo.claims.v1beta1.IntentSubmittedEvent",
  updateIntent = "ixo.claims.v1beta1.IntentUpdatedEvent",
  // token
  createToken = "ixo.token.v1beta1.TokenCreatedEvent",
  updateToken = "ixo.token.v1beta1.TokenUpdatedEvent",
  mintToken = "ixo.token.v1beta1.TokenMintedEvent",
  transferToken = "ixo.token.v1beta1.TokenTransferredEvent",
  cancelToken = "ixo.token.v1beta1.TokenCancelledEvent",
  retireToken = "ixo.token.v1beta1.TokenRetiredEvent",
  transferCredit = "ixo.token.v1beta1.CreditsTransferredEvent",
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
  instantiate = "instantiate",
  // epochs
  startEpoch = "ixo.epochs.v1beta1.EpochStartEvent",
  endEpoch = "ixo.epochs.v1beta1.EpochEndEvent",
  // mint
  epochProvisionsMinted = "ixo.mint.v1beta1.MintEpochProvisionsMintedEvent",
  // smartaccount
  authAdded = "ixo.smartaccount.v1beta1.AuthenticatorAddedEvent",
  authRemoved = "ixo.smartaccount.v1beta1.AuthenticatorRemovedEvent",
  authSetActive = "ixo.smartaccount.v1beta1.AuthenticatorSetActiveStateEvent",
  // liquidstake (v6 + v7)
  lsParamsUpdated = "ixo.liquidstake.v1beta1.LiquidStakeParamsUpdatedEvent",
  lsStake = "ixo.liquidstake.v1beta1.LiquidStakeEvent",
  lsUpstake = "ixo.liquidstake.v1beta1.LiquidUnstakeEvent",
  lsAddLSValidator = "ixo.liquidstake.v1beta1.AddLiquidValidatorEvent",
  lsRebalanced = "ixo.liquidstake.v1beta1.RebalancedLiquidStakeEvent",
  lsAutoCompound = "ixo.liquidstake.v1beta1.AutocompoundStakingRewardsEvent",
  // liquidstake v7 (new multi-pool typed events)
  lsModuleParamsUpdated = "ixo.liquidstake.v1beta1.ModuleParamsUpdatedEvent",
  lsPoolCreated = "ixo.liquidstake.v1beta1.PoolCreatedEvent",
  lsPoolUpdated = "ixo.liquidstake.v1beta1.PoolUpdatedEvent",
  // claims v7
  disputeResolved = "ixo.claims.v1beta1.DisputeResolvedEvent",
  memberBudgetCreated = "ixo.claims.v1beta1.MemberBudgetCreatedEvent",
  memberBudgetUpdated = "ixo.claims.v1beta1.MemberBudgetUpdatedEvent",
  memberBudgetRemoved = "ixo.claims.v1beta1.MemberBudgetRemovedEvent",
  agentDepositBalanceCreated = "ixo.claims.v1beta1.AgentDepositBalanceCreatedEvent",
  agentDepositBalanceUpdated = "ixo.claims.v1beta1.AgentDepositBalanceUpdatedEvent",
  agentDepositBalanceRemoved = "ixo.claims.v1beta1.AgentDepositBalanceRemovedEvent",
  // names v7
  namespaceCreated = "ixo.names.v1beta1.NamespaceCreatedEvent",
  namespaceUpdated = "ixo.names.v1beta1.NamespaceUpdatedEvent",
  nameRegistered = "ixo.names.v1beta1.NameRegisteredEvent",
  nameUpdated = "ixo.names.v1beta1.NameUpdatedEvent",
  nameTransferred = "ixo.names.v1beta1.NameTransferredEvent",
  nameStatusChanged = "ixo.names.v1beta1.NameStatusChangedEvent",
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
