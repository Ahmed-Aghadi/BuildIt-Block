// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    NetworkConfig public activeNetworkConfig;

    uint256 public constant ANVIL_CHAIN_ID = 31337;
    // uint256 public constant GOERLI_CHAIN_ID = 5;
    uint256 public constant POLYGON_ZKEVM_CARDONA_TESTNET_CHAIN_ID = 2442;
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant AVALANCHE_FUJI_CHAIN_ID = 43113;
    uint256 public constant METIS_SEPOLIA_CHAIN_ID = 59902;
    uint256 public constant SCROLL_SEPOLIA_CHAIN_ID = 534351;
    uint256 public constant ZKSYNC_SEPOLIA_CHAIN_ID = 300;
    uint256 public constant POLYGON_AMOY_CHAIN_ID = 80002;

    struct NetworkConfig {
        uint256 deployerPrivateKey;
        address routerAddress;
        address registryAddress;
        address registrarAddress;
        address eth_usd_priceFeedAddress;
        address linkAddress;
        uint32 gasLimit;
        bool isPolygonZkvemBridgeRequired;
        address polygonZkevmBridgeAddress;
    }

    uint256 public constant ANVIL_PRIVATE_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    constructor() {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address routerAddress = address(1);
        address registryAddress = 0x0000000000000000000000000000000000000000;
        address registrarAddress = 0x0000000000000000000000000000000000000000;
        address eth_usd_priceFeedAddress = 0x0000000000000000000000000000000000000000;
        address linkAddress = 0x0000000000000000000000000000000000000000;
        uint32 gasLimit = 999999;
        bool isPolygonZkvemBridgeRequired = false;
        address polygonZkevmBridgeAddress = address(0);
        if (block.chainid == AVALANCHE_FUJI_CHAIN_ID) {
            // Avalanche Fuji
            routerAddress = 0xF694E193200268f9a4868e4Aa017A0118C9a8177;
            registryAddress = 0x819B58A646CDd8289275A87653a2aA4902b14fe6;
            registrarAddress = 0xD23D3D1b81711D75E1012211f1b65Cc7dBB474e2;
            eth_usd_priceFeedAddress = 0x86d67c3D38D2bCeE722E601025C25a575021c6EA;
            linkAddress = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
        } else if (block.chainid == METIS_SEPOLIA_CHAIN_ID) {
            // Metis Sepolia
        } else if (block.chainid == SCROLL_SEPOLIA_CHAIN_ID) {
            // Scroll Sepolia
            eth_usd_priceFeedAddress = 0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41;
        } else if (block.chainid == ZKSYNC_SEPOLIA_CHAIN_ID) {
            // ZkSync Sepolia
            eth_usd_priceFeedAddress = 0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF;
        } else if (block.chainid == POLYGON_AMOY_CHAIN_ID) {
            // Polygon Amoy
            routerAddress = 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2;
            registryAddress = 0x93C0e201f7B158F503a1265B6942088975f92ce7;
            registrarAddress = 0x99083A4bb154B0a3EC7a0D1eb40370C892Db4225;
            eth_usd_priceFeedAddress = 0xF0d50568e3A7e8259E16663972b11910F89BD8e7;
            linkAddress = 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904;
        } else if (block.chainid == SEPOLIA_CHAIN_ID) {
            // Sepolia
            // routerAddress = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
            isPolygonZkvemBridgeRequired = true;
            polygonZkevmBridgeAddress = 0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582;
            registryAddress = 0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad; // 0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2;
            registrarAddress = 0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976; // 0x9a811502d843E5a03913d5A2cfb646c11463467A;
            eth_usd_priceFeedAddress = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
            linkAddress = 0x779877A7B0D9E8603169DdbD7836e478b4624789;

            // } else if (block.chainid == GOERLI_CHAIN_ID) {
            //     // goerli testnet
            //     isPolygonZkvemBridgeRequired = true;
            //     registryAddress = 0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2;
            //     registrarAddress = 0x57A4a13b35d25EE78e084168aBaC5ad360252467;
            //     linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
            //     polygonZkevmBridgeAddress = 0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7;
        } else if (block.chainid == POLYGON_ZKEVM_CARDONA_TESTNET_CHAIN_ID) {
            // polygon zkevm testnet
            isPolygonZkvemBridgeRequired = true;
            eth_usd_priceFeedAddress = 0xd94522a6feF7779f672f4C88eb672da9222f2eAc;
            polygonZkevmBridgeAddress = 0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582; // 0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7
        } else if (block.chainid == ANVIL_CHAIN_ID) {
            // Anvil
            deployerPrivateKey = ANVIL_PRIVATE_KEY;
        } else {
            revert("Unsupported chain");
        }
        activeNetworkConfig = NetworkConfig(
            deployerPrivateKey,
            routerAddress,
            registryAddress,
            registrarAddress,
            eth_usd_priceFeedAddress,
            linkAddress,
            gasLimit,
            isPolygonZkvemBridgeRequired,
            polygonZkevmBridgeAddress
        );
    }
}