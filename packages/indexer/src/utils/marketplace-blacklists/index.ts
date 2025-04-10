import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import * as Sdk from "@reservoir0x/sdk";

import { idb, redb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { redis } from "@/common/redis";
import { toBuffer } from "@/common/utils";
import { config } from "@/config/index";
import { orderRevalidationsJob } from "@/jobs/order-fixes/order-revalidations-job";
import { OrderKind } from "@/orderbook/orders";
import * as erc721c from "@/utils/erc721c";

export type Operator = {
  address: string;
  marketplace: OrderKind;
};

export const deleteCollectionCaches = async (contract: string) => {
  await redis.del(`marketplace-blacklist:${contract}`);

  const pattern = `marketplace-blacklist-custom-logic:${contract}:*`;
  let cursor = "0";

  do {
    const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 250);
    cursor = newCursor;

    if (keys.length) {
      await Promise.all([redis.del(keys)]);
    }
  } while (cursor !== "0");
};

export const checkMarketplaceIsFiltered = async (
  contract: string,
  operators: string[],
  refresh?: boolean
) => {
  const erc721cCheck = await erc721c.checkMarketplaceIsFiltered(contract, operators);
  if (erc721cCheck.version) {
    return erc721cCheck.isFiltered;
  }

  let result: string[] | null = [];
  if (refresh) {
    result = await updateMarketplaceBlacklist(contract);
  } else {
    const cacheKey = `marketplace-blacklist:${contract}`;
    result = await redis.get(cacheKey).then((r) => (r ? (JSON.parse(r) as string[]) : null));
    if (!result) {
      result = await getMarketplaceBlacklistFromDb(contract).then((r) => r.blacklist);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);
    }
  }

  const customCheck = await isBlockedByCustomLogic(contract, operators, refresh);
  if (customCheck) {
    return customCheck;
  }

  return operators.some((c) => result!.includes(c));
};

export const isBlockedByCustomLogic = async (
  contract: string,
  operators: string[],
  refresh?: boolean
) => {
  const cacheKey = `marketplace-blacklist-custom-logic:${contract}:${JSON.stringify(operators)}`;
  let cache = await redis.get(cacheKey);
  if (refresh || !cache) {
    const iface = new Interface([
      "function registry() view returns (address)",
      "function beforeTokenTransferHandler() view returns (address)",
    ]);
    const nft = new Contract(contract, iface, baseProvider);

    let result = false;
    let blacklist: string[] = [];

    // `registry()`
    try {
      const registry = new Contract(
        await nft.registry(),
        new Interface([
          "function isAllowedOperator(address operator) external view returns (bool)",
        ]),
        baseProvider
      );

      const allowed = await Promise.all(operators.map((c) => registry.isAllowedOperator(c)));
      result = allowed.some((c) => !c);

      if (result) {
        blacklist = operators;
      }
    } catch {
      // Skip errors
    }

    // `beforeTokenTransferHandler()`
    try {
      const registry = new Contract(
        await nft.beforeTokenTransferHandler(),
        new Interface(["function getDenylistOperators() view returns (address[])"]),
        baseProvider
      );

      const blockedOperators = await registry
        .getDenylistOperators()
        .then((ops: string[]) => ops.map((op) => op.toLowerCase()));
      result = operators.every((c) => blockedOperators.includes(c));

      blacklist = blockedOperators;
    } catch {
      // Skip errors
    }

    // Positive case
    if (result) {
      // Invalid any orders relying on the blacklisted operator
      if (blacklist.length) {
        await orderRevalidationsJob.addToQueue([
          {
            by: "operator-or-zone",
            data: {
              origin: "marketplace-blacklist",
              contract,
              blacklistedOperators: blacklist,
              status: "inactive",
            },
          },
        ]);
      }

      await redis.set(cacheKey, "1", "EX", 24 * 60 * 60);
      return result;
    }

    // Negative case
    await redis.set(cacheKey, "0", "EX", 24 * 60 * 60);
    cache = "0";
  }

  return Boolean(Number(cache));
};

const getMarketplaceBlacklist = async (contract: string): Promise<string[]> => {
  const iface = new Interface([
    "function filteredOperators(address registrant) external view returns (address[])",
  ]);

  let openseaOperators: string[] = [];
  if (Sdk.SeaportBase.Addresses.OperatorFilterRegistry[config.chainId]) {
    const opensea = new Contract(
      Sdk.SeaportBase.Addresses.OperatorFilterRegistry[config.chainId],
      iface,
      baseProvider
    );
    openseaOperators = await opensea.filteredOperators(contract);
  }

  let blurOperators: string[] = [];
  if (Sdk.Blur.Addresses.OperatorFilterRegistry[config.chainId]) {
    const blur = new Contract(
      Sdk.Blur.Addresses.OperatorFilterRegistry[config.chainId],
      iface,
      baseProvider
    );
    blurOperators = await blur.filteredOperators(contract);
  }

  const allOperatorsList = openseaOperators
    .concat(blurOperators)
    .map((o: string) => o.toLowerCase());
  return Array.from(new Set(allOperatorsList));
};

export const getMarketplaceBlacklistFromDb = async (
  contract: string
): Promise<{ blacklist: string[] }> => {
  const result = await redb.oneOrNone(
    `
      SELECT
        contracts.filtered_operators
      FROM contracts
      WHERE contracts.address = $/contract/
    `,
    { contract: toBuffer(contract) }
  );
  return { blacklist: result?.filtered_operators || [] };
};

export const updateMarketplaceBlacklist = async (contract: string) => {
  const blacklist = await getMarketplaceBlacklist(contract);
  await idb.none(
    `
      UPDATE contracts
        SET filtered_operators = $/blacklist:json/
      WHERE contracts.address = $/contract/
    `,
    {
      contract: toBuffer(contract),
      blacklist,
    }
  );

  // Invalid any orders relying on the blacklisted operator
  await orderRevalidationsJob.addToQueue([
    {
      by: "operator-or-zone",
      data: {
        origin: "marketplace-blacklist",
        contract,
        blacklistedOperators: blacklist,
        status: "inactive",
      },
    },
  ]);

  return blacklist;
};
