// const { network } = require("hardhat");
// const hre = require("hardhat");

import { Wallet, utils } from "zksync-ethers";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

async function deployContract(
  deployer: Deployer,
  artifactName: string,
  args: any[]
) {
  const artifact = await deployer.loadArtifact(artifactName);

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact, args);

  // ⚠️ OPTIONAL: You can skip this block if your account already has funds in L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similar to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.formatEther(deploymentFee);
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const contract = await deployer.deploy(artifact, args);

  // obtain the Constructor Arguments
  console.log("constructor args:" + contract.interface.encodeDeploy(args));

  // Show the contract info.
  const contractAddress = await contract.getAddress();
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  return contract;
}

function log(message: string) {
  console.log(message);
}

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  // const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  // const chainId = network.config.chainId;
  // const accounts = await hre.ethers.getSigners();
  // const account = accounts[0];

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);
  const chainId = await hre.config.networks.hardhat.chainId;
  console.log("chainId:", chainId);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);

  const waitBlockConfirmations = 6;
  const utilsBaseUri = "https://www.example.com/utils/";
  const mapBaseUri = "https://www.example.com/map/";
  const size = 15;
  const perSize = 5;

  const utilsMintCount = 3;
  const utilsMintAmount = 1000;
  const transferUtilsAmount = 500;

  // marketplace can only be deployed on goerli or sepolia testnet. As price feed is not available on other testnets
  let registryAddress = "0x0000000000000000000000000000000000000000";
  let registrarAddress = "0x0000000000000000000000000000000000000000";
  let eth_usd_priceFeedAddress = "0x0000000000000000000000000000000000000000";
  let linkAddress = "0x0000000000000000000000000000000000000000";
  let gasLimit = 999999;
  let routerAddress = "0x0000000000000000000000000000000000000001";
  // if (chainId == 300) {
  //   // ZkSync Sepolia
  //   eth_usd_priceFeedAddress = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF";
  // } else {
  //   throw new Error(
  //     "Only ZkSync Sepolia is to be deployed using hardhat else use forge"
  //   );
  // }

  eth_usd_priceFeedAddress = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF";

  log("----------------------------------------------------");
  const forwarderArg: any[] = [];
  // const forwarder = await deploy("Forwarder", {
  //   from: deployer,
  //   args: forwarderArg,
  //   log: true,
  //   waitConfirmations: waitBlockConfirmations,
  // });
  const forwarder = await deployContract(deployer, "Forwarder", forwarderArg);
  // const forwarder = {
  //   address: "0x65D84C0883e0e0c9c41B044b4523cd07999924Fe",
  // };
  console.log("forwarder deployed to:", await forwarder.getAddress());
  log("----------------------------------------------------");
  const utilsArg = [
    utilsBaseUri,
    await forwarder.getAddress(),
    linkAddress,
    routerAddress,
  ];
  // const utils = await deploy(
  //   isPolygonZkvemBridgeRequired ? "UtilsLxLy.sol" : "UtilsCCIP.sol",
  //   {
  //     from: deployer,
  //     contract: "src/UtilsCCIP.sol:Utils",
  //     args: utilsArg,
  //     log: true,
  //     waitConfirmations: waitBlockConfirmations,
  //   }
  // );
  const utils = await deployContract(
    deployer,
    "src/UtilsCCIP.sol:Utils",
    utilsArg
  );
  // const utils = {
  //   address: "0x4a4e6cc94507b6ad2c91ad765d3f5b566b15d895",
  // };
  console.log("utils deployed to:", await utils.getAddress());
  log("----------------------------------------------------");
  const mapArg = [
    size,
    perSize,
    mapBaseUri,
    await utils.getAddress(),
    await forwarder.getAddress(),
  ];
  // const map = await deploy("Map", {
  //   from: deployer,
  //   args: mapArg,
  //   log: true,
  //   waitConfirmations: waitBlockConfirmations,
  // });
  const map = await deployContract(deployer, "Map", mapArg);
  // const map = {
  //   address: "0x91db12f3ea6f4598c982d46e8fdc72b53c333afb",
  // };
  console.log("map deployed to:", await map.getAddress());
  log("----------------------------------------------------");
  const faucetArg = [await forwarder.getAddress()];
  // const faucet = await deploy("Faucet", {
  //   from: deployer,
  //   args: faucetArg,
  //   log: true,
  //   waitConfirmations: waitBlockConfirmations,
  // });
  const faucet = await deployContract(deployer, "Faucet", faucetArg);
  // const faucet = {
  //   address: "0x724257edfe7f3bbf8c06a01ae3becb48dc5e220a",
  // };
  console.log("faucet deployed to:", await faucet.getAddress());
  log("----------------------------------------------------");
  const marketplaceArg = [
    eth_usd_priceFeedAddress,
    await map.getAddress(),
    await utils.getAddress(),
    linkAddress,
    registrarAddress,
    gasLimit,
    await forwarder.getAddress(),
  ];
  // const marketplace = await deploy("Marketplace", {
  //   from: deployer,
  //   args: marketplaceArg,
  //   log: true,
  //   waitConfirmations: waitBlockConfirmations,
  // });
  const marketplace = await deployContract(
    deployer,
    "Marketplace",
    marketplaceArg
  );
  // const marketplace = {
  //   address: "0x20294525826458177030954af848d783f733a80a",
  // };
  console.log("marketplace deployed to:", await marketplace.getAddress());
  log("----------------------------------------------------");
  console.log("Minting Utils...");
  await mintUtils(
    utils,
    deployer,
    await utils.getAddress(),
    utilsMintCount,
    utilsMintAmount,
    "src/UtilsCCIP.sol:Utils"
  );
  log("----------------------------------------------------");
  console.log("Transfering Utils to Faucet...");
  await transferToFaucet(
    utils,
    deployer,
    await utils.getAddress(),
    await faucet.getAddress(),
    utilsMintCount,
    transferUtilsAmount,
    "src/UtilsCCIP.sol:Utils"
  );
  log("----------------------------------------------------");
  try {
    console.log("Verifying for Forwarder...");
    await verify(await forwarder.getAddress(), forwarderArg, hre);
    console.log("Verifying for Utils...");
    await verify(await utils.getAddress(), utilsArg, hre);
    console.log("Verifying for Map...");
    await verify(await map.getAddress(), mapArg, hre);
    console.log("Verifying for Faucet...");
    await verify(await faucet.getAddress(), faucetArg, hre);
    console.log("Verifying for Marketplace...");
    await verify(await marketplace.getAddress(), marketplaceArg, hre);
  } catch (error) {
    console.log(error);
  }
  log("----------------------------------------------------");
};

