// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC1155TokenReceiver} from "solmate/tokens/ERC1155.sol";
import "openzeppelin/token/ERC1155/IERC1155.sol";
import {ERC721TokenReceiver} from "solmate/tokens/ERC721.sol";
import "openzeppelin/token/ERC721/IERC721.sol";
import "solmate/utils/LibString.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "openzeppelin/metatx/ERC2771Context.sol";

interface KeeperRegistrarInterface {
    function register(
        string memory name,
        bytes calldata encryptedEmail,
        address upkeepContract,
        uint32 gasLimit,
        address adminAddress,
        bytes calldata checkData,
        uint96 amount,
        uint8 source,
        address sender
    ) external;
}

struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    uint8 triggerType;
    bytes checkData;
    bytes triggerConfig;
    bytes offchainConfig;
    uint96 amount;
}

interface AutomationRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

contract Marketplace is ERC2771Context {
    error USDNotSupported();
    error AuctioNotSupported();
    error InvalidTokenId();
    error InvalidListingId();
    error InvalidListing();
    error ValidListing();
    error InvalidPrice();
    error NotTokenOwner();
    error NotListingOwner();
    error NotEnoughFunds();
    error NotAuction();
    error NoBids();
    error BidNotHighEnough();
    error AuctionNotOver();
    error AuctionOver();
    error USDNotSupportedForAuction();
    error AuctionCantBeBought();
    error NotHighestBidder();
    struct Listing {
        address seller;
        bool inUSD;
        uint256 tokenId;
        uint256 price;
        uint256 timestamp;
        bool isValid;
        bool isAuction;
        uint256 aucionTime;
    }
    struct Bid {
        address bidder;
        uint256 amount;
    }
    AggregatorV3Interface public immutable eth_usd_priceFeed;
    IERC721 internal map;
    IERC1155 internal utils;
    uint public listingCount = 0;

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public balances;
    mapping(uint256 => Bid) public highestBid;
    mapping(address => uint256) public auctionBalance;
    mapping(uint256 => uint256) public listingToUpkeepID;

    LinkTokenInterface public immutable i_link;
    AutomationRegistrarInterface public immutable i_registrar;

    uint32 public gasLimit;

    constructor(
        address eth_usd_priceFeedAddress,
        address mapAddress,
        address utilsAddress,
        address _linkAddress,
        address _registrar,
        uint32 _gasLimit,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        eth_usd_priceFeed = AggregatorV3Interface(eth_usd_priceFeedAddress);
        map = IERC721(mapAddress);
        utils = IERC1155(utilsAddress);
        i_link = LinkTokenInterface(_linkAddress);
        i_registrar = AutomationRegistrarInterface(_registrar);
        gasLimit = _gasLimit;
    }

    function registerAndPredictID(uint256 listingId, uint96 amount) private {
        i_link.transferFrom(_msgSender(), address(this), amount);

        // LINK must be approved for transfer - this can be done every time or once
        // with an infinite approval
        i_link.approve(address(i_registrar), amount);

        bytes memory checkData = abi.encodePacked(listingId);
        RegistrationParams memory params = RegistrationParams(
            LibString.toString(listingId),
            "0x",
            address(this),
            gasLimit,
            address(_msgSender()),
            0,
            checkData,
            "0x",
            "0x",
            amount
        );
        uint256 upkeepID = i_registrar.registerUpkeep(params);
        if (upkeepID != 0) {
            // DEV - Use the upkeepID however you see fit
            listingToUpkeepID[listingId] = upkeepID;
        } else {
            revert("auto-approve disabled");
        }
    }

    function checkUpkeep(
        bytes calldata checkData
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 listingId = abi.decode(checkData, (uint256));

        upkeepNeeded =
            (block.timestamp >
                listings[listingId].timestamp +
                    listings[listingId].aucionTime) &&
            highestBid[listingId].bidder != address(0) &&
            (listings[listingId].isValid || highestBid[listingId].amount > 0);
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external {
        uint256 listingId = abi.decode(performData, (uint256));

        calculateWinner(listingId);
    }

    /*
     * @dev If isAuction is true, the price is the minimum bid
     * @dev auctionTime is the time in seconds for which the auction will run, so timestamp + auctionTime is the end time
     * @dev If isAuction is false, the price is the fixed price and auctionTime is ignored
     * @dev For auction, isUSD should be false
     * @dev if isAuction is true, the amount is the amount of LINK to be transferred to the upkeep contract else it is ignored
     */
    function createListing(
        bool inUSD,
        uint256 tokenId,
        uint256 price,
        bool isAuction,
        uint256 auctionTime,
        uint96 amount
    ) public {
        if (price <= 0) revert InvalidPrice();
        if (tokenId <= 0) revert InvalidTokenId();
        if (map.ownerOf(tokenId) != _msgSender()) revert NotTokenOwner();
        if (isAuction && inUSD) revert USDNotSupportedForAuction();
        if (inUSD && address(eth_usd_priceFeed) == address(0))
            revert USDNotSupported();
        if (isAuction && address(i_link) == address(0))
            revert AuctioNotSupported();
        listingCount++;
        listings[listingCount] = Listing(
            _msgSender(),
            inUSD,
            tokenId,
            price,
            block.timestamp,
            true,
            isAuction,
            auctionTime
        );
        if (isAuction) {
            registerAndPredictID(listingCount, amount);
        }
    }

    function deleteListing(uint listingId) public {
        if (isListingValid(listingId) == false) revert InvalidListing();
        if (map.ownerOf(listings[listingId].tokenId) != _msgSender())
            revert NotListingOwner();
        listings[listingId].isValid = false;
    }

    function buyListing(uint listingId) public payable {
        if (isListingValid(listingId) == false) revert InvalidListing();
        if (listings[listingId].isAuction) revert AuctionCantBeBought();
        uint price = getPrice(listingId);
        if (msg.value < price) revert NotEnoughFunds();
        uint excess = msg.value - price;
        if (excess > 0) {
            balances[_msgSender()] += excess;
        }
        balances[listings[listingId].seller] += price;
        map.safeTransferFrom(
            listings[listingId].seller,
            _msgSender(),
            listings[listingId].tokenId
        );
        listings[listingId].isValid = false;
    }

    function bid(uint listingId) public payable {
        if (listings[listingId].isValid == false) revert InvalidListing();
        if (listings[listingId].isAuction == false) revert NotAuction();
        if (msg.value < listings[listingId].price) revert BidNotHighEnough();
        if (msg.value <= highestBid[listingId].amount)
            revert BidNotHighEnough();
        if (highestBid[listingId].amount > 0) {
            balances[highestBid[listingId].bidder] += highestBid[listingId]
                .amount;
            auctionBalance[highestBid[listingId].bidder] -= highestBid[
                listingId
            ].amount;
        }
        auctionBalance[_msgSender()] += msg.value;
        highestBid[listingId] = Bid(_msgSender(), msg.value);
    }

    /*
     * @dev If the auction is over and the seller is approved for all, the highest bidder will get the token
     * @dev If the auction is over and the seller is not approved for all, the highest bidder can withdraw the funds
     * @dev If the auction is over and the seller have deleted the listing, the highest bidder can withdraw the funds
     */
    function calculateWinner(uint listingId) public {
        if (listings[listingId].isAuction == false) revert NotAuction();
        if (
            block.timestamp <=
            listings[listingId].timestamp + listings[listingId].aucionTime
        ) revert AuctionNotOver();
        if (highestBid[listingId].bidder == address(0)) revert NoBids();
        if (listings[listingId].isValid == false) {
            if (highestBid[listingId].amount > 0) {
                _invalidateAuctionBid(listingId);
            } else {
                revert InvalidListing();
            }
        }

        if (highestBid[listingId].amount <= 0) {
            listings[listingId].isValid = false;
            return;
        }
        if (
            map.isApprovedForAll(listings[listingId].seller, address(this)) ==
            false
        ) {
            _invalidateAuctionBid(listingId);
            listings[listingId].isValid = false;
        } else {
            if (listings[listingId].isValid == false) revert InvalidListing();
            balances[listings[listingId].seller] += highestBid[listingId]
                .amount;
            // not safe transfer from because calculate winner will be called by automation and it shouldn't revert
            map.transferFrom(
                listings[listingId].seller,
                highestBid[listingId].bidder,
                listings[listingId].tokenId
            );
            listings[listingId].isValid = false;
        }
    }

    /*
     * @dev If the auction is over but the seller is not approved for all or seller have deleted the listing, the highest bidder can withdraw the funds
     * @dev If the auction is not over but seller have deleted the listing, the highest bidder can withdraw the funds
     */
    function invalidateAuctionBid(uint listingId) public {
        if (listings[listingId].isAuction == false) revert NotAuction();
        if (
            block.timestamp <=
            listings[listingId].timestamp + listings[listingId].aucionTime
        ) {
            if (listings[listingId].isValid) {
                revert ValidListing();
            } else {
                revert AuctionNotOver();
            }
        } else {
            if (
                map.isApprovedForAll(listings[listingId].seller, address(this))
            ) {
                if (listings[listingId].isValid) {
                    revert ValidListing();
                }
            }
        }
        if (highestBid[listingId].amount <= 0) revert NotEnoughFunds();
        _invalidateAuctionBid(listingId);
    }

    function _invalidateAuctionBid(uint listingId) private {
        auctionBalance[highestBid[listingId].bidder] -= highestBid[listingId]
            .amount;
        balances[highestBid[listingId].bidder] += highestBid[listingId].amount;
        highestBid[listingId].amount = 0;
    }

    function withdraw() public {
        uint amount = balances[_msgSender()];
        if (amount <= 0) revert NotEnoughFunds();
        balances[_msgSender()] = 0;
        payable(_msgSender()).transfer(amount);
    }

    /*
     * @dev Returns the price of a listing in ETH
     */
    function getPrice(uint listingId) public view returns (uint256) {
        if (listingId <= 0 || listingId > listingCount)
            revert InvalidListingId();
        if (listings[listingId].inUSD) {
            uint decimals = eth_usd_priceFeed.decimals();
            (
                ,
                /* uint80 roundID */ int answer /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
                ,
                ,

            ) = eth_usd_priceFeed.latestRoundData();
            uint256 priceInEth = (listings[listingId].price *
                10 ** (decimals)) / uint(answer);
            return priceInEth;
        } else {
            return listings[listingId].price;
        }
    }

    function isListingValid(uint listingId) public view returns (bool) {
        if (listingId <= 0 || listingId > listingCount)
            revert InvalidListingId();
        if (
            map.ownerOf(listings[listingId].tokenId) !=
            listings[listingId].seller
        ) {
            return false;
        }
        return listings[listingId].isValid;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155BatchReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external virtual returns (bytes4) {
        return ERC721TokenReceiver.onERC721Received.selector;
    }
}
