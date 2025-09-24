import { Interface } from "@ethersproject/abi";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import * as Sdk from "@reservoir0x/sdk";

import { idb, redb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { fromBuffer, toBuffer } from "@/common/utils";
import { config } from "@/config/index";
import { orderRevalidationsJob } from "@/jobs/order-fixes/order-revalidations-job";
import { logger } from "@/common/logger";

enum TransferSecurityLevel {
  Recommended,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
}

export type ERC721CV3Config = {
  transferValidator: string;
  transferSecurityLevel: TransferSecurityLevel;
  listId: string;
  blacklist: List;
  whitelist: List;
  authorizers: string[];
};

export type List = {
  accounts: string[];
  codeHashes: string[];
};

const getAuthorizers = async (
  transferValidatorAddress: string,
  listId: string
): Promise<string[]> => {
  const transferValidator = new Contract(
    transferValidatorAddress,
    new Interface([
      "function getListAccounts(uint48 id, uint8 listType) view returns (address[] accounts)",
    ]),
    baseProvider
  );
  return transferValidator
    .getListAccounts(listId, 2)
    .then((authorizers: string[]) => authorizers.map((a) => a.toLowerCase()));
};

export const getAdditionalListContracts = async (
  transferValidatorAddress: string,
  listId: string
) => {
  // The below code is not correct, since only orders using the zone are fillable
  // and not all orders using the conduit. However this simple approach should be
  // enough for now (hopefully).

  const authorizers = await getAuthorizers(transferValidatorAddress, listId);

  const osAuthorizer = Sdk.SeaportBase.Addresses.OpenSeaV16SignedZone[config.chainId];
  const rsAuthorizer = Sdk.SeaportBase.Addresses.ReservoirV16RoyaltyEnforcingZone[config.chainId];

  const osConduitKey = Sdk.SeaportBase.Addresses.OpenseaConduitKey[config.chainId];
  const rsConduitKey = Sdk.SeaportBase.Addresses.ReservoirConduitKey[config.chainId];
  const meConduitKey = Sdk.SeaportBase.Addresses.MagicedenConduitKey[config.chainId];

  // Grant various conduits depending on the authorizer
  const additionalContracts: string[] = [];
  const whitelistedZones: string[] = [];

  // Opensea
  if (authorizers.find((authorizer) => authorizer === osAuthorizer)) {
    if (osConduitKey) {
      additionalContracts.push(
        new Sdk.SeaportBase.ConduitController(config.chainId).deriveConduit(osConduitKey)
      );
    }

    whitelistedZones.push(osAuthorizer);
  }

  // Reservoir and Magiceden
  if (authorizers.find((authorizer) => authorizer === rsAuthorizer)) {
    if (rsConduitKey) {
      additionalContracts.push(
        new Sdk.SeaportBase.ConduitController(config.chainId).deriveConduit(rsConduitKey)
      );
    }

    if (meConduitKey) {
      additionalContracts.push(
        new Sdk.SeaportBase.ConduitController(config.chainId).deriveConduit(meConduitKey)
      );
    }

    whitelistedZones.push(rsAuthorizer);
  }

  return { whitelistedZones, authorizers, additionalContracts };
};

const getConfig = async (contract: string): Promise<ERC721CV3Config | undefined> => {
  try {
    const token = new Contract(
      contract,
      new Interface(["function getTransferValidator() view returns (address)"]),
      baseProvider
    );

    const transferValidatorAddress = await token
      .getTransferValidator()
      .then((address: string) => address.toLowerCase());

    if (transferValidatorAddress === AddressZero) {
      // The collection doesn't use any transfer validator anymore
      await deleteConfig(contract);
    } else {
      const transferValidator = new Contract(
        transferValidatorAddress,
        new Interface([
          `
            function getCollectionSecurityPolicy(address collection) view returns (
              bool enableAuthorizationMode,
              bool authorizersCanSetWildcardOperators,
              uint8 transferSecurityLevel,
              uint120 listId,
              bool enableAccountFreezingMode
            )
          `,
        ]),
        baseProvider
      );

      const securityPolicy = await transferValidator.getCollectionSecurityPolicy(contract);
      const listId = securityPolicy.listId.toString();

      const { whitelistedZones, authorizers, additionalContracts } =
        await getAdditionalListContracts(transferValidatorAddress, listId);

      if (authorizers.length) {
        await orderRevalidationsJob.addToQueue([
          {
            by: "operator-or-zone",
            data: {
              origin: "royalty-enforcement",
              contract,
              whitelistedZones,
              status: "inactive",
            },
          },
        ]);
      }

      return {
        transferValidator: transferValidatorAddress.toLowerCase(),
        transferSecurityLevel: securityPolicy.transferSecurityLevel,
        listId,
        authorizers,
        whitelist: await refreshWhitelist(
          transferValidatorAddress,
          listId,
          authorizers,
          additionalContracts
        ),
        blacklist: await refreshBlacklist(
          transferValidatorAddress,
          listId,
          authorizers,
          additionalContracts
        ),
      };
    }
  } catch (error) {
    logger.error(
      "getConfig",
      JSON.stringify({
        topic: "TransferValidatorV5",
        message: `Debug TransferValidatorV5. contract=${contract}, error=${error}`,
        error,
      })
    );
  }

  return undefined;
};

export const getConfigFromDb = async (contract: string): Promise<ERC721CV3Config | undefined> => {
  const result = await redb.oneOrNone(
    `
        SELECT
            erc721c_v3_configs.*,
            erc721c_v3_lists.blacklist,
            erc721c_v3_lists.whitelist,
            erc721c_v3_lists.authorizers
        FROM erc721c_v3_configs
                 LEFT JOIN erc721c_v3_lists
                           ON erc721c_v3_configs.transfer_validator = erc721c_v3_lists.transfer_validator
                               AND erc721c_v3_configs.list_id = erc721c_v3_lists.id
        WHERE erc721c_v3_configs.contract = $/contract/
    `,
    { contract: toBuffer(contract) }
  );
  if (!result) {
    return undefined;
  }

  return {
    transferValidator: fromBuffer(result.transfer_validator),
    transferSecurityLevel: result.transfer_security_level,
    listId: result.list_id,
    authorizers: result.authorizers ?? [],
    whitelist: result.whitelist ?? [],
    blacklist: result.blacklist ?? [],
  };
};

const deleteConfig = async (contract: string) => {
  await idb.none("DELETE FROM erc721c_v3_configs WHERE contract = $/contract/", {
    contract: toBuffer(contract),
  });
};

export const refreshConfig = async (contract: string) => {
  const config = await getConfig(contract);

  if (config) {
    await idb.none(
      `
          INSERT INTO erc721c_v3_configs (
              contract,
              transfer_validator,
              transfer_security_level,
              list_id
          ) VALUES (
                       $/contract/,
                       $/transferValidator/,
                       $/transferSecurityLevel/,
                       $/listId/
                   )
              ON CONFLICT (contract)
        DO UPDATE SET
              transfer_validator = $/transferValidator/,
                             transfer_security_level = $/transferSecurityLevel/,
                             list_id = $/listId/,
                             updated_at = now()
      `,
      {
        contract: toBuffer(contract),
        transferValidator: toBuffer(config.transferValidator),
        transferSecurityLevel: config.transferSecurityLevel,
        listId: config.listId,
      }
    );

    return config;
  }

  return undefined;
};

export const refreshWhitelist = async (
  transferValidator: string,
  id: string,
  authorizers?: string[],
  contractsToAdd?: string[]
) => {
  const tv = new Contract(
    transferValidator,
    new Interface([
      "function getListAccounts(uint48 id, uint8 listType) public view returns (address[])",
      "function getListCodeHashes(uint48 id, uint8 listType) public view returns (bytes32[])",
    ]),
    baseProvider
  );

  const accounts: string[] = await tv
    .getListAccounts(id, 1)
    .then((r: string[]) => r.map((c: string) => c.toLowerCase()));

  const codeHashes: string[] = await tv
    .getListCodeHashes(id, 1)
    .then((r: string[]) => r.map((c: string) => c.toLowerCase()))
    .catch(() => []);

  const whitelist = {
    accounts: [...accounts, ...(contractsToAdd ?? [])],
    codeHashes,
  };

  if (!authorizers) {
    authorizers = await getAuthorizers(transferValidator, id);
  }

  await idb.none(
    `
        INSERT INTO erc721c_v3_lists(
            transfer_validator,
            id,
            authorizers,
            blacklist,
            whitelist
        ) VALUES (
                     $/transferValidator/,
                     $/id/,
                     $/authorizers:json/,
                     $/blacklist:json/,
                     $/whitelist:json/
                 )
            ON CONFLICT (transfer_validator, id)
      DO UPDATE SET
            authorizers = $/authorizers:json/,
                         whitelist = $/whitelist:json/
    `,
    {
      transferValidator: toBuffer(transferValidator),
      id,
      authorizers,
      blacklist: [],
      whitelist,
    }
  );

  const relevantContracts = await idb.manyOrNone(
    `
        SELECT
            erc721c_v3_configs.contract
        FROM erc721c_v3_configs
        WHERE erc721c_v3_configs.transfer_validator = $/transferValidator/
          AND erc721c_v3_configs.list_id = $/id/
          AND erc721c_v3_configs.transfer_security_level IN (0, 3, 4, 5, 6, 7, 8)
            LIMIT 1000
    `,
    {
      transferValidator: toBuffer(transferValidator),
      id,
    }
  );

  // Invalid any orders relying on blacklisted operators
  await orderRevalidationsJob.addToQueue(
    relevantContracts.map((c) => ({
      by: "operator-or-zone",
      data: {
        origin: "erc721c-v3",
        contract: fromBuffer(c.contract),
        whitelistedOperators: whitelist.accounts,
        status: "inactive",
      },
    }))
  );

  return whitelist;
};

export const refreshBlacklist = async (
  transferValidator: string,
  id: string,
  authorizers?: string[],
  contractsToSkip?: string[]
) => {
  const tv = new Contract(
    transferValidator,
    new Interface([
      "function getListAccounts(uint48 id, uint8 listType) public view returns (address[])",
      "function getListCodeHashes(uint48 id, uint8 listType) public view returns (bytes32[])",
    ]),
    baseProvider
  );

  const accounts: string[] = await tv
    .getListAccounts(id, 0)
    .then((r: string[]) => r.map((c: string) => c.toLowerCase()));

  const codeHashes: string[] = await tv
    .getListCodeHashes(id, 0)
    .then((r: string[]) => r.map((c: string) => c.toLowerCase()))
    .catch(() => []);

  const blacklist = {
    accounts: accounts.filter((account) => !(contractsToSkip ?? []).includes(account)),
    codeHashes,
  };

  if (!authorizers) {
    authorizers = await getAuthorizers(transferValidator, id);
  }

  await idb.none(
    `
        INSERT INTO erc721c_v3_lists(
            transfer_validator,
            id,
            authorizers,
            blacklist,
            whitelist
        ) VALUES (
                     $/transferValidator/,
                     $/id/,
                     $/authorizers:json/,
                     $/blacklist:json/,
                     $/whitelist:json/
                 )
            ON CONFLICT (transfer_validator, id)
      DO UPDATE SET
            authorizers = $/authorizers:json/,
                         blacklist = $/blacklist:json/
    `,
    {
      transferValidator: toBuffer(transferValidator),
      id,
      authorizers,
      blacklist,
      whitelist: [],
    }
  );

  const relevantContracts = await idb.manyOrNone(
    `
        SELECT
            erc721c_v3_configs.contract
        FROM erc721c_v3_configs
        WHERE erc721c_v3_configs.transfer_validator = $/transferValidator/
          AND erc721c_v3_configs.list_id = $/id/
          AND erc721c_v3_configs.transfer_security_level IN (2)
            LIMIT 1000
    `,
    {
      transferValidator: toBuffer(transferValidator),
      id,
    }
  );

  // Invalid any orders relying on blacklisted operators
  await orderRevalidationsJob.addToQueue(
    relevantContracts.map((c) => ({
      by: "operator-or-zone",
      data: {
        origin: "erc721c-v3",
        contract: fromBuffer(c.contract),
        blacklistedOperators: blacklist.accounts,
        status: "inactive",
      },
    }))
  );

  return blacklist;
};

const getListByConfig = (
  config: ERC721CV3Config
): {
  whitelist?: string[];
  blacklist?: string[];
} => {
  switch (config.transferSecurityLevel) {
    // No restrictions
    case TransferSecurityLevel.One: {
      return {};
    }

    // Blacklist restrictions
    case TransferSecurityLevel.Two: {
      return {
        blacklist: config.blacklist.accounts,
      };
    }

    // Whitelist restrictions
    default: {
      return {
        whitelist: config.whitelist.accounts,
      };
    }
  }
};

export const checkMarketplaceIsFiltered = async (contract: string, operators: string[]) => {
  const config = await getConfigFromDb(contract);
  if (!config) {
    throw new Error("Missing config");
  }

  const { whitelist, blacklist } = getListByConfig(config);

  if (whitelist) {
    return whitelist.length ? operators.some((op) => !whitelist.includes(op)) : true;
  } else if (blacklist) {
    return blacklist.length ? operators.some((op) => blacklist.includes(op)) : false;
  } else {
    return false;
  }
};
