// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import "../src/Map.sol";
import {Utils as UtilsCCIP} from "../src/UtilsCCIP.sol";
import {Utils as UtilsLxLy} from "../src/UtilsLxLy.sol";
import "../src/Marketplace.sol";
import "../src/Forwarder.sol";
import "../src/Faucet.sol";
import "../src/polygonZKEVMContracts/interfaces/IPolygonZkEVMBridge.sol";

contract DeployAll is Script {
    string public constant UTILS_BASE_URI = "https://www.example.com/utils/";
    string public constant MAP_BASE_URI = "https://www.example.com/map/";
    uint8 public constant SIZE = 15;
    uint8 public constant PER_SIZE = 5;
    uint8 public constant UTILS_MINT_COUNT = 3;
    uint256 public constant UTILS_MINT_AMOUNT = 1000;
    uint256 public constant TRANSFER_UTILS_AMOUNT = 500;

    HelperConfig public helperConfig;

    function run()
        external
        returns (address, address, address, address, address)
    {
        helperConfig = new HelperConfig();

        // (
        //     address routerAddress,
        //     address registryAddress,
        //     address registrarAddress,
        //     address eth_usd_priceFeedAddress,
        //     address linkAddress,
        //     uint32 gasLimit
        // ) = helperConfig.activeNetworkConfig();

        (
            address forwarder,
            address map,
            address utils,
            address marketplace,
            address faucet
        ) = deployAllContracts();
        mintUtils(utils);
        fundFaucet(utils, faucet);
        return (forwarder, map, utils, marketplace, faucet);
    }

    function deployAllContracts()
        public
        returns (address, address, address, address, address)
    {
        // deploy all contracts
        address forwarder = deployForwarder();
        address utils = deployUtils(forwarder);
        address map = deployMap(utils, forwarder);
        address marketplace = deployMarketplace(map, utils, forwarder);
        address faucet = deployFaucet(forwarder);

        return (forwarder, map, utils, marketplace, faucet);
    }

    function deployForwarder() public returns (address) {
        (uint256 deployerPrivateKey, , , , , , , , ) = helperConfig
            .activeNetworkConfig();
        vm.startBroadcast(deployerPrivateKey);
        Forwarder forwarder = new Forwarder();
        vm.stopBroadcast();
        return address(forwarder);
    }

    function deployUtils(address forwarder) public returns (address) {
        (
            uint256 deployerPrivateKey,
            address routerAddress,
            ,
            ,
            ,
            address linkAddress,
            ,
            bool isPolygonZkvemBridgeRequired,
            address polygonZkevmBridgeAddress
        ) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerPrivateKey);
        address utils;
        if (isPolygonZkvemBridgeRequired) {
            UtilsLxLy utilsLxLy = new UtilsLxLy(
                UTILS_BASE_URI,
                address(forwarder),
                IPolygonZkEVMBridge(polygonZkevmBridgeAddress)
            );
            utils = address(utilsLxLy);
        } else {
            UtilsCCIP utilsCCIP = new UtilsCCIP(
                UTILS_BASE_URI,
                forwarder,
                linkAddress,
                routerAddress
            );
            utils = address(utilsCCIP);
        }
        vm.stopBroadcast();
        return utils;
    }

    function deployMap(
        address utils,
        address forwarder
    ) public returns (address) {
        (uint256 deployerPrivateKey, , , , , , , , ) = helperConfig
            .activeNetworkConfig();
        vm.startBroadcast(deployerPrivateKey);
        Map map = new Map(SIZE, PER_SIZE, MAP_BASE_URI, utils, forwarder);
        vm.stopBroadcast();
        return address(map);
    }

    function deployMarketplace(
        address map,
        address utils,
        address forwarder
    ) public returns (address) {
        (
            uint256 deployerPrivateKey,
            ,
            ,
            address registrarAddress,
            address eth_usd_priceFeedAddress,
            address linkAddress,
            uint32 gasLimit,
            ,

        ) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerPrivateKey);
        Marketplace marketplace = new Marketplace(
            eth_usd_priceFeedAddress,
            map,
            utils,
            linkAddress,
            registrarAddress,
            gasLimit,
            forwarder
        );
        vm.stopBroadcast();
        return address(marketplace);
    }

    function deployFaucet(address forwarder) public returns (address) {
        (uint256 deployerPrivateKey, , , , , , , , ) = helperConfig
            .activeNetworkConfig();
        vm.startBroadcast(deployerPrivateKey);
        Faucet faucet = new Faucet(forwarder);
        vm.stopBroadcast();
        return address(faucet);
    }

    function mintUtils(address utils) public {
        (
            uint256 deployerPrivateKey,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isPolygonZkvemBridgeRequired,

        ) = helperConfig.activeNetworkConfig();
        for (uint8 i = 1; i <= UTILS_MINT_COUNT; i++) {
            vm.startBroadcast(deployerPrivateKey);
            if (isPolygonZkvemBridgeRequired) {
                UtilsLxLy(utils).mint(UTILS_MINT_AMOUNT);
            } else {
                UtilsCCIP(utils).mint(UTILS_MINT_AMOUNT);
            }
            vm.stopBroadcast();
        }
    }

    function fundFaucet(address utils, address faucet) public {
        (
            uint256 deployerPrivateKey,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isPolygonZkvemBridgeRequired,

        ) = helperConfig.activeNetworkConfig();
        address deployerAddress = vm.addr(deployerPrivateKey);
        for (uint8 i = 1; i <= UTILS_MINT_COUNT; i++) {
            vm.startBroadcast(deployerPrivateKey);
            if (isPolygonZkvemBridgeRequired) {
                UtilsLxLy(utils).safeTransferFrom(
                    deployerAddress,
                    faucet,
                    i,
                    TRANSFER_UTILS_AMOUNT,
                    ""
                );
            } else {
                UtilsCCIP(utils).safeTransferFrom(
                    deployerAddress,
                    faucet,
                    i,
                    TRANSFER_UTILS_AMOUNT,
                    ""
                );
            }
            vm.stopBroadcast();
        }
    }
}
