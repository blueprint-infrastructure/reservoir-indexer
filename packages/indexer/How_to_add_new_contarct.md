# How to add new contract to whitelist

1. Edit [lightyear-smartcontracts.csv](lightyear-smartcontracts.csv), add new contract and commit it.

2. Connect to the server node
    ```bash
    # get the latest code
    git pull

    # restart reservoir service
    /home/reservoir/restart-services.sh

    # go to indexer dir
    cd /home/reservoir/packages/indexer

    # start backfill job
    CONTRACT_ADDRESS=new_contract_address ETHERSCAN_API_KEY=etherscan_api_key JSON_RPC_PROVIDER=json_rpc_endpoint tsx scripts/start-backfill.ts 
    ```
