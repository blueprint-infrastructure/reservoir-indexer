import { config } from "@/config/index";
import fs from "fs";
import path from "path";

// Return lowercase addresses to be used in allowlist checks and RPC filters
export const getIndexedContractsAllowlist = async (): Promise<string[] | undefined> => {
  try {
    // CSV file path is required source
    if (config.indexedContractsCsvPath) {
      const fullPath = path.isAbsolute(config.indexedContractsCsvPath)
        ? config.indexedContractsCsvPath
        : path.join(process.cwd(), config.indexedContractsCsvPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#"));
        return lines.length ? lines.map((c) => c.toLowerCase()) : [];
      }
    }

    // No allowlist configured
    return undefined;
  } catch {
    return undefined;
  }
};


