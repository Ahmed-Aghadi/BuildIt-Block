import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  avalancheFuji,
  polygonZkEvmTestnet,
  zkSyncSepoliaTestnet,
  scrollSepolia,
  sepolia,
  moonbaseAlpha,
} from "wagmi/chains";
import { defineChain } from "viem";

export const metisSepolia = defineChain({
  id: 59902,
  name: "Metis Sepolia",
  nativeCurrency: { name: "tMetis", symbol: "tMetis", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia.metisdevops.link/"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia-explorer.metisdevops.link/",
    },
  },
});

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [
    avalancheFuji,
    polygonZkEvmTestnet,
    zkSyncSepoliaTestnet,
    scrollSepolia,
    sepolia,
    metisSepolia,
    moonbaseAlpha,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export { config };
