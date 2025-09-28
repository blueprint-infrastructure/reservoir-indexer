import { Interface } from "@ethersproject/abi";

import * as alienswap from "@/events-sync/data/alienswap";
import * as artblocks from "@/events-sync/data/artblocks";
import * as bendDao from "@/events-sync/data/bend-dao";
import * as blend from "@/events-sync/data/blend";
import * as blur from "@/events-sync/data/blur";
import * as blurV2 from "@/events-sync/data/blur-v2";
import * as coinbase from "@/events-sync/data/coinbase";
import * as createdotfun from "@/events-sync/data/createdotfun";
import * as cryptoPunks from "@/events-sync/data/cryptopunks";
import * as decentraland from "@/events-sync/data/decentraland";
import * as ditto from "@/events-sync/data/ditto";
import * as element from "@/events-sync/data/element";
import * as erc1155 from "@/events-sync/data/erc1155";
import * as erc20 from "@/events-sync/data/erc20";
import * as erc721 from "@/events-sync/data/erc721";
import * as erc721c from "@/events-sync/data/erc721c";
import * as fairxyz from "@/events-sync/data/fairxyz";
import * as foundation from "@/events-sync/data/foundation";
import * as highlightxyz from "@/events-sync/data/highlightxyz";
import * as joepeg from "@/events-sync/data/joepeg";
import * as looksRare from "@/events-sync/data/looks-rare";
import * as looksRareV2 from "@/events-sync/data/looks-rare-v2";
import * as magiceden from "@/events-sync/data/magiceden";
import * as manifold from "@/events-sync/data/manifold";
import * as metadataUpdate from "@/events-sync/data/metadata-update";
import * as mintify from "@/events-sync/data/mintify";
import * as mooar from "@/events-sync/data/mooar";
import * as nftTrader from "@/events-sync/data/nft-trader";
import * as nftx from "@/events-sync/data/nftx";
import * as nftxV3 from "@/events-sync/data/nftx-v3";
import * as nouns from "@/events-sync/data/nouns";
import * as okex from "@/events-sync/data/okex";
import * as operatorFilter from "@/events-sync/data/operator-filter";
import * as paymentProcessor from "@/events-sync/data/payment-processor";
import * as paymentProcessorRegistry from "@/events-sync/data/payment-processor-registry";
import * as paymentProcessorV2 from "@/events-sync/data/payment-processor-v2";
import * as paymentProcessorV21 from "@/events-sync/data/payment-processor-v2.1";
import * as quixotic from "@/events-sync/data/quixotic";
import * as rarible from "@/events-sync/data/rarible";
import * as seadrop from "@/events-sync/data/seadrop";
import * as seaport from "@/events-sync/data/seaport";
import * as seaportV14 from "@/events-sync/data/seaport-v1.4";
import * as seaportV15 from "@/events-sync/data/seaport-v1.5";
import * as seaportV16 from "@/events-sync/data/seaport-v1.6";
import * as sudoswap from "@/events-sync/data/sudoswap";
import * as sudoswapV2 from "@/events-sync/data/sudoswap-v2";
import * as superrare from "@/events-sync/data/superrare";
import * as thirdweb from "@/events-sync/data/thirdweb";
import * as titlesxyz from "@/events-sync/data/titlesxyz";
import * as tofu from "@/events-sync/data/tofu";
import * as treasure from "@/events-sync/data/treasure";
import * as wyvernV2 from "@/events-sync/data/wyvern-v2";
import * as wyvernV23 from "@/events-sync/data/wyvern-v2.3";
import * as x2y2 from "@/events-sync/data/x2y2";
import * as zeroExV2 from "@/events-sync/data/zeroex-v2";
import * as zeroExV3 from "@/events-sync/data/zeroex-v3";
import * as zeroExV4 from "@/events-sync/data/zeroex-v4";
import * as zora from "@/events-sync/data/zora";
import { isAddress } from "ethers/lib/utils";

// All events we're syncing should have an associated `EventData`
// entry which dictates the way the event will be parsed and then
// handled (eg. persisted to the database and relayed for further
// processing to any job queues)

// Event kind by protocol/standard
export type EventKind =
  | "artblocks"
  | "bend-dao"
  | "blend"
  | "blur"
  | "blur-v2"
  | "coinbase"
  | "createdotfun"
  | "cryptopunks"
  | "decentraland"
  | "ditto"
  | "element"
  | "erc1155"
  | "erc20"
  | "erc721"
  | "erc721c"
  | "fairxyz"
  | "foundation"
  | "highlightxyz"
  | "joepeg"
  | "looks-rare"
  | "looks-rare-v2"
  | "magiceden"
  | "manifold"
  | "metadata-update"
  | "mooar"
  | "nft-trader"
  | "nftx"
  | "nftx-v3"
  | "nouns"
  | "okex"
  | "operator-filter"
  | "payment-processor"
  | "payment-processor-registry"
  | "payment-processor-v2"
  | "payment-processor-v2.1"
  | "quixotic"
  | "rarible"
  | "seadrop"
  | "seaport"
  | "sudoswap"
  | "sudoswap-v2"
  | "superrare"
  | "thirdweb"
  | "titlesxyz"
  | "tofu"
  | "treasure"
  | "wyvern"
  | "x2y2"
  | "zeroex-v2"
  | "zeroex-v3"
  | "zeroex-v4"
  | "zora";

