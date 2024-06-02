import { useEffect, useState } from "react";
import {
  Map__factory,
  Marketplace__factory,
  Faucet__factory,
  LinkTokenInterface__factory,
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
  const [provider, setProvider] = useState<
    ethers.providers.FallbackProvider | ethers.providers.JsonRpcProvider
  >();
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
        let tx;
        if (isValue) {
          // @ts-ignore
          tx = await contract[functionName](...functionArgs, { value: value });
        } else {
          // @ts-ignore
          tx = await contract[functionName](...functionArgs);
        }
        const receipt = await tx.wait();
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
  ]);

  const [chainId, setChainId] = useState<number>();

  useEffect(() => {
    if (account.isConnected) {
      setConnected(true);
      const ethersProvider = getEthersProvider(config);
      setProvider(ethersProvider);
      if (chainId && chainId != account.chainId) {
        onSwitchNetworkCallback.forEach((functionName) => {
          sendMessage("ContractManager", functionName);
        });
      }
      setChainId(account.chainId);
    } else {
      setChainId(undefined);
      setConnected(false);
    }
  }, [account.status]);

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
