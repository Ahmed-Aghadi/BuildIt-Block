import { useEffect, useState } from "react";
import {
  Map__factory,
  Marketplace__factory,
  Faucet__factory,
  LinkTokenInterface__factory,
  Forwarder__factory,
} from "@/types";

import { Utils__factory as UtilsCCIP__factory } from "@/types/factories/UtilsCCIP.sol";
import { Utils__factory as UtilsLxLy__factory } from "@/types/factories/UtilsLxLy.sol";
import { BigNumber, ethers, providers } from "ethers";
import {
  SupportedChainIds,
  contractAddresses,
} from "@/utils/contractAddresses";
import { Unity, useUnityContext } from "react-unity-webgl";
import SSXComponent from "./SSXComponent";

import { useAccount } from "wagmi";

import { type Config, getClient, getConnectorClient } from "@wagmi/core";
import type { Account, Client, Chain, Transport } from "viem";

import { config } from "@/utils/Config";
import { ERC2771Forwarder } from "@/types/Forwarder";

export function isLxLyChain(chainId: SupportedChainIds) {
  return chainId == "2442" || chainId == "11155111";
}

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider(
  config: Config,
  { chainId }: { chainId?: number } = {}
) {
  const client = getClient(config, { chainId });
  if (!client) return;
  return clientToProvider(client);
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner(
  config: Config,
  { chainId }: { chainId?: number } = {}
) {
  const client = await getConnectorClient(config, { chainId });
  return clientToSigner(client);
}

export const ContractFunctions = ({
  sendMessage,

  unityProvider,

  isLoaded,
  addEventListener,
  removeEventListener,
}: {
  sendMessage: ReturnType<typeof useUnityContext>["sendMessage"];

  unityProvider: any;
  isLoaded: boolean;
  addEventListener: any;
  removeEventListener: any;
}) => {
  const account = useAccount();

  // const { account, particleProvider } = useAccountInfo();
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>(); // ethers.providers.FallbackProvider | ethers.providers.JsonRpcProvider
  // const connectKit = useConnectKit();

  const [onWalletConnectCallback, setOnWalletConnectCallback] = useState<
    string[]
  >([]);
  const [onWalletDisconnectCallback, setOnWalletDisconnectCallback] = useState<
    string[]
  >([]);
  const [onSwitchNetworkCallback, setOnSwitchNetworkCallback] = useState<
    string[]
  >([]);

  const [chainId, setChainId] = useState<SupportedChainIds>();

  console.log("chainId vs account.chainId", chainId, account.chainId);

  const MOONBASE_ALPHA_CHAIN_ID = "1287";

  const MOONBASE_ALPHA_CALL_PERMIT_ADDRESS =
    "0x000000000000000000000000000000000000080a";
  const [isGasless, setIsGasless] = useState(0);

  function getIsGasless() {
    return isGasless === 1;
  }

  useEffect(() => {
    addEventListener("SetIsGasless", setIsGasless);
    return () => {
      removeEventListener("SetIsGasless", setIsGasless);
    };
  }, [addEventListener, removeEventListener, setIsGasless]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const generateMsgDataForwarder = (
      message: {
        from: string;
        to: string;
        value: number;
        gas: number;
        nonce: number;
        deadline: number;
        data: string;
      },
      chainId: string,
      verifyingContract: string
    ) => {
      const domain = {
        name: "Forwarder",
        version: "1",
        chainId: chainId,
        verifyingContract: verifyingContract,
      };
      const types = {
        ForwardRequest: [
          {
            name: "from",
            type: "address",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "gas",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint48",
          },
          {
            name: "data",
            type: "bytes",
          },
        ],
      };
      const values = message;
      return { domain, types, values };
    };

    const generateMsgDataCallPermit = (
      message: {
        from: string;
        to: string;
        value: number;
        data: string;
        gaslimit: number;
        nonce: number;
        deadline: number;
      },
      verifyingContract: string
    ) => {
      const domain = {
        name: "Call Permit Precompile",
        version: "1",
        chainId: MOONBASE_ALPHA_CHAIN_ID,
        verifyingContract: verifyingContract,
      };
      const types = {
        CallPermit: [
          {
            name: "from",
            type: "address",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "data",
            type: "bytes",
          },
          {
            name: "gaslimit",
            type: "uint64",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      };
      const values = message;
      return { domain, types, values };
    };

    const getNonce = async (address: string) => {
      // function nonces(address owner) external view returns (uint256)
      let ABI = [
        "function nonces(address owner) external view returns (uint256)",
      ];
      let iface = new ethers.utils.Interface(ABI);
      let contract = new ethers.Contract(
        MOONBASE_ALPHA_CALL_PERMIT_ADDRESS,
        iface,
        provider
      );
      let nonce = await contract.nonces(address);
      return nonce;
    };

    const generateSignature = async (
      domain: {
        name: string;
        version: string;
        chainId: string;
        verifyingContract: string;
      },
      types: any,
      values: any,
      signer: ethers.providers.JsonRpcSigner | ethers.Wallet
      // rpcUrl: string
    ): Promise<string> => {
      const signature = await signer._signTypedData(domain, types, values);
      return signature;
    };

    async function invoke(route: string, payload: string) {
      console.log("invoke", route, payload);
      // This is required to convert BigNumber to string when sending to Unity ( probably ethers v5 specific as I think v6 uses bigint )
      Object.defineProperties(BigNumber.prototype, {
        toJSON: {
          value: function (this: BigNumber) {
            return this.toString();
          },
        },
      });
      if (route == "WalletConnected") {
        const r = { result: isConnected() };
        return JSON.stringify(r);
      } else if (route == "OnWalletConnect") {
        const functionName = JSON.parse(payload).arguments[0];
        setOnWalletConnectCallback((prev) => [...prev, functionName]);
        const r = { result: "" };
        return JSON.stringify(r);
      } else if (route == "OnWalletDisconnect") {
        const functionName = JSON.parse(payload).arguments[0];
        setOnWalletDisconnectCallback((prev) => [...prev, functionName]);
        const r = { result: "" };
        return JSON.stringify(r);
      } else if (route == "OnSwitchNetwork") {
        const functionName = JSON.parse(payload).arguments[0];
        setOnSwitchNetworkCallback((prev) => [...prev, functionName]);
        const r = { result: "" };
        return JSON.stringify(r);
      } else if (route == "ChainId") {
        console.log("chainID", getChainId());
        const r = {
          result: await getChainId(),
        };
        return JSON.stringify(r);
      } else if (route == "WalletAddress") {
        const r = { result: account.address };
        return JSON.stringify(r);
      } else if (route == "ContractAddress") {
        const args = JSON.parse(payload).arguments;
        const chainId = await getChainId();
        const contractName =
          args[0] as keyof (typeof contractAddresses)[SupportedChainIds];
        const r = { result: contractAddresses[chainId][contractName] };
        return JSON.stringify(r);
      } else if (route == "ContractRead") {
        const args = JSON.parse(payload).arguments;
        const contractName =
          args[0] as keyof (typeof contractAddresses)[SupportedChainIds];
        const contract = await getContract(contractName);
        const functionName = args[1] as keyof typeof contract;
        const functionArgs = JSON.parse(args[2]);
        console.log("functionArgs", functionArgs);
        // @ts-ignore
        const result = await contract[functionName](...functionArgs);
        console.log("result", result);
        const r = { result: result };
        console.log("r", { r });
        return JSON.stringify(r);
      } else if (route == "ContractWrite") {
        const args = JSON.parse(payload).arguments;
        const contractName =
          args[0] as keyof (typeof contractAddresses)[SupportedChainIds];
        const contract = await getContract(contractName);
        const functionName = args[1] as keyof typeof contract;
        const functionArgs = JSON.parse(args[2]);
        console.log("functionArgs", functionArgs);
        let isValue = false;
        let value = 0;
        if (
          typeof functionArgs[0] === "object" &&
          functionArgs[0].hasOwnProperty("value")
        ) {
          isValue = true;
          value = functionArgs[0].value;
          functionArgs.shift();
        }
        let receipt;
        if (chainId === "1287") {
          // @ts-ignore
          let signFunctionData = contract.interface.encodeFunctionData(
            functionName,
            functionArgs
          );
          const txData = {
            from: account.address!,
            to: contract.address,
            value: value,
            data: signFunctionData,
            gaslimit: parseInt(process.env.NEXT_PUBLIC_GAS_LIMIT ?? "100000"),
            // nonce: (await provider?.getTransactionCount(account.address!))!,
            nonce: parseInt(
              ((await getNonce(account.address!)) as BigNumber).toString()
            ),
            deadline: Date.now() + 60 * 5 * 1000, // 5 minutes
          };
          console.log("txData", txData);

          const message = {
            from: txData.from,
            to: txData.to,
            value: txData.value,
            data: txData.data,
            gaslimit: txData.gaslimit,
            nonce: txData.nonce,
            deadline: txData.deadline,
          };
          const { domain, types, values } = generateMsgDataCallPermit(
            message,
            MOONBASE_ALPHA_CALL_PERMIT_ADDRESS
          );
          const signature = await generateSignature(
            domain,
            types,
            values,
            await getSigner()
          );
          const ethersSignature = ethers.utils.splitSignature(signature);
          const ABI = [
            "function dispatch(address from, address to, uint256 value, bytes data, uint64 gaslimit, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
          ];
          let iface = new ethers.utils.Interface(ABI);
          const encodedFunctionData = iface.encodeFunctionData("dispatch", [
            txData.from,
            txData.to,
            txData.value,
            txData.data,
            txData.gaslimit,
            txData.deadline,
            ethersSignature.v,
            ethersSignature.r,
            ethersSignature.s,
          ]);
          const res = await fetch(`/api/ExecuteAny`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rpcURL: provider!.connection.url,
              transactionData: encodedFunctionData,
              to: MOONBASE_ALPHA_CALL_PERMIT_ADDRESS,
            }),
          });

          const { txReceipt, txResponse } = (await res.json()) as {
            txResponse: ethers.providers.TransactionResponse;
            txReceipt: ethers.providers.TransactionReceipt;
          };
          // return { success: true, txReceipt };
          receipt = txReceipt;
        } else {
          let tx;
          if (isValue) {
            // @ts-ignore
            tx = await contract[functionName](...functionArgs, {
              value: value,
            });
            receipt = await tx.wait();
          } else {
            console.log("gasless", getIsGasless());
            if (getIsGasless()) {
              const forwarderContract = await getForwarderContract();
              // @ts-ignore
              let signFunctionData = contract.interface.encodeFunctionData(
                functionName,
                functionArgs
              );
              const txData = {
                from: account.address!,
                to: contract.address,
                value: value, // It should be 0
                data: signFunctionData,
                gaslimit: parseInt(
                  process.env.NEXT_PUBLIC_GAS_LIMIT ?? "100000"
                ),
                // nonce: (await provider?.getTransactionCount(account.address!))!,
                nonce: parseInt(
                  (await forwarderContract.nonces(account.address!)).toString()
                ),
                deadline: Date.now() + 60 * 5 * 1000, // 5 minutes
              };
              console.log("txData", txData);

              const message = {
                from: txData.from,
                to: txData.to,
                value: txData.value,
                gas: txData.gaslimit,
                nonce: txData.nonce,
                deadline: txData.deadline,
                data: txData.data,
              };
              const { domain, types, values } = generateMsgDataForwarder(
                message,
                chainId!,
                forwarderContract.address
              );
              const signature = await generateSignature(
                domain,
                types,
                values,
                await getSigner()
              );
              const executeArgs: ERC2771Forwarder.ForwardRequestDataStruct = {
                from: message.from,
                to: message.to,
                value: message.value,
                gas: message.gas,
                deadline: message.deadline,
                data: message.data,
                signature: signature,
              };
              const encodedFunctionData =
                forwarderContract.interface.encodeFunctionData("execute", [
                  executeArgs,
                ]);
              const res = await fetch(`/api/ExecuteAny`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  rpcURL: provider!.connection.url,
                  transactionData: encodedFunctionData,
                  to: forwarderContract.address,
                }),
              });

              const { txReceipt, txResponse } = (await res.json()) as {
                txResponse: ethers.providers.TransactionResponse;
                txReceipt: ethers.providers.TransactionReceipt;
              };
              // return { success: true, txReceipt };
              receipt = txReceipt;
            } else {
              // @ts-ignore
              tx = await contract[functionName](...functionArgs);
              receipt = await tx.wait();
            }
          }
        }
        console.log("result", receipt);
        const r = { result: receipt };
        console.log("r", { r });
        return JSON.stringify(r);
      }
    }

    // @ts-ignore
    window.customBridge = {
      invoke,
    };

    return () => {
      // @ts-ignore
      delete window.customBridge;
    };
  }, [
    // account,
    connected,
    provider,
    isGasless,
  ]);

  const [chainIdChanged, setChainIdChanged] = useState(false);

  useEffect(() => {
    if (account.isConnected) {
      setConnected(true);
      const ethersProvider = getEthersProvider(
        config
      ) as ethers.providers.JsonRpcProvider;
      setProvider(ethersProvider);
      if (chainId && chainId != account.chainId?.toString()) {
        setChainIdChanged(true);
        // onSwitchNetworkCallback.forEach((functionName) => {
        //   sendMessage("ContractManager", functionName);
        // });
      }
      setChainId(account.chainId?.toString() as SupportedChainIds);
    } else {
      setChainId(undefined);
      setConnected(false);
    }
  }, [account.isConnected, account.chainId]);

  useEffect(() => {
    if (chainIdChanged) {
      onSwitchNetworkCallback.forEach((functionName) => {
        sendMessage("ContractManager", functionName);
      });
      setChainIdChanged(false);
    }
  }, [chainIdChanged]);

  useEffect(() => {
    if (connected) {
      console.log("Connected");
      onWalletConnectCallback.forEach((functionName) => {
        sendMessage("ContractManager", functionName);
      });
    } else {
      console.log("Disconnected");
      onWalletDisconnectCallback.forEach((functionName) => {
        sendMessage("ContractManager", functionName);
      });
    }
  }, [connected]);

  function isConnected() {
    return connected;
  }

  function getChainId() {
    return chainId?.toString() as SupportedChainIds;
  }

  async function getSigner() {
    const signer = await getEthersSigner(config);
    return signer;
  }

  async function getContract(
    contractName: keyof (typeof contractAddresses)[SupportedChainIds]
  ) {
    if (contractName === "Map") {
      return getMapContract();
    } else if (contractName === "Marketplace") {
      return getMarketplaceContract();
    } else if (contractName === "Utils") {
      return getUtilsContract();
    } else if (contractName === "Faucet") {
      return getFaucetContract();
      // @ts-ignore
    } else if (contractName === "LinkToken") {
      return getLinkTokenInterfaceContract();
    } else {
      throw new Error("Invalid contract name");
    }
  }

  async function getForwarderContract() {
    const forwarderContractAddress =
      contractAddresses[await getChainId()].Forwarder;
    const forwarder = Forwarder__factory.connect(
      forwarderContractAddress,
      (await getSigner())!
    );
    return forwarder;
  }

  async function getMapContract() {
    const mapContractAddress = contractAddresses[await getChainId()].Map;
    const map = Map__factory.connect(mapContractAddress, (await getSigner())!);
    return map;
  }

  async function getMarketplaceContract() {
    const marketplaceContractAddress =
      contractAddresses[await getChainId()].Marketplace;
    const marketplace = Marketplace__factory.connect(
      marketplaceContractAddress,
      (await getSigner())!
    );
    return marketplace;
  }

  async function getUtilsContract() {
    const chainId = await getChainId();
    const utilsContractAddress = contractAddresses[chainId].Utils;
    const Utils__factory = isLxLyChain(chainId)
      ? UtilsLxLy__factory
      : UtilsCCIP__factory;
    const utils = Utils__factory.connect(
      utilsContractAddress,
      (await getSigner())!
    );
    return utils;
  }

  async function getFaucetContract() {
    const faucetContractAddress = contractAddresses[await getChainId()].Faucet;
    const faucet = Faucet__factory.connect(
      faucetContractAddress,
      (await getSigner())!
    );
    return faucet;
  }

  async function getLinkTokenInterfaceContract() {
    const linkTokenInterfaceContractAddress =
      // @ts-ignore
      contractAddresses[await getChainId()].LinkToken;
    const linkTokenInterface = LinkTokenInterface__factory.connect(
      linkTokenInterfaceContractAddress,
      (await getSigner())!
    );
    return linkTokenInterface;
  }

  return (
    <>
      <SSXComponent
        unityProvider={unityProvider}
        provider={provider}
        isLoaded={isLoaded}
        addEventListener={addEventListener}
        removeEventListener={removeEventListener}
        sendMessage={sendMessage}
      />
    </>
  );
};
