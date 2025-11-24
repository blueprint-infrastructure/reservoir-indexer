/* eslint-disable no-console */
import { getAddress } from "ethers/lib/utils";
import { execSync } from "child_process";


const startBackfill = async () => {

  let CONTRACT_ADDRESS:string 

  try {
    CONTRACT_ADDRESS = getAddress(process.env.CONTRACT_ADDRESS!);
  } catch (error) {
    throw new Error(`Invalid contract address: [${process.env.CONTRACT_ADDRESS}]`);
  }
  
  if(!process.env.ETHERSCAN_API_KEY) {
    throw new Error("ETHERSCAN_API_KEY is not set");
  }

  if(!process.env.JSON_RPC_PROVIDER) {
    throw new Error("JSON_RPC_PROVIDER is not set");
  }
  
  const res = await fetch(
    `https://api.etherscan.io/v2/api
  ?chainid=1
  &module=contract
  &action=getcontractcreation
  &contractaddresses=${CONTRACT_ADDRESS}
  &apikey=${process.env.ETHERSCAN_API_KEY}`.replace(/\s+/g, "")
  );
  const data: { result: Array<{ txHash: string; blockNumber: string }> } = await res.json();

  const contractDeploymentBlockNumber = parseInt(data.result[0].blockNumber);

  const blockInfoRes = await fetch(process.env.JSON_RPC_PROVIDER, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    }),
  });

  const blockInfo: {
    result: string;
  } = await blockInfoRes.json();

  const latestBlockNumber = parseInt(blockInfo.result);

  console.debug(`Latest block: ${latestBlockNumber} (${blockInfo.result})`);

  const body = {
    fromBlock: contractDeploymentBlockNumber,
    toBlock: latestBlockNumber,
    syncDetails: {
      method: "addresses",
      addresses: [CONTRACT_ADDRESS],
    },
    syncEventsOnly: true,
  };

  const result = execSync(`curl -X POST "http://localhost:3000/admin/sync-events" \
    -H "X-Admin-Api-Key: sk_admin_7f9d2e8a1c5b4f6e9d3a8b2c4e7f1a9b5c8d2e6f4a7b9c1d5e8f2a6b3c9d4e7f" \
    -H "Content-Type: application/json" \
    -d '${JSON.stringify(body)}'`).toString();

  console.debug(result);
};

startBackfill();