const verify = async (
  contractAddress: string,
  args: any[],
  hre: HardhatRuntimeEnvironment
) => {
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("verified");
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

const mintUtils = async (
  utilsContract: ethers.ethers.Contract,
  account: Deployer,
  utilsContractAddress: string,
  count: number,
  amount: number,
  utilsName: string
) => {
  // const utilsContract = await hre.ethers.getContractAt(
  //   utilsName,
  //   utilsContractAddress,
  //   account
  // );
  for (let i = 1; i <= count; i++) {
    const tx = await utilsContract.mint(amount);
    console.log("Minted Utils " + i + " TX:", tx.hash);
    const receipt = await tx.wait();
    console.log("Minted Utils " + i + " RECEIPT:", receipt.transactionHash);

    // wait for 10 second as in fantom testnet, it throws error (even at 3 seconds):
    // Error: nonce has already been used [ See: https://links.ethers.org/v5-errors-NONCE_EXPIRED ]
    await new Promise((r) => setTimeout(r, 10000));
  }
};

const transferToFaucet = async (
  utilsContract: ethers.ethers.Contract,
  account: Deployer,
  utilsContractAddress: string,
  faucetContractAddress: string,
  count: number,
  amount: number,
  utilsName: string
) => {
  // const utilsContract = await hre.ethers.getContractAt(
  //   utilsName,
  //   utilsContractAddress,
  //   account
  // );
  for (let i = 1; i <= count; i++) {
    const tx = await utilsContract.safeTransferFrom(
      account.ethWallet.address,
      faucetContractAddress,
      i,
      amount,
      "0x"
      // { gasPrice: 1600000008 }
    );
    console.log("Transfered Utils " + i + " TX:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transfered Utils " + i + " RECEIPT:", receipt.transactionHash);

    // wait for 10 second as in fantom testnet, it throws error:
    // Error: nonce has already been used [ See: https://links.ethers.org/v5-errors-NONCE_EXPIRED ]
    await new Promise((r) => setTimeout(r, 10000));
  }
};

module.exports.tags = ["all", "main"];
