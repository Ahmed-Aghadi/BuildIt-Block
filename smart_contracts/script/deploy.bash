# Usage: bash deploy.bash <chain_name>

source .env
legacy=false
if [ $1 == "sepolia" ] ; then
    chainId=11155111
    rpcURL=$SEPOLIA_RPC_URL
    etherscanKey="sepolia"
elif [ $1 == "polygon_zkevm_cardona_testnet" ] ; then
    chainId=2442
    rpcURL=$POLYGONZKEVM_CARDONA_TESTNET_RPC_URL
    etherscanKey="polygon_zkevm_cardona_testnet"
    legacy=true # else it throws: Failed to get EIP-1559 fees
elif [ $1 == "avalanche_fuji" ] ; then
    chainId=43113
    rpcURL=$AVALANCHE_FUJI_TESTNET_RPC_URL
    etherscanKey="avalanche_fuji"
elif [ $1 == "metis_sepolia" ] ; then
    chainId=59902
    rpcURL=$METIS_SEPOLIA_RPC_URL
    etherscanKey="metis_sepolia"
    legacy=true # else it throws: Failed to get EIP-1559 fees
    # But even with legacy, it throws: Transaction dropped from the mempool: <tx_hash>
    # Although transaction is successfull, but I believe it has something to do tx receipt
elif [ $1 == "scroll_sepolia" ] ; then
    chainId=534351
    rpcURL=$SCROLL_SEPOLIA_RPC_URL
    etherscanKey="scroll_sepolia"
elif [ $1 == "zksync_sepolia" ] ; then
    chainId=300
    rpcURL=$ZKSYNC_SEPOLIA_RPC_URL
    etherscanKey="zksync_sepolia"
elif [ $1 == "polygon_amoy" ] ; then
    chainId=80002
    rpcURL=$POLYGON_AMOY_RPC_URL
    etherscanKey="polygon_amoy"
else
    echo "Invalid chain name. Please provide a valid chain name."
    exit 1
fi

if [ $legacy == true ] ; then
    forge script script/DeployAll.s.sol:DeployAll --slow --chain-id $chainId --rpc-url $rpcURL --broadcast --verify --verifier etherscan --etherscan-api-key $etherscanKey --private-key $PRIVATE_KEY --legacy -vvvv --resume
else
    forge script script/DeployAll.s.sol:DeployAll --slow --chain-id $chainId --rpc-url $rpcURL --broadcast --verify --verifier etherscan --etherscan-api-key $etherscanKey --private-key $PRIVATE_KEY -vvvv
fi