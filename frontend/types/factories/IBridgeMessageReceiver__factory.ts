/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBridgeMessageReceiver,
  IBridgeMessageReceiverInterface,
} from "../IBridgeMessageReceiver";

const _abi = [
  {
    type: "function",
    name: "onMessageReceived",
    inputs: [
      {
        name: "originAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "originNetwork",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

export class IBridgeMessageReceiver__factory {
  static readonly abi = _abi;
  static createInterface(): IBridgeMessageReceiverInterface {
    return new utils.Interface(_abi) as IBridgeMessageReceiverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBridgeMessageReceiver {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IBridgeMessageReceiver;
  }
}
