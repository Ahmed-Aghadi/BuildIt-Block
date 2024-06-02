require("@nomicfoundation/hardhat-foundry");
// require("@nomiclabs/hardhat-waffle")
// require("@nomiclabs/hardhat-etherscan");
// require("hardhat-deploy");
// require("solidity-coverage")
// require("hardhat-gas-reporter")
// require("hardhat-contract-sizer")
// require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-verify");

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://1rpc.io/sepolia";
const ZKSYNC_SEPOLIA_RPC_URL =
  process.env.ZKSYNC_SEPOLIA_RPC_URL || "https://sepolia.era.zksync.dev";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";
const MAIN_PRIVATE_KEY = process.env.MAIN_PRIVATE_KEY || "0x";

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "Your etherscan API key";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "zksync",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL, // The Ethereum Web3 RPC URL (optional).
      accounts: [PRIVATE_KEY],
    },
    zksync: {
      url: ZKSYNC_SEPOLIA_RPC_URL,
      // accounts: [MAIN_PRIVATE_KEY],
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 300,
      timeout: 300000, // 300 seconds
      ethNetwork: "sepolia", // The Ethereum Web3 RPC URL, or the identifier of the network (e.g. `mainnet` or `sepolia`)
      zksync: true,
      // Verification endpoint for Sepolia
      verifyURL:
        "https://explorer.sepolia.era.zksync.dev/contract_verification",
    },
  },
  etherscan: {
    // To list networks supported by default: npx hardhat verify --list-networks
    // You can manually add support for it by following these instructions: https://hardhat.org/verify-custom-networks
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      zksync: "",
    },
    customChains: [
      {
        network: "zksync",
        chainId: 300,
        urls: {
          apiURL:
            "https://explorer.sepolia.era.zksync.dev/contract_verification",
          browserURL: "https://explorer.sepolia.era.zksync.dev",
        },
      },
    ],
  },
  // gasReporter: {
  //   enabled: REPORT_GAS,
  //   currency: "USD",
  //   outputFile: "gas-report.txt",
  //   noColors: true,
  //   // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  // },
  // contractSizer: {
  //   runOnCompile: false,
  //   // only: ["Raffle"],
  // },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  zksolc: {
    // need to reference zksolc compiler
    version: "latest",
    settings: {
      libraries: {},
    },
  },
  mocha: {
    timeout: 300000, // 300 seconds max for running tests
  },
};
