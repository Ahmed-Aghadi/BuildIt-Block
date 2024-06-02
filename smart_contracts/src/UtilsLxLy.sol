// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC1155} from "openzeppelin/token/ERC1155/ERC1155.sol";
import "solmate/utils/LibString.sol";
import "openzeppelin/access/Ownable.sol";
import "openzeppelin/metatx/ERC2771Context.sol";
import "./polygonZKEVMContracts/interfaces/IBridgeMessageReceiver.sol";
import "./polygonZKEVMContracts/interfaces/IPolygonZkEVMBridge.sol";

contract Utils is ERC2771Context, ERC1155, Ownable, IBridgeMessageReceiver {
    error InvalidChain();
    error InsufficientBalance();
    error NotPolygonZkEVMBridge();
    string public baseUri;
    uint256 public utilCount;

    // Global Exit Root address
    IPolygonZkEVMBridge public immutable polygonZkEVMBridge;

    // Current network identifier
    // uint32 public immutable networkID;

    mapping(uint32 => address) public chains;

    constructor(
        string memory _baseUri,
        address trustedForwarder,
        IPolygonZkEVMBridge _polygonZkEVMBridge
    ) Ownable(msg.sender) ERC2771Context(trustedForwarder) ERC1155(_baseUri) {
        baseUri = _baseUri;
        polygonZkEVMBridge = _polygonZkEVMBridge;
        // networkID = polygonZkEVMBridge.networkID();
    }

    function setChain(uint32 chain, address addr) public onlyOwner {
        chains[chain] = addr;
    }

    function crossChainTransfer(
        uint32 destinationChain,
        uint tokenId,
        uint amount,
        bool forceUpdateGlobalExitRoot
    ) public payable {
        address destinationAddress = chains[destinationChain];
        if (destinationAddress == address(0)) {
            revert InvalidChain();
        }
        if (amount > balanceOf(_msgSender(), tokenId)) {
            revert InsufficientBalance();
        }
        _burn(_msgSender(), tokenId, amount);
        bytes memory payload = abi.encode(tokenId, amount, _msgSender());
        // Bridge ping message
        polygonZkEVMBridge.bridgeMessage(
            destinationChain,
            destinationAddress,
            forceUpdateGlobalExitRoot,
            payload
        );
    }

    function onMessageReceived(
        address sourceAddress,
        uint32 sourceChain,
        bytes calldata payload
    ) external payable override {
        // Can only be called by the bridge
        if (_msgSender() != address(polygonZkEVMBridge)) {
            revert NotPolygonZkEVMBridge();
        }
        if (
            keccak256(abi.encodePacked(chains[sourceChain])) !=
            keccak256(abi.encodePacked(sourceAddress))
        ) {
            revert InvalidChain();
        }
        (uint tokenId, uint amount, address sender) = abi.decode(
            payload,
            (uint, uint, address)
        );
        _mint(sender, tokenId, amount, "");
    }

    function mintMore(uint id, uint amount) public onlyOwner {
        _mint(_msgSender(), id, amount, "");
    }

    function mint(uint256 amount) public onlyOwner {
        utilCount += 1;
        _mint(_msgSender(), utilCount, amount, "");
    }

    function uri(
        uint256 id
    ) public view virtual override returns (string memory) {
        return string(abi.encodePacked(baseUri, LibString.toString(id)));
    }

    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (uint256)
    {
        return 20;
    }
}
