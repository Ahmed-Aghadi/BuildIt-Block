/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Marketplace, MarketplaceInterface } from "../Marketplace";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "eth_usd_priceFeedAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "mapAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "utilsAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_linkAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_registrar",
        type: "address",
        internalType: "address",
      },
      {
        name: "_gasLimit",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "trustedForwarder",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "auctionBalance",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balances",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bid",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "buyListing",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "calculateWinner",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkUpkeep",
    inputs: [
      {
        name: "checkData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "upkeepNeeded",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "performData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createListing",
    inputs: [
      {
        name: "inUSD",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "price",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isAuction",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "auctionTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deleteListing",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "eth_usd_priceFeed",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AggregatorV3Interface",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "gasLimit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPrice",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "highestBid",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "bidder",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_link",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract LinkTokenInterface",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_registrar",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AutomationRegistrarInterface",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "invalidateAuctionBid",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isListingValid",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTrustedForwarder",
    inputs: [
      {
        name: "forwarder",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listingCount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listingToUpkeepID",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listings",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "seller",
        type: "address",
        internalType: "address",
      },
      {
        name: "inUSD",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "price",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "timestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isValid",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "isAuction",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "aucionTime",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "onERC1155BatchReceived",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onERC1155Received",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onERC721Received",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "performUpkeep",
    inputs: [
      {
        name: "performData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "trustedForwarder",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "AuctioNotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "AuctionCantBeBought",
    inputs: [],
  },
  {
    type: "error",
    name: "AuctionNotOver",
    inputs: [],
  },
  {
    type: "error",
    name: "AuctionOver",
    inputs: [],
  },
  {
    type: "error",
    name: "BidNotHighEnough",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidListing",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidListingId",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPrice",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidTokenId",
    inputs: [],
  },
  {
    type: "error",
    name: "NoBids",
    inputs: [],
  },
  {
    type: "error",
    name: "NotAuction",
    inputs: [],
  },
  {
    type: "error",
    name: "NotEnoughFunds",
    inputs: [],
  },
  {
    type: "error",
    name: "NotHighestBidder",
    inputs: [],
  },
  {
    type: "error",
    name: "NotListingOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "NotTokenOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "USDNotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "USDNotSupportedForAuction",
    inputs: [],
  },
  {
    type: "error",
    name: "ValidListing",
    inputs: [],
  },
] as const;

const _bytecode =
  "0x610100604052600060025534801561001657600080fd5b50604051612fde380380612fde833981016040819052610035916100b7565b6001600160a01b0390811660805295861660a052600080549587166001600160a01b0319968716179055600180549487169490951693909317909355831660c052911660e0526008805463ffffffff90921663ffffffff19909216919091179055610148565b80516001600160a01b03811681146100b257600080fd5b919050565b600080600080600080600060e0888a0312156100d257600080fd5b6100db8861009b565b96506100e96020890161009b565b95506100f76040890161009b565b94506101056060890161009b565b93506101136080890161009b565b925060a088015163ffffffff8116811461012c57600080fd5b915061013a60c0890161009b565b905092959891949750929550565b60805160a05160c05160e051612e176101c7600039600081816102fd01528181612084015261229801526000818161042f0152818161149b01528181611f5b01526120c00152600081816101b70152818161142301528181611ca60152611d3c015260008181610382015281816104600152611ede0152612e176000f3fe6080604052600436106101a05760003560e01c80637da0a877116100e1578063d36443ca1161008a578063e6282c6e11610064578063e6282c6e146106da578063e7572230146106fa578063f23a6e611461071a578063f68016b71461075f57600080fd5b8063d36443ca146105a5578063da1086a0146105d2578063de74e57b146105f257600080fd5b8063b14c63c5116100bb578063b14c63c5146104c7578063bc197c8114610540578063c62fb5c41461058557600080fd5b80637da0a87714610451578063a9b07c2614610484578063a9fbcdc21461049a57600080fd5b8063454a2ab31161014e578063572b6c0511610128578063572b6c05146103655780636e04ff0d146103cf57806373253387146103fd5780637d253aff1461041d57600080fd5b8063454a2ab31461031f5780634585e33b146103325780634884f4591461035257600080fd5b806327e235e31161017f57806327e235e31461029b5780633ccfd60b146102d6578063442b1278146102eb57600080fd5b8062a18f95146101a5578063150b7a021461020357806325cbce1c14610279575b600080fd5b3480156101b157600080fd5b506101d97f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b34801561020f57600080fd5b5061024861021e36600461248a565b7f150b7a020000000000000000000000000000000000000000000000000000000095945050505050565b6040517fffffffff0000000000000000000000000000000000000000000000000000000090911681526020016101fa565b34801561028557600080fd5b506102996102943660046124fd565b610791565b005b3480156102a757600080fd5b506102c86102b6366004612516565b60046020526000908152604090205481565b6040519081526020016101fa565b3480156102e257600080fd5b506102996109d9565b3480156102f757600080fd5b506101d97f000000000000000000000000000000000000000000000000000000000000000081565b61029961032d3660046124fd565b610ae4565b34801561033e57600080fd5b5061029961034d36600461253a565b610da5565b6102996103603660046124fd565b610dc3565b34801561037157600080fd5b506103bf610380366004612516565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff90811691161490565b60405190151581526020016101fa565b3480156103db57600080fd5b506103ef6103ea36600461253a565b611069565b6040516101fa9291906125e0565b34801561040957600080fd5b506103bf6104183660046124fd565b61114b565b34801561042957600080fd5b506101d97f000000000000000000000000000000000000000000000000000000000000000081565b34801561045d57600080fd5b507f00000000000000000000000000000000000000000000000000000000000000006101d9565b34801561049057600080fd5b506102c860025481565b3480156104a657600080fd5b506102c86104b53660046124fd565b60076020526000908152604090205481565b3480156104d357600080fd5b506105146104e23660046124fd565b6005602052600090815260409020805460019091015473ffffffffffffffffffffffffffffffffffffffff9091169082565b6040805173ffffffffffffffffffffffffffffffffffffffff90931683526020830191909152016101fa565b34801561054c57600080fd5b5061024861055b36600461278f565b7fbc197c810000000000000000000000000000000000000000000000000000000095945050505050565b34801561059157600080fd5b506102996105a036600461284b565b611279565b3480156105b157600080fd5b506102c86105c0366004612516565b60066020526000908152604090205481565b3480156105de57600080fd5b506102996105ed3660046124fd565b6116a0565b3480156105fe57600080fd5b5061068461060d3660046124fd565b600360208190526000918252604090912080546001820154600283015493830154600484015460059094015473ffffffffffffffffffffffffffffffffffffffff84169560ff7401000000000000000000000000000000000000000090950485169593949093808216926101009091049091169088565b6040805173ffffffffffffffffffffffffffffffffffffffff909916895296151560208901529587019490945260608601929092526080850152151560a0840152151560c083015260e0820152610100016101fa565b3480156106e657600080fd5b506102996106f53660046124fd565b611aeb565b34801561070657600080fd5b506102c86107153660046124fd565b611c2c565b34801561072657600080fd5b506102486107353660046128c3565b7ff23a6e610000000000000000000000000000000000000000000000000000000095945050505050565b34801561076b57600080fd5b5060085461077c9063ffffffff1681565b60405163ffffffff90911681526020016101fa565b600081815260036020526040812060040154610100900460ff16151590036107e5576040517f3fbfe96d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526003602081905260409091206005810154910154610808919061295b565b421161088c5760008181526003602052604090206004015460ff161561085a576040517f12a83adf00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f0b1d782e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000805482825260036020526040918290205491517fe985e9c500000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff928316600482015230602482015291169063e985e9c590604401602060405180830381865afa158015610910573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109349190612974565b156109855760008181526003602052604090206004015460ff1615610985576040517f12a83adf00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000818152600560205260409020600101546109cd576040517f81b5ad6800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6109d681611e29565b50565b6000600460006109e7611ed7565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905060008111610a5e576040517f81b5ad6800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600060046000610a6c611ed7565b73ffffffffffffffffffffffffffffffffffffffff168152602081019190915260400160002055610a9b611ed7565b73ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050158015610ae0573d6000803e3d6000fd5b5050565b60008181526003602052604081206004015460ff1615159003610b33576040517fd5a6e0b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600081815260036020526040812060040154610100900460ff1615159003610b87576040517f3fbfe96d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600081815260036020526040902060020154341015610bd2576040517f3bdb1be700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000818152600560205260409020600101543411610c1c576040517f3bdb1be700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526005602052604090206001015415610cce5760008181526005602090815260408083206001810154905473ffffffffffffffffffffffffffffffffffffffff16845260049092528220805491929091610c7b90849061295b565b909155505060008181526005602090815260408083206001810154905473ffffffffffffffffffffffffffffffffffffffff16845260069092528220805491929091610cc8908490612991565b90915550505b3460066000610cdb611ed7565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610d24919061295b565b925050819055506040518060400160405280610d3e611ed7565b73ffffffffffffffffffffffffffffffffffffffff9081168252346020928301526000938452600582526040909320825181547fffffffffffffffffffffffff00000000000000000000000000000000000000001694169390931783550151600190910155565b6000610db3828401846124fd565b9050610dbe816116a0565b505050565b610dcc8161114b565b1515600003610e07576040517fd5a6e0b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600081815260036020526040902060040154610100900460ff1615610e58576040517f37e9a4e800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000610e6382611c2c565b905080341015610e9f576040517f81b5ad6800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000610eab8234612991565b90508015610f0f578060046000610ec0611ed7565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610f09919061295b565b90915550505b60008381526003602090815260408083205473ffffffffffffffffffffffffffffffffffffffff168352600490915281208054849290610f5090849061295b565b909155505060008054848252600360205260409091205473ffffffffffffffffffffffffffffffffffffffff918216916342842e0e9116610f8f611ed7565b6000878152600360205260409081902060010154905160e085901b7fffffffff0000000000000000000000000000000000000000000000000000000016815273ffffffffffffffffffffffffffffffffffffffff93841660048201529290911660248301526044820152606401600060405180830381600087803b15801561101657600080fd5b505af115801561102a573d6000803e3d6000fd5b505050600093845250506003602052506040902060040180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055565b600060608161107a848601866124fd565b6000818152600360208190526040909120600581015491015491925061109f9161295b565b421180156110d0575060008181526005602052604090205473ffffffffffffffffffffffffffffffffffffffff1615155b8015611107575060008181526003602052604090206004015460ff1680611107575060008181526005602052604090206001015415155b925084848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525095989297509195505050505050565b600081158061115b575060025482115b15611192576040517f5a6c6f3200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000828152600360205260408082208054925460019091015491517f6352211e000000000000000000000000000000000000000000000000000000008152600481019290925273ffffffffffffffffffffffffffffffffffffffff928316921690636352211e90602401602060405180830381865afa158015611219573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061123d91906129a4565b73ffffffffffffffffffffffffffffffffffffffff161461126057506000919050565b5060009081526003602052604090206004015460ff1690565b600084116112b2576040517ebfc92100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600085116112ec576040517f3f6cc76800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6112f4611ed7565b6000546040517f6352211e0000000000000000000000000000000000000000000000000000000081526004810188905273ffffffffffffffffffffffffffffffffffffffff9283169290911690636352211e90602401602060405180830381865afa158015611367573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061138b91906129a4565b73ffffffffffffffffffffffffffffffffffffffff16146113d8576040517f59dc379f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8280156113e25750855b15611419576040517f23dab71300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b85801561145a57507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16155b15611491576040517f0f99819500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8280156114d257507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16155b15611509576040517f5c757a2200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60028054906000611519836129c1565b9190505550604051806101000160405280611532611ed7565b73ffffffffffffffffffffffffffffffffffffffff908116825288151560208084019190915260408084018a905260608085018a905242608080870191909152600160a08088018290528b15801560c0808b019190915260e0998a018d90526002805460009081526003808b52908990208d5181549b8f0151151574010000000000000000000000000000000000000000027fffffffffffffffffffffff000000000000000000000000000000000000000000909c169c169b909b17999099178a55968b0151938901939093559389015194870194909455908701519385019390935590850151600484018054938701511515610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00ff921515929092167fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000909416939093171790915592909101516005909101556116985761169860025482611f59565b505050505050565b600081815260036020526040812060040154610100900460ff16151590036116f4576040517f3fbfe96d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526003602081905260409091206005810154910154611717919061295b565b421161174f576040517f0b1d782e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526005602052604090205473ffffffffffffffffffffffffffffffffffffffff166117aa576040517fc3bc404300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526003602052604081206004015460ff161515900361181e57600081815260056020526040902060010154156117ec576117e781611e29565b61181e565b6040517fd5a6e0b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008181526005602052604090206001015461186d57600090815260036020526040902060040180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055565b6000805482825260036020526040918290205491517fe985e9c500000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff928316600482015230602482015291169063e985e9c590604401602060405180830381865afa1580156118f1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119159190612974565b15156000036119605761192781611e29565b600090815260036020526040902060040180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055565b60008181526003602052604081206004015460ff16151590036119af576040517fd5a6e0b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600081815260056020908152604080832060010154600383528184205473ffffffffffffffffffffffffffffffffffffffff168452600490925282208054919290916119fc90849061295b565b90915550506000805482825260036020818152604080852080546005845282872054949093526001015481517f23b872dd00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff938416600482015293831660248501526044840152519216926323b872dd9260648084019382900301818387803b158015611a9a57600080fd5b505af1158015611aae573d6000803e3d6000fd5b50505060009182525060036020526040902060040180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055565b611af48161114b565b1515600003611b2f576040517fd5a6e0b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b611b37611ed7565b6000805483825260036020526040918290206001015491517f6352211e000000000000000000000000000000000000000000000000000000008152600481019290925273ffffffffffffffffffffffffffffffffffffffff928316921690636352211e90602401602060405180830381865afa158015611bbb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bdf91906129a4565b73ffffffffffffffffffffffffffffffffffffffff1614611927576040517f7c62d69f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000811580611c3c575060025482115b15611c73576040517f5a6c6f3200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008281526003602052604090205474010000000000000000000000000000000000000000900460ff1615611e0e5760007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611d0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d3391906129f9565b60ff16905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa158015611da5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611dc99190612a36565b50505091505060008183600a611ddf9190612ba6565b600087815260036020526040902060020154611dfb9190612bb2565b611e059190612bc9565b95945050505050565b5060009081526003602052604090206002015490565b919050565b60008181526005602090815260408083206001810154905473ffffffffffffffffffffffffffffffffffffffff16845260069092528220805491929091611e71908490612991565b909155505060008181526005602090815260408083206001810154905473ffffffffffffffffffffffffffffffffffffffff16845260049092528220805491929091611ebe90849061295b565b9091555050600090815260056020526040812060010155565b60003660147f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1633148015611f215750808210155b15611f5157600036611f338385612991565b611f3e928290612c04565b611f4791612c2e565b60601c9250505090565b339250505090565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166323b872dd611f9d611ed7565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b16815273ffffffffffffffffffffffffffffffffffffffff90911660048201523060248201526bffffffffffffffffffffffff841660448201526064016020604051808303816000875af1158015612022573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120469190612974565b506040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660048301526bffffffffffffffffffffffff831660248301527f0000000000000000000000000000000000000000000000000000000000000000169063095ea7b3906044016020604051808303816000875af1158015612109573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061212d9190612974565b5060008260405160200161214391815260200190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181526101408301909152915060009080612185866123bd565b8152604080518082018252600281527f3078000000000000000000000000000000000000000000000000000000000000602082810191909152830152309082015260085463ffffffff1660608201526080016121df611ed7565b73ffffffffffffffffffffffffffffffffffffffff168152602001600060ff1681526020018381526020016040518060400160405280600281526020017f307800000000000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600281526020017f30780000000000000000000000000000000000000000000000000000000000008152508152602001846bffffffffffffffffffffffff16815250905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16633f678e11836040518263ffffffff1660e01b81526004016122ef9190612c76565b6020604051808303816000875af115801561230e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123329190612dc8565b905080156123505760008581526007602052604090208190556123b6565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f6175746f2d617070726f76652064697361626c65640000000000000000000000604482015260640160405180910390fd5b5050505050565b606060a06040510180604052602081039150506000815280825b600183039250600a81066030018353600a9004806123d757508190037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0909101908152919050565b73ffffffffffffffffffffffffffffffffffffffff811681146109d657600080fd5b60008083601f84011261245357600080fd5b50813567ffffffffffffffff81111561246b57600080fd5b60208301915083602082850101111561248357600080fd5b9250929050565b6000806000806000608086880312156124a257600080fd5b85356124ad8161241f565b945060208601356124bd8161241f565b935060408601359250606086013567ffffffffffffffff8111156124e057600080fd5b6124ec88828901612441565b969995985093965092949392505050565b60006020828403121561250f57600080fd5b5035919050565b60006020828403121561252857600080fd5b81356125338161241f565b9392505050565b6000806020838503121561254d57600080fd5b823567ffffffffffffffff81111561256457600080fd5b61257085828601612441565b90969095509350505050565b6000815180845260005b818110156125a257602081850181015186830182015201612586565b5060006020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b82151581526040602082015260006125fb604083018461257c565b949350505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff8111828210171561267957612679612603565b604052919050565b600082601f83011261269257600080fd5b8135602067ffffffffffffffff8211156126ae576126ae612603565b8160051b6126bd828201612632565b92835284810182019282810190878511156126d757600080fd5b83870192505b848310156126f6578235825291830191908301906126dd565b979650505050505050565b600082601f83011261271257600080fd5b813567ffffffffffffffff81111561272c5761272c612603565b61275d60207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601612632565b81815284602083860101111561277257600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a086880312156127a757600080fd5b85356127b28161241f565b945060208601356127c28161241f565b9350604086013567ffffffffffffffff808211156127df57600080fd5b6127eb89838a01612681565b9450606088013591508082111561280157600080fd5b61280d89838a01612681565b9350608088013591508082111561282357600080fd5b5061283088828901612701565b9150509295509295909350565b80151581146109d657600080fd5b60008060008060008060c0878903121561286457600080fd5b863561286f8161283d565b95506020870135945060408701359350606087013561288d8161283d565b92506080870135915060a08701356bffffffffffffffffffffffff811681146128b557600080fd5b809150509295509295509295565b600080600080600060a086880312156128db57600080fd5b85356128e68161241f565b945060208601356128f68161241f565b93506040860135925060608601359150608086013567ffffffffffffffff81111561292057600080fd5b61283088828901612701565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8082018082111561296e5761296e61292c565b92915050565b60006020828403121561298657600080fd5b81516125338161283d565b8181038181111561296e5761296e61292c565b6000602082840312156129b657600080fd5b81516125338161241f565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036129f2576129f261292c565b5060010190565b600060208284031215612a0b57600080fd5b815160ff8116811461253357600080fd5b805169ffffffffffffffffffff81168114611e2457600080fd5b600080600080600060a08688031215612a4e57600080fd5b612a5786612a1c565b9450602086015193506040860151925060608601519150612a7a60808701612a1c565b90509295509295909350565b600181815b80851115612adf57817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612ac557612ac561292c565b80851615612ad257918102915b93841c9390800290612a8b565b509250929050565b600082612af65750600161296e565b81612b035750600061296e565b8160018114612b195760028114612b2357612b3f565b600191505061296e565b60ff841115612b3457612b3461292c565b50506001821b61296e565b5060208310610133831016604e8410600b8410161715612b62575081810a61296e565b612b6c8383612a86565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612b9e57612b9e61292c565b029392505050565b60006125338383612ae7565b808202811582820484141761296e5761296e61292c565b600082612bff577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b60008085851115612c1457600080fd5b83861115612c2157600080fd5b5050820193919092039150565b7fffffffffffffffffffffffffffffffffffffffff0000000000000000000000008135818116916014851015612c6e5780818660140360031b1b83161692505b505092915050565b6020815260008251610140806020850152612c9561016085018361257c565b915060208501517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe080868503016040870152612cd1848361257c565b935060408701519150612cfc606087018373ffffffffffffffffffffffffffffffffffffffff169052565b606087015163ffffffff811660808801529150608087015173ffffffffffffffffffffffffffffffffffffffff811660a0880152915060a087015160ff811660c0880152915060c08701519150808685030160e0870152612d5d848361257c565b935060e08701519150610100818786030181880152612d7c858461257c565b945080880151925050610120818786030181880152612d9b858461257c565b94508088015192505050612dbe828601826bffffffffffffffffffffffff169052565b5090949350505050565b600060208284031215612dda57600080fd5b505191905056fea264697066735822122048ec8bbda2af0b99e8918b8823922740a5c02626b9762ba9258f590731ecbca464736f6c63430008190033";

type MarketplaceConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MarketplaceConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Marketplace__factory extends ContractFactory {
  constructor(...args: MarketplaceConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    eth_usd_priceFeedAddress: string,
    mapAddress: string,
    utilsAddress: string,
    _linkAddress: string,
    _registrar: string,
    _gasLimit: BigNumberish,
    trustedForwarder: string,
    overrides?: Overrides & { from?: string }
  ): Promise<Marketplace> {
    return super.deploy(
      eth_usd_priceFeedAddress,
      mapAddress,
      utilsAddress,
      _linkAddress,
      _registrar,
      _gasLimit,
      trustedForwarder,
      overrides || {}
    ) as Promise<Marketplace>;
  }
  override getDeployTransaction(
    eth_usd_priceFeedAddress: string,
    mapAddress: string,
    utilsAddress: string,
    _linkAddress: string,
    _registrar: string,
    _gasLimit: BigNumberish,
    trustedForwarder: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(
      eth_usd_priceFeedAddress,
      mapAddress,
      utilsAddress,
      _linkAddress,
      _registrar,
      _gasLimit,
      trustedForwarder,
      overrides || {}
    );
  }
  override attach(address: string): Marketplace {
    return super.attach(address) as Marketplace;
  }
  override connect(signer: Signer): Marketplace__factory {
    return super.connect(signer) as Marketplace__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MarketplaceInterface {
    return new utils.Interface(_abi) as MarketplaceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Marketplace {
    return new Contract(address, _abi, signerOrProvider) as Marketplace;
  }
}