// Event sub-kind in each of the above protocol/standard
export type EventSubKind =
  | "alienswap-counter-incremented"
  | "alienswap-order-cancelled"
  | "alienswap-order-filled"
  | "alienswap-order-validated"
  | "alienswap-orders-matched"
  | "artblocks-minter-registered"
  | "artblocks-minter-removed"
  | "artblocks-project-currency-update"
  | "artblocks-project-price-update"
  | "artblocks-project-set-auction-details"
  | "artblocks-project-updated"
  | "bend-dao-taker-ask"
  | "bend-dao-taker-bid"
  | "blend-buy-locked"
  | "blend-loan-offer-taken"
  | "blend-nonce-incremented"
  | "blend-refinance"
  | "blend-repay"
  | "blur-nonce-incremented"
  | "blur-order-cancelled"
  | "blur-orders-matched"
  | "blur-v2-execution"
  | "blur-v2-execution-721-maker-fee-packed"
  | "blur-v2-execution-721-packed"
  | "blur-v2-execution-721-taker-fee-packed"
  | "coinbase-contract-created"
  | "createdotfun-configuration-updated"
  | "cryptopunks-assign"
  | "cryptopunks-punk-bought"
  | "cryptopunks-punk-no-longer-for-sale"
  | "cryptopunks-punk-offered"
  | "cryptopunks-punk-transfer"
  | "cryptopunks-transfer"
  | "decentraland-sale"
  | "ditto-pool-initialized"
  | "element-erc1155-buy-order-filled"
  | "element-erc1155-buy-order-filled-v2"
  | "element-erc1155-order-cancelled"
  | "element-erc1155-sell-order-filled"
  | "element-erc1155-sell-order-filled-v2"
  | "element-erc721-buy-order-filled"
  | "element-erc721-buy-order-filled-v2"
  | "element-erc721-order-cancelled"
  | "element-erc721-sell-order-filled"
  | "element-erc721-sell-order-filled-v2"
  | "element-hash-nonce-incremented"
  | "erc1155-transfer-batch"
  | "erc1155-transfer-single"
  | "erc20-approval"
  | "erc20-transfer"
  | "erc721-consecutive-transfer"
  | "erc721-erc20-like-transfer"
  | "erc721-like-transfer"
  | "erc721-transfer"
  | "erc721/1155-approval-for-all"
  | "erc721c-set-transfer-security-level"
  | "erc721c-transfer-validator-updated"
  | "erc721c-v1-added-to-allowlist"
  | "erc721c-v1-removed-from-allowlist"
  | "erc721c-v1-set-allowlist"
  | "erc721c-v2-v3-added-account-to-list"
  | "erc721c-v2-v3-added-code-hash-to-list"
  | "erc721c-v2-v3-applied-list-to-collection"
  | "erc721c-v2-v3-removed-account-from-list"
  | "erc721c-v2-v3-removed-code-hash-from-list"
  | "erc721c-verified-eoa-signature"
  | "fairxyz-edition-created"
  | "foundation-add-merkle-root-to-fixed-price-sale"
  | "foundation-buy-price-accepted"
  | "foundation-buy-price-cancelled"
  | "foundation-buy-price-invalidated"
  | "foundation-buy-price-set"
  | "foundation-created-fixed-price-sale"
  | "foundation-offer-accepted"
  | "foundation-configure-fixed-price-sale"
  | "highlightxyz-discrete-da-created"
  | "highlightxyz-discrete-da-updated"
  | "highlightxyz-edition-vector-created"
  | "highlightxyz-mechanic-vector-registered"
  | "highlightxyz-series-vector-created"
  | "highlightxyz-vector-deleted"
  | "highlightxyz-vector-updated"
  | "joepeg-taker-ask"
  | "joepeg-taker-bid"
  | "looks-rare-cancel-all-orders"
  | "looks-rare-cancel-multiple-orders"
  | "looks-rare-taker-ask"
  | "looks-rare-taker-bid"
  | "looks-rare-v2-new-bid-ask-nonces"
  | "looks-rare-v2-order-nonces-cancelled"
  | "looks-rare-v2-subset-nonces-cancelled"
  | "looks-rare-v2-taker-ask"
  | "looks-rare-v2-taker-bid"
  | "magiceden-new-contract-initialized"
  | "magiceden-public-stage-set"
  | "magiceden-max-supply-updated-erc721"
  | "magiceden-wallet-limit-updated-erc721"
  | "magiceden-max-supply-updated-erc1155"
  | "magiceden-wallet-limit-updated-erc1155"
  | "magiceden-royalty-info-updated"
  | "manifold-accept"
  | "manifold-cancel"
  | "manifold-claim-initialized"
  | "manifold-claim-updated"
  | "manifold-finalize"
  | "manifold-modify"
  | "manifold-purchase"
  | "metadata-update-batch-tokens-opensea"
  | "metadata-update-contract-uri-thirdweb"
  | "metadata-update-contract-uri-magiceden"
  | "metadata-update-mint-config-changed"
  | "metadata-update-single-token-opensea"
  | "metadata-update-uri-opensea"
  | "metadata-update-zora"
  | "mintify-order-cancelled"
  | "mintify-order-filled"
  | "mintify-orders-matched"
  | "mintify-counter-incremented"
  | "mintify-order-validated"
  | "mooar-order-filled"
  | "nft-trader-swap"
  | "nftx-burn"
  | "nftx-eligibility-deployed"
  | "nftx-enable-mint-updated"
  | "nftx-enable-target-redeem-updated"
  | "nftx-mint"
  | "nftx-minted"
  | "nftx-redeemed"
  | "nftx-swap"
  | "nftx-swap-v3"
  | "nftx-swapped"
  | "nftx-user-staked"
  | "nftx-v3-eligibility-deployed"
  | "nftx-v3-enable-mint-updated"
  | "nftx-v3-enable-redeem-updated"
  | "nftx-v3-enable-swap-updated"
  | "nftx-v3-minted"
  | "nftx-v3-redeemed"
  | "nftx-v3-swap"
  | "nftx-v3-swapped"
  | "nftx-v3-user-staked"
  | "nftx-v3-vault-init"
  | "nftx-v3-vault-shutdown"
  | "nftx-vault-init"
  | "nftx-vault-shutdown"
  | "nouns-auction-settled"
  | "okex-order-filled"
  | "operator-filter-operator-updated"
  | "operator-filter-operators-updated"
  | "operator-filter-subscription-updated"
  | "payment-processor-buy-single-listing"
  | "payment-processor-created-or-updated-security-policy"
  | "payment-processor-master-nonce-invalidated"
  | "payment-processor-nonce-invalidated"
  | "payment-processor-sweep-collection-erc1155"
  | "payment-processor-sweep-collection-erc721"
  | "payment-processor-updated-collection-payment-coin"
  | "payment-processor-updated-collection-security-policy"
  | "payment-processor-v2-accept-offer-erc1155"
  | "payment-processor-v2-accept-offer-erc721"
  | "payment-processor-v2-banned-account-added-for-collection"
  | "payment-processor-v2-banned-account-removed-for-collection"
  | "payment-processor-v2-buy-listing-erc1155"
  | "payment-processor-v2-buy-listing-erc721"
  | "payment-processor-v2-master-nonce-invalidated"
  | "payment-processor-v2-nonce-invalidated"
  | "payment-processor-v2-order-digest-invalidated"
  | "payment-processor-v2-payment-method-added-to-whitelist"
  | "payment-processor-v2-payment-method-removed-from-whitelist"
  | "payment-processor-v2-trusted-channel-added-for-collection"
  | "payment-processor-v2-trusted-channel-removed-for-collection"
  | "payment-processor-v2-updated-collection-level-pricing-boundaries"
  | "payment-processor-v2-updated-collection-payment-settings"
  | "payment-processor-v2-updated-token-level-pricing-boundaries"
  | "payment-processor-v2.1-accept-offer-erc1155"
  | "payment-processor-v2.1-accept-offer-erc721"
  | "payment-processor-v2.1-buy-listing-erc1155"
  | "payment-processor-v2.1-buy-listing-erc721"
  | "payment-processor-v2.1-master-nonce-invalidated"
  | "payment-processor-v2.1-nonce-invalidated"
  | "payment-processor-v2.1-nonce-restored"
  | "payment-processor-v2.1-order-digest-invalidated"
  | "payment-processor-v2.1-order-digest-items-restored"
  | "payment-processor-registry-payment-method-added-to-whitelist"
  | "payment-processor-registry-payment-method-removed-from-whitelist"
  | "payment-processor-registry-trusted-channel-added-for-collection"
  | "payment-processor-registry-trusted-channel-removed-for-collection"
  | "payment-processor-registry-updated-collection-payment-settings"
  | "payment-processor-registry-updated-token-level-pricing-boundaries"
  | "quixotic-order-filled"
  | "rarible-buy-v1"
  | "rarible-cancel"
  | "rarible-match"
  | "rarible-match-v2"
  | "seadrop-public-drop-updated"
  | "seaport-channel-updated"
  | "seaport-counter-incremented"
  | "seaport-order-cancelled"
  | "seaport-order-filled"
  | "seaport-order-validated"
  | "seaport-v1.4-counter-incremented"
  | "seaport-v1.4-order-cancelled"
  | "seaport-v1.4-order-filled"
  | "seaport-v1.4-order-validated"
  | "seaport-v1.4-orders-matched"
  | "seaport-v1.5-counter-incremented"
  | "seaport-v1.5-order-cancelled"
  | "seaport-v1.5-order-filled"
  | "seaport-v1.5-order-validated"
  | "seaport-v1.5-orders-matched"
  | "seaport-v1.6-counter-incremented"
  | "seaport-v1.6-order-cancelled"
  | "seaport-v1.6-order-filled"
  | "seaport-v1.6-order-validated"
  | "seaport-v1.6-orders-matched"
  | "sudoswap-buy"
  | "sudoswap-delta-update"
  | "sudoswap-new-pair"
  | "sudoswap-sell"
  | "sudoswap-spot-price-update"
  | "sudoswap-token-deposit"
  | "sudoswap-token-withdrawal"
  | "sudoswap-v2-buy-erc1155"
  | "sudoswap-v2-buy-erc1155-hook"
  | "sudoswap-v2-buy-erc721"
  | "sudoswap-v2-buy-erc721-hook"
  | "sudoswap-v2-delta-update"
  | "sudoswap-v2-erc1155-deposit"
  | "sudoswap-v2-erc20-deposit"
  | "sudoswap-v2-erc721-deposit"
  | "sudoswap-v2-new-erc1155-pair"
  | "sudoswap-v2-new-erc721-pair"
  | "sudoswap-v2-nft-withdrawal-erc1155"
  | "sudoswap-v2-nft-withdrawal-erc721"
  | "sudoswap-v2-sell-erc1155"
  | "sudoswap-v2-sell-erc1155-hook"
  | "sudoswap-v2-sell-erc721"
  | "sudoswap-v2-sell-erc721-hook"
  | "sudoswap-v2-spot-price-update"
  | "sudoswap-v2-token-deposit"
  | "sudoswap-v2-token-withdrawal"
  | "superrare-accept-offer"
  | "superrare-auction-settled"
  | "superrare-listing-filled"
  | "superrare-set-sale-price"
  | "superrare-sold"
  | "thirdweb-claim-conditions-updated-erc1155"
  | "thirdweb-claim-conditions-updated-erc721"
  | "titlesxyz-edition-published"
  | "tofu-inventory-update"
  | "treasure-bid-accepted"
  | "treasure-item-sold"
  | "weth-deposit"
  | "weth-withdrawal"
  | "wyvern-v2-orders-matched"
  | "wyvern-v2.3-orders-matched"
  | "x2y2-order-cancelled"
  | "x2y2-order-inventory"
  | "zeroex-v2-fill"
  | "zeroex-v3-fill"
  | "zeroex-v4-erc1155-order-cancelled"
  | "zeroex-v4-erc1155-order-filled"
  | "zeroex-v4-erc721-order-cancelled"
  | "zeroex-v4-erc721-order-filled"
  | "zora-custom-mint-comment"
  | "zora-erc20-sale-set"
  | "zora-fixed-price-sale-set"
  | "zora-merkle-sale-set"
  | "zora-timed-sale-set"
  | "zora-mint-comment"
  | "zora-sales-config-changed"
  | "zora-updated-token"
  | "zora-timed-sale-strategy-rewards"
  | "zora-timed-sale-set-v2"
  | "zora-secondary-market-activated"
  | "zora-swap"
  | "zora-secondary-sell"
  | "zora-secondary-buy";

