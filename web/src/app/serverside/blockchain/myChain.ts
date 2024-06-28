import { defineChain } from "viem";

import myCookies from "../myCookies";
import redirectTo from "../redirectTo";

const defaultAnvil = defineChain({
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

export const setChainCode = (chainCode) => {
  myCookies.setChainCode(chainCode);
};

export const getChainObj = () => {
  var rtn = { id: 0 };
  if (myCookies.getChainCode() == "DEFAULT_ANVIL_CHAIN") {
    rtn = defaultAnvil;
  } else if (myCookies.getChainCode() == "MORPH_TEST_CHAIN") {
    rtn = morphHoleskyTestnet;
  } else {
  }
  rtn.chainCode = myCookies.getChainCode();
  // console.log(`getChainObj ok. name=${rtn.name}, chainCode=${rtn.chainCode}`);
  return rtn;

  //   if (process.env.CHAIN_NAME == "DEFAULT_ANVIL_CHAIN") {
  //     return defaultAnvil;
  //   } else if (process.env.CHAIN_NAME == "MORPH_TEST_CHAIN") {
  //     return morphHoleskyTestnet;
  //   }
}; // morphHoleskyTestnet;

export function isMorphNet() {
  return getChainObj() === morphHoleskyTestnet;
}
// export const getChainObj = localChain;
