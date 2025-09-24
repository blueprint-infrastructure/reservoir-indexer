import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { verifyTypedData } from "@ethersproject/wallet";
import * as Sdk from "@reservoir0x/sdk";
import { MatchParams, OrderComponents } from "@reservoir0x/sdk/dist/seaport-base/types";

import { idb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { bn, now } from "@/common/utils";
import { config } from "@/config/index";
import { cosigner, saveOffChainCancellations } from "@/utils/offchain-cancel";
import { Features, FlaggedTokensChecker } from "@/utils/offchain-cancel/seaport/flagged-tokens";
import { redis } from "@/common/redis";
import * as erc721c from "@/utils/erc721c";

export type OffChainCancellableOrderKind =
  | "seaport-v1.4"
  | "seaport-v1.5"
  | "seaport-v1.6"
  | "alienswap"
  | "mintify";

type Order =
  | Sdk.SeaportV14.Order
  | Sdk.SeaportV15.Order
  | Sdk.SeaportV16.Order
  | Sdk.Alienswap.Order
  | Sdk.Mintify.Order;

type CancelCall = {
  orderKind: OffChainCancellableOrderKind;
  signature: string;
  orders: OrderComponents[];
};

type ReplacementCall = {
  orderKind: OffChainCancellableOrderKind;
  newOrders: OrderComponents[];
  replacedOrders: OrderComponents[];
};

export const createOrder = (
  chainId: number,
  orderData: OrderComponents,
  orderKind: OffChainCancellableOrderKind
): Order => {
  if (orderKind === "alienswap") {
    return new Sdk.Alienswap.Order(chainId, orderData);
  } else if (orderKind === "seaport-v1.4") {
    return new Sdk.SeaportV14.Order(chainId, orderData);
  } else if (orderKind === "seaport-v1.5") {
    return new Sdk.SeaportV15.Order(chainId, orderData);
  } else if (orderKind === "mintify") {
    return new Sdk.Mintify.Order(chainId, orderData);
  } else {
    return new Sdk.SeaportV16.Order(chainId, orderData);
  }
};

export const hashOrders = async (
  orders: OrderComponents[],
  orderKind: OffChainCancellableOrderKind
) => {
  let orderSigner: string | undefined;

  const orderHashes = [];
  for (const orderData of orders) {
    const order = createOrder(config.chainId, orderData, orderKind);
    const orderHash = order.hash();

    try {
      await order.checkSignature(baseProvider);
    } catch {
      throw new Error("Wrong order signature");
    }

    if (!orderSigner) {
      orderSigner = order.params.offerer;
    } else if (order.params.offerer.toLowerCase() !== orderSigner.toLowerCase()) {
      throw new Error("Signer mismatch");
    }

    orderHashes.push(orderHash);
  }

  return { orderHashes, orderSigner };
};

const verifyOffChainCancellationSignature = async (
  orderIds: string[],
  signature: string,
  signer: string
) => {
  const message = await generateOffChainCancellationSignatureData(orderIds);

  // First, check for an eip155 (eoa) signature
  let isValidEIP155Signature = false;
  try {
    const recoveredSigner = verifyTypedData(
      message.domain,
      message.types,
      message.value,
      signature
    );
    isValidEIP155Signature = recoveredSigner.toLowerCase() === signer.toLowerCase();
  } catch {
    // Skip errors
  }

  // Secondly, check for an eip1271 (contract) signature
  let isValidEIP1271Signature = false;
  if (!isValidEIP155Signature) {
    try {
      const eip712Hash = _TypedDataEncoder.hash(message.domain, message.types, message.value);

      const iface = new Interface([
        "function isValidSignature(bytes32 digest, bytes signature) view returns (bytes4)",
      ]);

      const result = await new Contract(signer, iface, baseProvider).isValidSignature(
        eip712Hash,
        signature
      );
      isValidEIP1271Signature = result === iface.getSighash("isValidSignature");
    } catch {
      // Skip errors
    }
  }

  return isValidEIP155Signature || isValidEIP1271Signature;
};

export const generateOffChainCancellationSignatureData = async (orderIds: string[]) => {
  // Get the zones of all orders to cancel
  const cancellationZones: { zone: string | null }[] = await idb.manyOrNone(
    "SELECT orders.raw_data->>'zone'::TEXT AS zone FROM orders WHERE orders.id IN ($/orderIds:list/)",
    { orderIds }
  );

  // If the zone is unknown, error
  const mainZone = cancellationZones[0].zone;
  if (
    !mainZone ||
    ![
      Sdk.SeaportBase.Addresses.ReservoirCancellationZone[config.chainId],
      Sdk.SeaportBase.Addresses.ReservoirV16CancellationZone[config.chainId],
      Sdk.SeaportBase.Addresses.ReservoirV16RoyaltyEnforcingZone[config.chainId],
    ].includes(mainZone)
  ) {
    throw new Error("Unauthorized");
  }

  // Ensure all orders have the same zone
  if (!cancellationZones.every(({ zone }) => zone === mainZone)) {
    throw new Error("Cannot cancel all orders at once");
  }

  return {
    signatureKind: "eip712",
    domain: {
      name: "SignedZone",
      version: "1.0.0",
      chainId: config.chainId,
      verifyingContract: mainZone,
    },
    types: { OrderHashes: [{ name: "orderHashes", type: "bytes32[]" }] },
    value: {
      orderHashes: orderIds,
    },
    primaryType: "OrderHashes",
  };
};

export const doCancel = async (data: CancelCall) => {
  const orders = data.orders;

  const { orderHashes, orderSigner } = await hashOrders(orders, data.orderKind);
  if (!orderHashes || !orderSigner) {
    throw Error("Unauthorized");
  }

  const success = await verifyOffChainCancellationSignature(
    orderHashes,
    data.signature,
    orderSigner!
  );
  if (!success) {
    throw Error("Unauthorized");
  }

  await saveOffChainCancellations(orderHashes!);
};

export const doReplacement = async ({ replacedOrders, newOrders, orderKind }: ReplacementCall) => {
  const result = await hashOrders(replacedOrders, orderKind);
  const { orderHashes, orderSigner } = result;

  const replacedOrdersByHash = new Map(orderHashes!.map((hash, i) => [hash, replacedOrders[i]]));

  const salts = [];
  for (const orderData of newOrders) {
    const order = createOrder(config.chainId, orderData, orderKind);

    try {
      await order.checkSignature(baseProvider);
    } catch {
      throw new Error("Wrong order signature");
    }

    if (order.params.offerer.toLowerCase() !== orderSigner?.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    if (bn(order.params.salt).isZero()) {
      throw new Error("Salt is missing");
    }

    const replacedOrder = replacedOrdersByHash.get(order.params.salt);
    if (!replacedOrder || replacedOrder.offerer != orderSigner) {
      throw new Error("Signer mismatch");
    }

    salts.push(order.params.salt);
  }

  await saveOffChainCancellations(salts);
};

export const doSignOrder = async (
  order: Order,
  taker: string,
  matchParams: MatchParams,
  skipOffChainCancellableIsFillableCheck?: boolean
) => {
  if (order.isCosignedOrder()) {
    const orderId = order.hash();

    const isOffChainCancelled = await idb.oneOrNone(
      `SELECT 1 FROM off_chain_cancellations WHERE order_id = $/orderId/`,
      { orderId }
    );
    if (isOffChainCancelled) {
      throw new Error("Order is off-chain cancelled");
    }

    if (!skipOffChainCancellableIsFillableCheck) {
      const isFillable = await idb.oneOrNone(
        `SELECT 1 FROM orders WHERE id = $/orderId/ AND orders.fillability_status = 'fillable' AND orders.approval_status = 'approved'`,
        { orderId }
      );
      if (!isFillable) {
        throw new Error("Order is not fillable");
      }
    }

    const features = new Features(order.params.zoneHash);
    if (features.checkFlagged()) {
      const requestedReceivedItems = order.getReceivedItems(matchParams);

      const flaggedTokensChecker = new FlaggedTokensChecker(requestedReceivedItems);
      const hasFlaggedTokens = await flaggedTokensChecker.containsFlagged(requestedReceivedItems);
      if (hasFlaggedTokens) {
        throw new Error("Order references flagged tokens");
      }
    }

    let transferValidator: string | undefined;

    try {
      if (
        [Sdk.SeaportBase.Addresses.ReservoirV16RoyaltyEnforcingZone[config.chainId]].includes(
          order.params.zone
        ) &&
        (Sdk.Erc721c.Addresses.TransferValidatorV4[config.chainId] ||
          Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId])
      ) {
        const info = order.getInfo();

        if (info) {
          const configV3 = await erc721c.v3.getConfigFromDb(info.contract);

          if (
            configV3 &&
            (configV3.transferValidator ===
              Sdk.Erc721c.Addresses.TransferValidatorV4[config.chainId] ||
              configV3.transferValidator ===
                Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId])
          ) {
            transferValidator = configV3.transferValidator;
          }
        }
      }
    } catch {
      // Skip errors
    }

    await order.cosign(cosigner(), taker, matchParams, order.params.zone, transferValidator);

    await redis.set(`cosigner-order:${orderId}`, now(), "EX", 90);
  }
};
