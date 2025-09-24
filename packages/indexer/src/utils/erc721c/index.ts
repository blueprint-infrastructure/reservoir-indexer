import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import * as Sdk from "@reservoir0x/sdk";

import { idb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { toBuffer } from "@/common/utils";
import { config } from "@/config/index";

import * as v1 from "@/utils/erc721c/v1";
import * as v2 from "@/utils/erc721c/v2";
import * as v3 from "@/utils/erc721c/v3";
import * as v5 from "@/utils/erc721c/v5";

export { v1, v2, v3 };

export const refreshConfig = async (contract: string) => {
  try {
    const version = await getVersion(contract);
    version === "v1"
      ? await v1.refreshConfig(contract)
      : version === "v2"
      ? await v2.refreshConfig(contract)
      : version === "v3"
      ? await v3.refreshConfig(contract)
      : await v5.refreshConfig(contract);

    // TODO: Ideally we have a single database table to store the ERC721C configuration
    const nonMatchingConfigTables =
      version === "v1"
        ? ["erc721c_v2_configs", "erc721c_v3_configs"]
        : version === "v2"
        ? ["erc721c_configs", "erc721c_v3_configs"]
        : ["erc721c_configs", "erc721c_v2_configs"];

    // Delete any entries in the configs that are not corresponding to the current version
    const queries = nonMatchingConfigTables.map(
      (ct) => `DELETE FROM ${ct} WHERE contract = $/contract/`
    );
    await idb.none(queries.join(";"), { contract: toBuffer(contract) });
  } catch {
    // Ignore errors
  }
};

export const checkMarketplaceIsFiltered = async (contract: string, operators: string[]) => {
  const v1Config = await v1.getConfigFromDb(contract);

  if (v1Config) {
    return { version: "v1", isFiltered: await v1.checkMarketplaceIsFiltered(contract, operators) };
  }

  const v2Config = await v2.getConfigFromDb(contract);
  if (v2Config) {
    return { version: "v2", isFiltered: await v2.checkMarketplaceIsFiltered(contract, operators) };
  }

  const v3Config = await v3.getConfigFromDb(contract);
  if (v3Config) {
    return { version: "v3", isFiltered: await v3.checkMarketplaceIsFiltered(contract, operators) };
  }

  return { version: null, isFiltered: false };
};

export const getVersion = async (contract: string) => {
  const token = new Contract(
    contract,
    new Interface(["function getTransferValidator() view returns (address)"]),
    baseProvider
  );

  const transferValidator = await token
    .getTransferValidator()
    .then((address: string) => address.toLowerCase());
  if (Sdk.Erc721c.Addresses.TransferValidatorV1[config.chainId] === transferValidator) {
    return "v1";
  } else if (
    Sdk.Erc721c.Addresses.TransferValidatorV2[config.chainId] === transferValidator ||
    Sdk.Erc721c.Addresses.OpenSeaCustomTransferValidator[config.chainId] === transferValidator
  ) {
    return "v2";
  } else if (
    Sdk.Erc721c.Addresses.TransferValidatorV3[config.chainId] === transferValidator ||
    Sdk.Erc721c.Addresses.TransferValidatorV4[config.chainId] === transferValidator ||
    Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId] === transferValidator
  ) {
    if (Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId] === transferValidator) {
      return "v5";
    }

    return "v3";
  }

  throw new Error("Unknown transfer validator");
};

// Since v3, the eoa registry is a standalone contract rather than part of the transfer validator.
// As such, the below methods will override `transferValidator` in the cases when this is needed.

export const isVerifiedEOA = async (transferValidator: string, address: string) => {
  if (
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV3[config.chainId] ||
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV4[config.chainId] ||
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId]
  ) {
    transferValidator = Sdk.Erc721c.Addresses.EOARegistry[config.chainId];
  }

  const result = await idb.oneOrNone(
    `
      SELECT
        1
      FROM erc721c_verified_eoas
      WHERE erc721c_verified_eoas.transfer_validator = $/transferValidator/
        AND erc721c_verified_eoas.address = $/address/
    `,
    {
      transferValidator: toBuffer(transferValidator),
      address: toBuffer(address),
    }
  );
  return Boolean(result);
};

export const saveVerifiedEOA = async (transferValidator: string, address: string) => {
  if (
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV3[config.chainId] ||
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV4[config.chainId] ||
    transferValidator === Sdk.Erc721c.Addresses.TransferValidatorV5[config.chainId]
  ) {
    transferValidator = Sdk.Erc721c.Addresses.EOARegistry[config.chainId];
  }

  await idb.none(
    `
      INSERT INTO erc721c_verified_eoas(
        transfer_validator,
        address
      ) VALUES (
        $/transferValidator/,
        $/address/
      ) ON CONFLICT DO NOTHING
    `,
    {
      transferValidator: toBuffer(transferValidator),
      address: toBuffer(address),
    }
  );
};