export type EventData = {
  kind: EventKind;
  subKind: EventSubKind;
  addresses?: { [address: string]: boolean };
  topic: string;
  numTopics: number;
  abi: Interface;
};

const allEventData = [
  alienswap.counterIncremented,
  alienswap.orderCancelled,
  alienswap.orderFulfilled,
  alienswap.orderValidated,
  alienswap.ordersMatched,
  artblocks.projectCurrentcyUpdate,
  artblocks.projectMinterRegistered,
  artblocks.projectMinterRemoved,
  artblocks.projectPriceUpdate,
  artblocks.projectSetAuctionDetails,
  artblocks.projectUpdated,
  bendDao.takerAsk,
  bendDao.takerBid,
  blend.buyLocked,
  blend.loanOfferTaken,
  blend.nonceIncremented,
  blend.refinance,
  blend.repay,
  blur.nonceIncremented,
  blur.orderCancelled,
  blur.ordersMatched,
  blurV2.execution,
  blurV2.execution721MakerFeePacked,
  blurV2.execution721Packed,
  blurV2.execution721TakerFeePacked,
  coinbase.contractCreated,
  createdotfun.configurationUpdated,
  cryptoPunks.assign,
  cryptoPunks.punkBought,
  cryptoPunks.punkNoLongerForSale,
  cryptoPunks.punkOffered,
  cryptoPunks.punkTransfer,
  cryptoPunks.transfer,
  decentraland.sale,
  ditto.dittoPoolInitialized,
  element.erc1155BuyOrderFilled,
  element.erc1155BuyOrderFilledV2,
  element.erc1155OrderCancelled,
  element.erc1155SellOrderFilled,
  element.erc1155SellOrderFilledV2,
  element.erc721BuyOrderFilled,
  element.erc721BuyOrderFilledV2,
  element.erc721OrderCancelled,
  element.erc721SellOrderFilled,
  element.erc721SellOrderFilledV2,
  element.hashNonceIncremented,
  erc1155.transferBatch,
  erc1155.transferSingle,
  erc20.approval,
  erc20.deposit,
  erc20.transfer,
  erc20.withdrawal,
  erc721.approvalForAll,
  erc721.consecutiveTransfer,
  erc721.erc20LikeTransfer,
  erc721.likeTransfer,
  erc721.transfer,
  erc721c.addedAccountToListV2V3,
  erc721c.addedCodeHashToListV2V3,
  erc721c.addedToAllowlistV1,
  erc721c.appliedListToCollectionV2V3,
  erc721c.removedAccountFromListV2V3,
  erc721c.removedCodeHashFromListV2V3,
  erc721c.removedFromAllowlistV1,
  erc721c.setAllowlistV1,
  erc721c.setTransferSecurityLevel,
  erc721c.transferValidatorUpdated,
  erc721c.verifiedEOASignature,
  fairxyz.editionCreated,
  foundation.addMerkleRootToFixedPriceSale,
  foundation.buyPriceAccepted,
  foundation.buyPriceCancelled,
  foundation.buyPriceInvalidated,
  foundation.buyPriceSet,
  foundation.createFixedPriceSale,
  foundation.offerAccepted,
  foundation.configureFixedPriceSale,
  highlightxyz.discreteDACreated,
  highlightxyz.editonVectorCreated,
  highlightxyz.mechanicVectorRegistered,
  highlightxyz.mechanicVectorUpdated,
  highlightxyz.seriesVectorCreated,
  highlightxyz.vectorDeleted,
  highlightxyz.vectorUpdated,
  joepeg.takerAsk,
  joepeg.takerBid,
  looksRare.cancelAllOrders,
  looksRare.cancelMultipleOrders,
  looksRare.takerAsk,
  looksRare.takerBid,
  looksRareV2.newBidAskNonces,
  looksRareV2.orderNoncesCancelled,
  looksRareV2.subsetNoncesCancelled,
  looksRareV2.takerAsk,
  looksRareV2.takerBid,
  magiceden.newContractInitialized,
  magiceden.publicStageSet,
  magiceden.maxSupplyUpdatedERC721,
  magiceden.walletLimitUpdatedERC721,
  magiceden.maxSupplyUpdatedERC1155,
  magiceden.walletLimitUpdatedERC1155,
  magiceden.royaltyInfoUpdated,
  manifold.accept,
  manifold.cancel,
  manifold.claimInitialized,
  manifold.claimUpdated,
  manifold.finalize,
  manifold.modify,
  manifold.purchase,
  metadataUpdate.batchMetadataUpdateOpensea,
  metadataUpdate.contractURIUpdateThirdweb,
  metadataUpdate.contractURIUpdateMagiceden,
  metadataUpdate.metadataUpdateOpensea,
  metadataUpdate.metadataUpdateURIOpensea,
  metadataUpdate.metadataUpdateURIZora,
  metadataUpdate.mintConfigChanged,
  mintify.counterIncremented,
  mintify.orderCancelled,
  mintify.orderFulfilled,
  mintify.ordersMatched,
  mintify.orderValidated,
  mooar.orderFulfilled,
  nftTrader.swap,
  nftx.burn,
  nftx.eligibilityDeployed,
  nftx.enableMintUpdated,
  nftx.enableTargetRedeemUpdated,
  nftx.mint,
  nftx.minted,
  nftx.redeemed,
  nftx.swap,
  nftx.swapped,
  nftx.vaultInit,
  nftx.vaultShutdown,
  nftxV3.eligibilityDeployed,
  nftxV3.enableMintUpdated,
  nftxV3.enableRedeemUpdated,
  nftxV3.enableSwapUpdated,
  nftxV3.minted,
  nftxV3.redeemed,
  nftxV3.swap,
  nftxV3.swapped,
  nftxV3.vaultInit,
  nftxV3.vaultShutdown,
  nouns.auctionSettled,
  okex.orderFulfilled,
  operatorFilter.operatorUpdated,
  operatorFilter.operatorsUpdated,
  operatorFilter.subscriptionUpdated,
  paymentProcessor.buySingleListing,
  paymentProcessor.createdOrUpdatedSecurityPolicy,
  paymentProcessor.masterNonceInvalidated,
  paymentProcessor.nonceInvalidated,
  paymentProcessor.sweepCollectionERC1155,
  paymentProcessor.sweepCollectionERC721,
  paymentProcessor.updatedCollectionPaymentCoin,
  paymentProcessor.updatedCollectionSecurityPolicy,
  paymentProcessorV2.acceptOfferERC1155,
  paymentProcessorV2.acceptOfferERC721,
  paymentProcessorV2.bannedAccountAddedForCollection,
  paymentProcessorV2.bannedAccountRemovedForCollection,
  paymentProcessorV2.buyListingERC1155,
  paymentProcessorV2.buyListingERC721,
  paymentProcessorV2.masterNonceInvalidated,
  paymentProcessorV2.nonceInvalidated,
  paymentProcessorV2.orderDigestInvalidated,
  paymentProcessorV2.paymentMethodAddedToWhitelist,
  paymentProcessorV2.paymentMethodRemovedFromWhitelist,
  paymentProcessorV2.trustedChannelAddedForCollection,
  paymentProcessorV2.trustedChannelRemovedForCollection,
  paymentProcessorV2.updatedCollectionLevelPricingBoundaries,
  paymentProcessorV2.updatedCollectionPaymentSettings,
  paymentProcessorV2.updatedTokenLevelPricingBoundaries,
  paymentProcessorV21.acceptOfferERC1155,
  paymentProcessorV21.acceptOfferERC721,
  paymentProcessorV21.buyListingERC1155,
  paymentProcessorV21.buyListingERC721,
  paymentProcessorV21.masterNonceInvalidated,
  paymentProcessorV21.nonceInvalidated,
  paymentProcessorV21.nonceRestored,
  paymentProcessorV21.orderDigestInvalidated,
  paymentProcessorV21.orderDigestItemsRestored,
  paymentProcessorRegistry.paymentMethodAddedToWhitelist,
  paymentProcessorRegistry.paymentMethodRemovedFromWhitelist,
  paymentProcessorRegistry.trustedChannelAddedForCollection,
  paymentProcessorRegistry.trustedChannelRemovedForCollection,
  paymentProcessorRegistry.updatedCollectionPaymentSettings,
  paymentProcessorRegistry.updatedTokenLevelPricingBoundaries,
  quixotic.orderFulfilled,
  rarible.buyV1,
  rarible.cancel,
  rarible.match,
  rarible.matchV2,
  seadrop.publicDropUpdated,
  seaport.channelUpdated,
  seaport.counterIncremented,
  seaport.orderCancelled,
  seaport.orderFulfilled,
  seaport.orderValidated,
  seaportV14.counterIncremented,
  seaportV14.orderCancelled,
  seaportV14.orderFulfilled,
  seaportV14.orderValidated,
  seaportV14.ordersMatched,
  seaportV15.counterIncremented,
  seaportV15.orderCancelled,
  seaportV15.orderFulfilled,
  seaportV15.orderValidated,
  seaportV15.ordersMatched,
  seaportV16.counterIncremented,
  seaportV16.orderCancelled,
  seaportV16.orderFulfilled,
  seaportV16.orderValidated,
  seaportV16.ordersMatched,
  sudoswap.buy,
  sudoswap.deltaUpdate,
  sudoswap.newPair,
  sudoswap.sell,
  sudoswap.spotPriceUpdate,
  sudoswap.tokenDeposit,
  sudoswap.tokenWithdrawal,
  sudoswapV2.buyERC1155,
  sudoswapV2.buyERC1155Hook,
  sudoswapV2.buyERC721,
  sudoswapV2.buyERC721Hook,
  sudoswapV2.deltaUpdate,
  sudoswapV2.erc1155Deposit,
  sudoswapV2.erc20Deposit,
  sudoswapV2.erc721Deposit,
  sudoswapV2.newERC1155Pair,
  sudoswapV2.newERC721Pair,
  sudoswapV2.nftWithdrawalERC1155,
  sudoswapV2.nftWithdrawalERC721,
  sudoswapV2.sellERC1155,
  sudoswapV2.sellERC1155Hook,
  sudoswapV2.sellERC721,
  sudoswapV2.sellERC721Hook,
  sudoswapV2.spotPriceUpdate,
  sudoswapV2.tokenDeposit,
  sudoswapV2.tokenWithdrawal,
  superrare.auctionSettled,
  superrare.listingFilled,
  superrare.listingSold,
  superrare.offerAccept,
  superrare.setSalePrice,
  thirdweb.claimConditionsUpdatedERC1155,
  thirdweb.claimConditionsUpdatedERC721,
  titlesxyz.editionPublished,
  tofu.inventoryUpdate,
  treasure.bidAccepted,
  treasure.itemSold,
  wyvernV2.ordersMatched,
  wyvernV23.ordersMatched,
  x2y2.orderCancelled,
  x2y2.orderInventory,
  zeroExV2.fill,
  zeroExV3.fill,
  zeroExV4.erc1155OrderCancelled,
  zeroExV4.erc1155OrderFilled,
  zeroExV4.erc721OrderCancelled,
  zeroExV4.erc721OrderFilled,
  zora.customMintComment,
  zora.mintComment,
  zora.salesConfigChanged,
  zora.updatedToken,
  zora.timedSaleStrategyRewards,
  zora.timedSaleSet,
  zora.merkleSaleSet,
  zora.fixedPriceSaleSet,
  zora.erc20SaleSet,
  zora.timedSaleV2Set,
  zora.secondaryMarketActivated,
  zora.swap,
  zora.secondaryBuy,
  zora.secondarySell,
];

