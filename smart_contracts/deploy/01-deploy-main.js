"use strict";
// const { network } = require("hardhat");
// const hre = require("hardhat");
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zksync_ethers_1 = require("zksync-ethers");
const ethers = __importStar(require("ethers"));
const hardhat_zksync_deploy_1 = require("@matterlabs/hardhat-zksync-deploy");
// load env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY ||
    "0x0ecb5748eb667e7d67da8431e138022028188d1fa2edc4511509351121cfbb17";
if (!PRIVATE_KEY)
    throw "⛔️ Private key not detected! Add it to the .env file!";
function deployContract(deployer, artifactName, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const artifact = yield deployer.loadArtifact(artifactName);
        // Estimate contract deployment fee
        const deploymentFee = yield deployer.estimateDeployFee(artifact, args);
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
        const contract = yield deployer.deploy(artifact, args);
        // obtain the Constructor Arguments
        console.log("constructor args:" + contract.interface.encodeDeploy(args));
        // Show the contract info.
        const contractAddress = yield contract.getAddress();
        console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
        return contract;
    });
}
function log(message) {
    console.log(message);
}
module.exports = (hre) => __awaiter(void 0, void 0, void 0, function* () {
    // const { deploy, log } = deployments;
    // const { deployer } = await getNamedAccounts();
    // const chainId = network.config.chainId;
    // const accounts = await hre.ethers.getSigners();
    // const account = accounts[0];
    // Initialize the wallet.
    const wallet = new zksync_ethers_1.Wallet(PRIVATE_KEY);
    const chainId = yield hre.config.networks.hardhat.chainId;
    console.log("chainId:", chainId);
    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new hardhat_zksync_deploy_1.Deployer(hre, wallet);
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
    const forwarderAddress = "0xD2BC5F83A84bE02ec534ba961f991675a2841C3f";
    const utilsAddress = "0xf80ed627bc1F0162c046677AA8127678bba86a4c";
    const mapAddress = "0x60385361E2826f58BBA3BA1f75bb29eA04167F44";
    const faucetAddress = "0x09d5a454f0E6260A2fe486884C8090dE2930087A";
    const marketplaceAddress = "0xd63297BB2C64E9a5F8D17A9b851315Ac60A7a488";
    log("----------------------------------------------------");
    const forwarderArg = [];
    // const forwarder = await deploy("Forwarder", {
    //   from: deployer,
    //   args: forwarderArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    // const forwarder = await deployContract(deployer, "Forwarder", forwarderArg);
    // // const forwarder = {
    // //   address: "0x65D84C0883e0e0c9c41B044b4523cd07999924Fe",
    // // };
    // console.log("forwarder deployed to:", await forwarder.getAddress());
    log("----------------------------------------------------");
    const utilsArg = [
        utilsBaseUri,
        // await forwarder.getAddress(),
        forwarderAddress,
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
    // const utils = await deployContract(
    //   deployer,
    //   "src/UtilsCCIP.sol:Utils",
    //   utilsArg
    // );
    // // const utils = {
    // //   address: "0x4a4e6cc94507b6ad2c91ad765d3f5b566b15d895",
    // // };
    // console.log("utils deployed to:", await utils.getAddress());
    log("----------------------------------------------------");
    const mapArg = [
        size,
        perSize,
        mapBaseUri,
        // await utils.getAddress(),
        utilsAddress,
        // await forwarder.getAddress(),
        forwarderAddress,
    ];
    // const map = await deploy("Map", {
    //   from: deployer,
    //   args: mapArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    // const map = await deployContract(deployer, "Map", mapArg);
    // // const map = {
    // //   address: "0x91db12f3ea6f4598c982d46e8fdc72b53c333afb",
    // // };
    // console.log("map deployed to:", await map.getAddress());
    log("----------------------------------------------------");
    const faucetArg = [
        // await forwarder.getAddress()
        forwarderAddress,
    ];
    // const faucet = await deploy("Faucet", {
    //   from: deployer,
    //   args: faucetArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    // const faucet = await deployContract(deployer, "Faucet", faucetArg);
    // // const faucet = {
    // //   address: "0x724257edfe7f3bbf8c06a01ae3becb48dc5e220a",
    // // };
    // console.log("faucet deployed to:", await faucet.getAddress());
    log("----------------------------------------------------");
    const marketplaceArg = [
        eth_usd_priceFeedAddress,
        // await map.getAddress(),
        mapAddress,
        // await utils.getAddress(),
        utilsAddress,
        linkAddress,
        registrarAddress,
        gasLimit,
        // await forwarder.getAddress(),
        forwarderAddress,
    ];
    // const marketplace = await deploy("Marketplace", {
    //   from: deployer,
    //   args: marketplaceArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    // const marketplace = await deployContract(
    //   deployer,
    //   "Marketplace",
    //   marketplaceArg
    // );
    // // const marketplace = {
    // //   address: "0x20294525826458177030954af848d783f733a80a",
    // // };
    // console.log("marketplace deployed to:", await marketplace.getAddress());
    log("----------------------------------------------------");
    // console.log("Minting Utils...");
    // await mintUtils(
    //   utils,
    //   deployer,
    //   await utils.getAddress(),
    //   utilsMintCount,
    //   utilsMintAmount,
    //   "src/UtilsCCIP.sol:Utils"
    // );
    // log("----------------------------------------------------");
    // console.log("Transfering Utils to Faucet...");
    // await transferToFaucet(
    //   utils,
    //   deployer,
    //   await utils.getAddress(),
    //   await faucet.getAddress(),
    //   utilsMintCount,
    //   transferUtilsAmount,
    //   "src/UtilsCCIP.sol:Utils"
    // );
    // log("----------------------------------------------------");
    try {
        console.log("Verifying for Forwarder...");
        // await verify(await forwarder.getAddress(), forwarderArg, hre);
        yield verify(forwarderAddress, forwarderArg, hre);
        console.log("Verifying for Utils...");
        // await verify(await utils.getAddress(), utilsArg, hre);
        yield verify(utilsAddress, utilsArg, hre);
        console.log("Verifying for Map...");
        // await verify(await map.getAddress(), mapArg, hre);
        yield verify(mapAddress, mapArg, hre);
        console.log("Verifying for Faucet...");
        // await verify(await faucet.getAddress(), faucetArg, hre);
        yield verify(faucetAddress, faucetArg, hre);
        console.log("Verifying for Marketplace...");
        // await verify(await marketplace.getAddress(), marketplaceArg, hre);
        yield verify(marketplaceAddress, marketplaceArg, hre);
    }
    catch (error) {
        console.log(error);
    }
    log("----------------------------------------------------");
});
const verify = (contractAddress, args, hre) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Verifying contract...");
    try {
        yield hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log("verified");
    }
    catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!");
        }
        else {
            console.log(e);
        }
    }
});
const mintUtils = (utilsContract, account, utilsContractAddress, count, amount, utilsName) => __awaiter(void 0, void 0, void 0, function* () {
    // const utilsContract = await hre.ethers.getContractAt(
    //   utilsName,
    //   utilsContractAddress,
    //   account
    // );
    for (let i = 1; i <= count; i++) {
        const tx = yield utilsContract.mint(amount);
        console.log("Minted Utils " + i + " TX:", tx.hash);
        const receipt = yield tx.wait();
        console.log("Minted Utils " + i + " RECEIPT:", receipt.transactionHash);
        // wait for 10 second as in fantom testnet, it throws error (even at 3 seconds):
        // Error: nonce has already been used [ See: https://links.ethers.org/v5-errors-NONCE_EXPIRED ]
        yield new Promise((r) => setTimeout(r, 10000));
    }
});
const transferToFaucet = (utilsContract, account, utilsContractAddress, faucetContractAddress, count, amount, utilsName) => __awaiter(void 0, void 0, void 0, function* () {
    // const utilsContract = await hre.ethers.getContractAt(
    //   utilsName,
    //   utilsContractAddress,
    //   account
    // );
    for (let i = 1; i <= count; i++) {
        const tx = yield utilsContract.safeTransferFrom(account.ethWallet.address, faucetContractAddress, i, amount, "0x"
        // { gasPrice: 1600000008 }
        );
        console.log("Transfered Utils " + i + " TX:", tx.hash);
        const receipt = yield tx.wait();
        console.log("Transfered Utils " + i + " RECEIPT:", receipt.transactionHash);
        // wait for 10 second as in fantom testnet, it throws error:
        // Error: nonce has already been used [ See: https://links.ethers.org/v5-errors-NONCE_EXPIRED ]
        yield new Promise((r) => setTimeout(r, 10000));
    }
});
module.exports.tags = ["all", "main"];
//# sourceMappingURL=01-deploy-main.js.map