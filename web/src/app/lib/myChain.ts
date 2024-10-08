import { defineChain } from "viem";

import { scrollSepolia, lineaSepolia, sepolia } from "viem/chains";

import { clusterApiUrl as solanaClusterApiUrl } from "@solana/web3.js";

import { ChainCode } from "./myTypes";

// node_modules\viem\chains\definitions\scrollSepolia.ts

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
    testnet: true,
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
        default: {
            name: "Explorer",
            url: "https://explorer-holesky.morphl2.io",
        },
    },
    contracts: {
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://explorer-api-holesky.morphl2.io/api/v2",
    testnet: true,
});

const neoxMainnet = defineChain({
    id: 47763,
    name: "NeoX Mainnet",
    nativeCurrency: {
        decimals: 18,
        name: "GAS",
        symbol: "GAS",
    },
    rpcUrls: {
        default: {
            http: ["https://mainnet-1.rpc.banelabs.org"],
            webSocket: ["wss://mainnet.wss1.banelabs.org"],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://xexplorer.neo.org",
        },
    },
    contracts: {
        multicall3: {
            address: "0xD6010D102015fEa9cB3a9AbFBB51994c0Fd6E672",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://12345/api/v2",
    testnet: false,
});

const neoxTestnet = defineChain({
    id: 12227332,
    name: "NeoX T4(testnet)",
    nativeCurrency: {
        decimals: 18,
        name: "GAS",
        symbol: "GAS",
    },
    rpcUrls: {
        default: {
            http: ["https://neoxt4seed1.ngd.network"],
            webSocket: ["wss://neoxt4wss1.ngd.network"],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://xt4scan.ngd.network",
        },
    },
    contracts: {
        multicall3: {
            address: "0x82096F92248dF7afDdef72E545F06e5be0cf0F99",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://12345test/api/v2",
    testnet: true,
});

const solanaLocalnet = defineChain({
    id: 999014,
    name: "Solana Localnet",
    nativeCurrency: {
        decimals: 9,
        name: "SOL",
        symbol: "SOL",
    },
    rpcUrls: {
        default: {
            http: ["http://127.0.0.1:8899"],
            webSocket: [""],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            // https://explorer.solana.com/tx/hy2VE7yWJVc7SBBjPi4PALj3qCD3GQYLCcnkAEEy5LrSUKdB9ZsA7b1MRV2o329SBrD2frGvRrjzLXqZPxMwQvu?cluster=custom
            url: "https://explorer.solana.com/[ADDRESS_OR_TX]?cluster=custom",
        },
        txUrl: (tx: string) => {
            return `https://explorer.solana.com/tx/${tx}?cluster=custom`;
        },
        addressUrl: (address: string) => {
            return `https://explorer.solana.com/address/${address}?cluster=custom`;
        },
    },
    contracts: {
        multicall3: {
            address: "0x82096F92248dF7afDdef72E545F06e5be0cf0F99",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://12345test/api/v2",
    testnet: true,
});

/** 我的自定义代码
 * 999011 Mainnet - https://api.mainnet-beta.solana.com
 * 999012 Devnet  - https://api.devnet.solana.com
 * 999013 Testnet - https://api.testnet.solana.com
 * 999014 Localnet
 */

const solanaDevnet = defineChain({
    id: 999012,
    name: "Solana Devnet",
    nativeCurrency: {
        decimals: 9,
        name: "SOL",
        symbol: "SOL",
    },
    rpcUrls: {
        default: {
            http: [solanaClusterApiUrl("devnet")],
            webSocket: [""],
        },
    },

    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://explorer.solana.com/[ADDRESS_OR_TX]?cluster=devnet",
        },
        txUrl: (tx: string) => {
            return `https://explorer.solana.com/tx/${tx}?cluster=devnet`;
        },
        addressUrl: (address: string) => {
            return `https://explorer.solana.com/address/${address}?cluster=devnet`;
        },
    },
    contracts: {
        multicall3: {
            address: "0x82096F92248dF7afDdef72E545F06e5be0cf0F99",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://api.devnet.solana.com",
    testnet: true,
});

export const getChainObj = (
    chainCode: ChainCode
): {
    id: number;
    name: string;
    nativeCurrency: {};
    rpcUrls: {};
    blockExplorers: {};
    contracts: {};
    testnet: boolean;
    chainCode: ChainCode;
    l1ChainCode: ChainCode;
} => {
    var rtn = {
        id: 0,
        name: "",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: {
            default: {
                http: [""],
            },
        },
        blockExplorers: {
            default: {
                name: "",
                url: "",
                apiUrl: "",
            },
        },
        contracts: {
            multicall3: {
                address: "0xca11bde05977b3631167028862be2a173976ca11",
                blockCreated: 9473,
            },
        },
        testnet: true,
        chainCode: ChainCode.UNKNOW,
        l1ChainCode: ChainCode.UNKNOW, // when I am L2 chain, here store my corresponding L1 CHAIN
    };

    if (chainCode == ChainCode.DEFAULT_ANVIL_CHAIN) {
        rtn = defaultAnvil;
    } else if (chainCode == ChainCode.MORPH_TEST_CHAIN) {
        rtn = morphHoleskyTestnet;
    } else if (chainCode == ChainCode.SCROLL_TEST_CHAIN) {
        rtn = scrollSepolia;
        rtn.l1ChainCode = ChainCode.SEPOLIA_CHAIN;
    } else if (chainCode == ChainCode.LINEA_TEST_CHAIN) {
        rtn = lineaSepolia;
        rtn.l1ChainCode = ChainCode.SEPOLIA_CHAIN;
    } else if (chainCode == ChainCode.SEPOLIA_CHAIN) {
        // rtn = sepolia;
        rtn = { ...sepolia };
        rtn.rpcUrls.default.http.unshift(
            "https://eth-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW"
        );
    } else if (chainCode == ChainCode.NEOX_TEST_CHAIN) {
        rtn = neoxTestnet;
    } else if (chainCode == ChainCode.SOLANA_TEST_CHAIN) {
        rtn = solanaDevnet; // solanaLocalnet;
    } else {
        console.warn("not supprted:" + chainCode);
    }
    rtn.chainCode = chainCode;
    // console.log(`getChainObj ok. name=${rtn.name}, chainCode=${rtn.chainCode}`);
    return rtn;
}; // morphHoleskyTestnet;

export function isMorphNet(chainCode) {
    console.log("chaincode in isMorphNet:", chainCode);
    return chainCode == "MORPH_TEST_CHAIN";
}

export function isScrollNet(chainCode) {
    console.log("chaincode in isScrollNet:", chainCode);
    return chainCode == "SCROLL_TEST_CHAIN";
}

export function isLineaNet(chainCode) {
    console.log("chaincode in isLineaNet:", chainCode);
    return chainCode == "LINEA_TEST_CHAIN";
}
// export const getChainObj = localChain;
