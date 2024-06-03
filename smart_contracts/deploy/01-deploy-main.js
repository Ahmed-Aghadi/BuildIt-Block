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
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
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
    log("----------------------------------------------------");
    const forwarderArg = [];
    // const forwarder = await deploy("Forwarder", {
    //   from: deployer,
    //   args: forwarderArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    const forwarder = yield deployContract(deployer, "Forwarder", forwarderArg);
    // const forwarder = {
    //   address: "0x65D84C0883e0e0c9c41B044b4523cd07999924Fe",
    // };
    console.log("forwarder deployed to:", yield forwarder.getAddress());
    log("----------------------------------------------------");
    const utilsArg = [
        utilsBaseUri,
        yield forwarder.getAddress(),
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
    const utils = yield deployContract(deployer, "src/UtilsCCIP.sol:Utils", utilsArg);
    // const utils = {
    //   address: "0x4a4e6cc94507b6ad2c91ad765d3f5b566b15d895",
    // };
    console.log("utils deployed to:", yield utils.getAddress());
    log("----------------------------------------------------");
    const mapArg = [
        size,
        perSize,
        mapBaseUri,
        yield utils.getAddress(),
        yield forwarder.getAddress(),
    ];
    // const map = await deploy("Map", {
    //   from: deployer,
    //   args: mapArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    const map = yield deployContract(deployer, "Map", mapArg);
    // const map = {
    //   address: "0x91db12f3ea6f4598c982d46e8fdc72b53c333afb",
    // };
    console.log("map deployed to:", yield map.getAddress());
    log("----------------------------------------------------");
    const faucetArg = [yield forwarder.getAddress()];
    // const faucet = await deploy("Faucet", {
    //   from: deployer,
    //   args: faucetArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    const faucet = yield deployContract(deployer, "Faucet", faucetArg);
    // const faucet = {
    //   address: "0x724257edfe7f3bbf8c06a01ae3becb48dc5e220a",
    // };
    console.log("faucet deployed to:", yield faucet.getAddress());
    log("----------------------------------------------------");
    const marketplaceArg = [
        eth_usd_priceFeedAddress,
        yield map.getAddress(),
        yield utils.getAddress(),
        linkAddress,
        registrarAddress,
        gasLimit,
        yield forwarder.getAddress(),
    ];
    // const marketplace = await deploy("Marketplace", {
    //   from: deployer,
    //   args: marketplaceArg,
    //   log: true,
    //   waitConfirmations: waitBlockConfirmations,
    // });
    const marketplace = yield deployContract(deployer, "Marketplace", marketplaceArg);
    // const marketplace = {
    //   address: "0x20294525826458177030954af848d783f733a80a",
    // };
    console.log("marketplace deployed to:", yield marketplace.getAddress());
    log("----------------------------------------------------");
    console.log("Minting Utils...");
    yield mintUtils(utils, deployer, yield utils.getAddress(), utilsMintCount, utilsMintAmount, "src/UtilsCCIP.sol:Utils");
    log("----------------------------------------------------");
    console.log("Transfering Utils to Faucet...");
    yield transferToFaucet(utils, deployer, yield utils.getAddress(), yield faucet.getAddress(), utilsMintCount, transferUtilsAmount, "src/UtilsCCIP.sol:Utils");
    log("----------------------------------------------------");
    try {
        console.log("Verifying for Forwarder...");
        yield verify(yield forwarder.getAddress(), forwarderArg, hre);
        console.log("Verifying for Utils...");
        yield verify(yield utils.getAddress(), utilsArg, hre);
        console.log("Verifying for Map...");
        yield verify(yield map.getAddress(), mapArg, hre);
        console.log("Verifying for Faucet...");
        yield verify(yield faucet.getAddress(), faucetArg, hre);
        console.log("Verifying for Marketplace...");
        yield verify(yield marketplace.getAddress(), marketplaceArg, hre);
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