const bptFilteredEventData = [
  // alienswap.counterIncremented,
  // alienswap.orderCancelled,
  // alienswap.orderFulfilled,
  // alienswap.orderValidated,
  // alienswap.ordersMatched,
  artblocks.projectCurrentcyUpdate,
  artblocks.projectMinterRegistered,
  artblocks.projectMinterRemoved,
  artblocks.projectPriceUpdate,
  artblocks.projectSetAuctionDetails,
  artblocks.projectUpdated,
  bendDao.takerAsk,
  bendDao.takerBid,
  // blend.buyLocked,
  // blend.loanOfferTaken,
  // blend.nonceIncremented,
  // blend.refinance,
  // blend.repay,
  blur.nonceIncremented,
  blur.orderCancelled,
  blur.ordersMatched,
  blurV2.execution,
  blurV2.execution721MakerFeePacked,
  blurV2.execution721Packed,
  blurV2.execution721TakerFeePacked,
  coinbase.contractCreated,
  // createdotfun.configurationUpdated,
  cryptoPunks.assign,
  cryptoPunks.punkBought,
  cryptoPunks.punkNoLongerForSale,
  cryptoPunks.punkOffered,
  cryptoPunks.punkTransfer,
  cryptoPunks.transfer,
  // decentraland.sale,
  // ditto.dittoPoolInitialized,
  // element.erc1155BuyOrderFilled,
  // element.erc1155BuyOrderFilledV2,
  // element.erc1155OrderCancelled,
  // element.erc1155SellOrderFilled,
  // element.erc1155SellOrderFilledV2,
  // element.erc721BuyOrderFilled,
  // element.erc721BuyOrderFilledV2,
  // element.erc721OrderCancelled,
  // element.erc721SellOrderFilled,
  // element.erc721SellOrderFilledV2,
  // element.hashNonceIncremented,
  erc1155.transferBatch,
  erc1155.transferSingle,
  // erc20.approval,
  // erc20.deposit,
  // erc20.transfer,
  // erc20.withdrawal,
  erc721.approvalForAll,
  erc721.consecutiveTransfer,
  erc721.erc20LikeTransfer,
  erc721.likeTransfer,
  erc721.transfer,
  erc721c.addedAccountToListV2V3,
  erc721c.addedCodeHashToListV2V3,
  erc721c.addedToAllowlistV1,
  erc721c.appliedListToCollectionV2V3,
  erc721c.removedAccountFromListV2V3,
  erc721c.removedCodeHashFromListV2V3,
  erc721c.removedFromAllowlistV1,
  erc721c.setAllowlistV1,
  erc721c.setTransferSecurityLevel,
  erc721c.transferValidatorUpdated,
  erc721c.verifiedEOASignature,
  // fairxyz.editionCreated,
  // foundation.addMerkleRootToFixedPriceSale,
  // foundation.buyPriceAccepted,
  // foundation.buyPriceCancelled,
  // foundation.buyPriceInvalidated,
  // foundation.buyPriceSet,
  // foundation.createFixedPriceSale,
  // foundation.offerAccepted,
  // foundation.configureFixedPriceSale,
  // highlightxyz.discreteDACreated,
  // highlightxyz.editonVectorCreated,
  // highlightxyz.mechanicVectorRegistered,
  // highlightxyz.mechanicVectorUpdated,
  // highlightxyz.seriesVectorCreated,
  // highlightxyz.vectorDeleted,
  // highlightxyz.vectorUpdated,
  // joepeg.takerAsk,
  // joepeg.takerBid,
  // looksRare.cancelAllOrders,
  // looksRare.cancelMultipleOrders,
  // looksRare.takerAsk,
  // looksRare.takerBid,
  // looksRareV2.newBidAskNonces,
  // looksRareV2.orderNoncesCancelled,
  // looksRareV2.subsetNoncesCancelled,
  // looksRareV2.takerAsk,
  // looksRareV2.takerBid,
  magiceden.newContractInitialized,
  magiceden.publicStageSet,
  magiceden.maxSupplyUpdatedERC721,
  magiceden.walletLimitUpdatedERC721,
  magiceden.maxSupplyUpdatedERC1155,
  magiceden.walletLimitUpdatedERC1155,
  magiceden.royaltyInfoUpdated,
  manifold.accept,
  manifold.cancel,
  manifold.claimInitialized,
  manifold.claimUpdated,
  manifold.finalize,
  manifold.modify,
  manifold.purchase,
  metadataUpdate.batchMetadataUpdateOpensea,
  metadataUpdate.contractURIUpdateThirdweb,
  metadataUpdate.contractURIUpdateMagiceden,
  metadataUpdate.metadataUpdateOpensea,
  metadataUpdate.metadataUpdateURIOpensea,
  metadataUpdate.metadataUpdateURIZora,
  metadataUpdate.mintConfigChanged,
  mintify.counterIncremented,
  mintify.orderCancelled,
  mintify.orderFulfilled,
  mintify.ordersMatched,
  mintify.orderValidated,
  // mooar.orderFulfilled,
  // nftTrader.swap,
  // nftx.burn,
  // nftx.eligibilityDeployed,
  // nftx.enableMintUpdated,
  // nftx.enableTargetRedeemUpdated,
  // nftx.mint,
  // nftx.minted,
  // nftx.redeemed,
  // nftx.swap,
  // nftx.swapped,
  // nftx.vaultInit,
  // nftx.vaultShutdown,
  // nftxV3.eligibilityDeployed,
  // nftxV3.enableMintUpdated,
  // nftxV3.enableRedeemUpdated,
  // nftxV3.enableSwapUpdated,
  // nftxV3.minted,
  // nftxV3.redeemed,
  // nftxV3.swap,
  // nftxV3.swapped,
  // nftxV3.vaultInit,
  // nftxV3.vaultShutdown,
  // nouns.auctionSettled,
  // okex.orderFulfilled,
  operatorFilter.operatorUpdated,
  operatorFilter.operatorsUpdated,
  operatorFilter.subscriptionUpdated,
  // paymentProcessor.buySingleListing,
  // paymentProcessor.createdOrUpdatedSecurityPolicy,
  // paymentProcessor.masterNonceInvalidated,
  // paymentProcessor.nonceInvalidated,
  // paymentProcessor.sweepCollectionERC1155,
  // paymentProcessor.sweepCollectionERC721,
  // paymentProcessor.updatedCollectionPaymentCoin,
  // paymentProcessor.updatedCollectionSecurityPolicy,
  // paymentProcessorV2.acceptOfferERC1155,
  // paymentProcessorV2.acceptOfferERC721,
  // paymentProcessorV2.bannedAccountAddedForCollection,
  // paymentProcessorV2.bannedAccountRemovedForCollection,
  // paymentProcessorV2.buyListingERC1155,
  // paymentProcessorV2.buyListingERC721,
  // paymentProcessorV2.masterNonceInvalidated,
  // paymentProcessorV2.nonceInvalidated,
  // paymentProcessorV2.orderDigestInvalidated,
  // paymentProcessorV2.paymentMethodAddedToWhitelist,
  // paymentProcessorV2.paymentMethodRemovedFromWhitelist,
  // paymentProcessorV2.trustedChannelAddedForCollection,
  // paymentProcessorV2.trustedChannelRemovedForCollection,
  // paymentProcessorV2.updatedCollectionLevelPricingBoundaries,
  // paymentProcessorV2.updatedCollectionPaymentSettings,
  // paymentProcessorV2.updatedTokenLevelPricingBoundaries,
  // paymentProcessorV21.acceptOfferERC1155,
  // paymentProcessorV21.acceptOfferERC721,
  // paymentProcessorV21.buyListingERC1155,
  // paymentProcessorV21.buyListingERC721,
  // paymentProcessorV21.masterNonceInvalidated,
  // paymentProcessorV21.nonceInvalidated,
  // paymentProcessorV21.nonceRestored,
  // paymentProcessorV21.orderDigestInvalidated,
  // paymentProcessorV21.orderDigestItemsRestored,
  // paymentProcessorRegistry.paymentMethodAddedToWhitelist,
  // paymentProcessorRegistry.paymentMethodRemovedFromWhitelist,
  // paymentProcessorRegistry.trustedChannelAddedForCollection,
  // paymentProcessorRegistry.trustedChannelRemovedForCollection,
  // paymentProcessorRegistry.updatedCollectionPaymentSettings,
  // paymentProcessorRegistry.updatedTokenLevelPricingBoundaries,
  // quixotic.orderFulfilled,
  // rarible.buyV1,
  // rarible.cancel,
  // rarible.match,
  // rarible.matchV2,
  seadrop.publicDropUpdated,
  seaport.channelUpdated,
  seaport.counterIncremented,
  seaport.orderCancelled,
  seaport.orderFulfilled,
  seaport.orderValidated,
  seaportV14.counterIncremented,
  seaportV14.orderCancelled,
  seaportV14.orderFulfilled,
  seaportV14.orderValidated,
  seaportV14.ordersMatched,
  seaportV15.counterIncremented,
  seaportV15.orderCancelled,
  seaportV15.orderFulfilled,
  seaportV15.orderValidated,
  seaportV15.ordersMatched,
  seaportV16.counterIncremented,
  seaportV16.orderCancelled,
  seaportV16.orderFulfilled,
  seaportV16.orderValidated,
  seaportV16.ordersMatched,
  // sudoswap.buy,
  // sudoswap.deltaUpdate,
  // sudoswap.newPair,
  // sudoswap.sell,
  // sudoswap.spotPriceUpdate,
  // sudoswap.tokenDeposit,
  // sudoswap.tokenWithdrawal,
  // sudoswapV2.buyERC1155,
  // sudoswapV2.buyERC1155Hook,
  // sudoswapV2.buyERC721,
  // sudoswapV2.buyERC721Hook,
  // sudoswapV2.deltaUpdate,
  // sudoswapV2.erc1155Deposit,
  // sudoswapV2.erc20Deposit,
  // sudoswapV2.erc721Deposit,
  // sudoswapV2.newERC1155Pair,
  // sudoswapV2.newERC721Pair,
  // sudoswapV2.nftWithdrawalERC1155,
  // sudoswapV2.nftWithdrawalERC721,
  // sudoswapV2.sellERC1155,
  // sudoswapV2.sellERC1155Hook,
  // sudoswapV2.sellERC721,
  // sudoswapV2.sellERC721Hook,
  // sudoswapV2.spotPriceUpdate,
  // sudoswapV2.tokenDeposit,
  // sudoswapV2.tokenWithdrawal,
  superrare.auctionSettled,
  superrare.listingFilled,
  superrare.listingSold,
  superrare.offerAccept,
  superrare.setSalePrice,
  // thirdweb.claimConditionsUpdatedERC1155,
  // thirdweb.claimConditionsUpdatedERC721,
  // titlesxyz.editionPublished,
  // tofu.inventoryUpdate,
  treasure.bidAccepted,
  treasure.itemSold,
  // wyvernV2.ordersMatched,
  // wyvernV23.ordersMatched,
  // x2y2.orderCancelled,
  // x2y2.orderInventory,
  // zeroExV2.fill,
  // zeroExV3.fill,
  // zeroExV4.erc1155OrderCancelled,
  // zeroExV4.erc1155OrderFilled,
  // zeroExV4.erc721OrderCancelled,
  // zeroExV4.erc721OrderFilled,
  // zora.customMintComment,
  // zora.mintComment,
  // zora.salesConfigChanged,
  // zora.updatedToken,
  // zora.timedSaleStrategyRewards,
  // zora.timedSaleSet,
  // zora.merkleSaleSet,
  // zora.fixedPriceSaleSet,
  // zora.erc20SaleSet,
  // zora.timedSaleV2Set,
  // zora.secondaryMarketActivated,
  // zora.swap,
  // zora.secondaryBuy,
  // zora.secondarySell,
];

export const bpFilteredEventAddresses = bptFilteredEventData
  .map(
    ({ addresses }) =>
      addresses && Object.entries(addresses).map(([address, value]) => value && address)
  )
  .flat()
  .filter((address): address is string => typeof address === "string" && isAddress(address));

// Array of all addresses we're syncing events for
export const allEventsAddresses = allEventData
  .filter(({ addresses }) => !!addresses)
  .map(({ addresses }) => addresses && Object.keys(addresses))
  .flat();

export const getEventData = (events?: EventSubKind[]) => {
  if (!events) {
    return allEventData;
  } else {
    return allEventData.filter(({ subKind }) => events.some((e) => subKind.startsWith(e)));
  }
};
