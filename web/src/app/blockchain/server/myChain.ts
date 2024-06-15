import { defineChain } from "viem";

const localChain = defineChain({
  id: 31337,
  name: "Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["wss://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "http://127.0.0.1:8545" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
});

const morphHoleskyTestnet = defineChain({
  id: 2810,
  name: "MorphHoleskyTestnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-holesky.morphl2.io"],
      webSocket: ["wss://rpc-holesky.morphl2.io"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer-holesky.morphl2.io" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
});

export const currentNet = () => {
  if (process.env.MY_CHAIN == "LOCAL_CHAIN") {
    return localChain;
  } else if (process.env.MY_CHAIN == "MORPH_TEST_CHAIN") {
    return morphHoleskyTestnet;
  }
}; // morphHoleskyTestnet;

export function isMorphNet() {
  return currentNet() === morphHoleskyTestnet;
}
// export const currentNet = localChain;
