# Index only allowlisted NFT contracts

This document describes the changes, rationale, and how to run the indexer so it only processes events for a predefined allowlist of NFT contracts.

## Summary of changes

- **Config**
  - Added `INDEXED_CONTRACTS_CSV_PATH` env var (read at `packages/indexer/src/config/index.ts`), which points to a CSV file containing one contract address per line. Lines starting with `#` are treated as comments. Addresses are case-insensitive and normalized to lowercase.
  - Removed any usage of `INDEXED_CONTRACTS_SET_ID` and the fallback `INDEXED_CONTRACTS` (comma-separated) environment variable. CSV is the single source of truth.

- **Allowlist loader**
  - Logic at `packages/indexer/src/utils/indexed-contracts.ts` loads the allowlist strictly from the CSV path. If the path is not provided or the file does not exist, the allowlist is considered disabled (the indexer behaves as before and will not filter by contract).

- **Event sync filtering**
  - `packages/indexer/src/sync/events/index.ts` updates the RPC `getLogs` filter to include `eventFilter.address = allowlist ∪ allEventsAddresses`.
    - `allowlist`: addresses from the CSV file (only these NFT contracts are synced).
    - `allEventsAddresses`: static protocol addresses (eg. Seaport, Blur, etc.) used for interpreting fills and order lifecycle events.
  - This reduces RPC traffic and downstream processing by ignoring non-allowlisted NFT contracts.

- **Persistence boundary filtering (defense-in-depth)**
  - `packages/indexer/src/sync/events/handlers/utils/index.ts` applies the same allowlist when persisting `nftTransferEvents`, `nftApprovalEvents`, and `fillEvents*`. Any unexpected events arriving beyond the RPC filter are dropped before DB writes and job dispatch.

## Rationale

- **Performance**: dramatically reduces the number of logs scanned and records written when you care about a subset of the chain.
- **Determinism**: protocol addresses remain included to keep fills/order validation correct, but NFT data is restricted to the allowlist.
- **Operational simplicity**: a single CSV file defines the scope; changes are explicit and reviewable.

## CSV format

- One contract address per line.
- Optional comments via lines starting with `#`.
- Example:

```
# Art Blocks
0x99a9b7c1116f9ceeb1652de04d5969cce509b069
# Async
0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0
0x41A322b28D0fF354040e2CbC676F0320d8c8850d
```

## How to run

1) Set the CSV path (absolute path recommended)

```
export INDEXED_CONTRACTS_CSV_PATH=/Users/you/path/lightyear-smartcontracts.csv
```

2) Start the indexer

- Build and run all packages:
```
yarn install
yarn build
yarn start
```

- Or run just the indexer package:
```
cd packages/indexer
yarn build
yarn start
```

Realtime sync will now only ingest logs for contracts in the CSV (plus protocol addresses for fills/orders).

## Backfilling newly added contracts

When you add new contracts to the CSV, restart the indexer and trigger a historical backfill for the desired block range via the admin API.

- API: `POST /admin/sync-events`
- Headers: `x-admin-api-key: <ADMIN_API_KEY>`
- Payload example:

```
{
  "fromBlock": 19000000,
  "toBlock": 19005000,
  "backfill": true,
  "syncEventsOnly": true,
  "useArchiveRpcProvider": true,
  "blocksPerBatch": 32
}
```

Because the sync layer filters by the allowlist, only data for newly added contracts will be fetched and persisted.

## Notes

- If `INDEXED_CONTRACTS_CSV_PATH` is not set or the file is missing, the allowlist is disabled and the indexer behaves as before (full-chain scope by topic).
- ERC20 handling remains unchanged (`INDEX_ALL_ERC20` logic is untouched).
- All protocol events remain observed to keep order and fill logic correct.
