const fs = require("fs");
const path = require("path");

const FRONTEND_CONTRACT_ADDRESS_DIR = "../frontend/utils/";

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// NOTE: maybe we should use this in HelperConfig.s.sol so that we have a single source of truth
const EXTRA_ADDRESSES = {
  43113: {
    LinkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  },
  11155111: {
    LinkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  },
  80002: {
    LinkToken: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
  },
  300: {
    Forwarder: "0xD2BC5F83A84bE02ec534ba961f991675a2841C3f",
    Utils: "0xf80ed627bc1F0162c046677AA8127678bba86a4c",
    Map: "0x60385361E2826f58BBA3BA1f75bb29eA04167F44",
    Faucet: "0x09d5a454f0E6260A2fe486884C8090dE2930087A",
    Marketplace: "0xd63297BB2C64E9a5F8D17A9b851315Ac60A7a488",
  },
  59902: {
    Forwarder: "0x76cfdE04F691B93c9993Be24d5FE7667E7A8782C",
    Utils: "0x489d47E592639Ba11107E84dd6CCA08F0892E27d",
    Map: "0x06CE5B276a53e072dc3144D3746e57fD2CA6a1B4",
    Marketplace: "0xE2c149c4cb26F137e7eab87E7675bE71E53d7071",
    Faucet: "0x0247F66d1a3029FB43A02481c7a2E03CD158adA7",
  },
};

async function main() {
  const broadcastFiles = fs.readdirSync("./broadcast/DeployAll.s.sol");
  const addresses = {};
  for (const chainId of broadcastFiles) {
    const runJsonFile = fs.readFileSync(
      "./broadcast/DeployAll.s.sol/" + chainId + "/run-latest.json",
      "utf-8"
    );
    const runFile = JSON.parse(runJsonFile);
    const currentAddresses = {};
    for (const transaction of runFile.transactions) {
      if (transaction.transactionType === "CREATE") {
        currentAddresses[transaction.contractName ?? "Utils"] =
          transaction.contractAddress;
      }
    }
    addresses[chainId] = currentAddresses;
    addresses[chainId] = {
      ...addresses[chainId],
      ...EXTRA_ADDRESSES[chainId],
    };
  }
  console.log(addresses);
  const addressFile = path.join(
    FRONTEND_CONTRACT_ADDRESS_DIR,
    "contract-address.json"
  );
  console.log(addressFile);

  ensureDirectoryExistence(addressFile);

  fs.writeFileSync(addressFile, JSON.stringify(addresses, null, 2));
}

main();
