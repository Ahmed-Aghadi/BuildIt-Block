import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  avalancheFuji,
  polygonZkEvmCardona,
  zkSyncSepoliaTestnet,
  scrollSepolia,
  sepolia,
  moonbaseAlpha,
  polygonAmoy,
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
    polygonZkEvmCardona,
    zkSyncSepoliaTestnet,
    scrollSepolia,
    sepolia,
    metisSepolia,
    polygonAmoy,
    moonbaseAlpha,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export { config };
