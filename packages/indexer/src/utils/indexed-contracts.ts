import { logger } from "@/common/logger";
import { config } from "@/config/index";
import { isAddress } from "ethers/lib/utils";
import fs from "fs";
import path from "path";

let allowlistAddresses: string[] | undefined;

// Return lowercase addresses to be used in allowlist checks and RPC filters
export const getIndexedContractsAllowlist = async (): Promise<string[] | undefined> => {
  try {
    if (!allowlistAddresses && config.indexedContractsCsvPath) {
      const fullPath = path.isAbsolute(config.indexedContractsCsvPath)
        ? config.indexedContractsCsvPath
        : path.join(process.cwd(), config.indexedContractsCsvPath);
      logger.debug("indexedContractsCsvPath", `Full path: ${fullPath}`);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        allowlistAddresses = content
          .split(/\r?\n/)
          .map((l) => l.trim().toLowerCase())
          .filter((l) => isAddress(l));
        logger.debug("Set allowlist addresses", `${allowlistAddresses.join(", ")}`);
      }
    }

    return allowlistAddresses?.length ? allowlistAddresses : undefined;
  } catch {
    return undefined;
  }
};
