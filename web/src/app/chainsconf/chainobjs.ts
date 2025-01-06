import { defineChain } from "viem";
import { chainConfig as opStackChainConfig } from 'viem/op-stack'
import {
    scrollSepolia, lineaSepolia, sepolia, arbitrumSepolia, linea,
    mainnet, optimism, optimismSepolia, opBNB, bsc, blastSepolia, blast,
    mantle, mantleSepoliaTestnet,
    base
} from "viem/chains";


import { clusterApiUrl as solanaClusterApiUrl } from "@solana/web3.js";
import { ChainCode } from "../lib/myTypes";


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
    } else if (chainCode == ChainCode.MORPH_CHAIN) {
        rtn = morphMainnet;
    } else if (chainCode == ChainCode.SCROLL_TEST_CHAIN) {
        rtn = scrollSepolia;
        rtn.l1ChainCode = ChainCode.SEPOLIA_CHAIN;
    } else if (chainCode == ChainCode.MANTLE_TEST_CHAIN) {
        rtn = mantleSepoliaTestnet;
        // rtn.blockExplorers = {
        //     default: {
        //         name: 'Mantle Testnet Explorer',
        //         url: 'https://explorer.sepolia.mantle.xyz/',
        //         apiUrl: 'https://explorer.sepolia.mantle.xyz/api',
        //     },
        // },

    } else if (chainCode == ChainCode.MANTLE_MAIN_CHAIN) {
        rtn = mantle;
        // rtn.rpcUrls.default.http.unshift(
        //     "https://mantle-mainnet.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW"
        // );
    } else if (chainCode == ChainCode.LINEA_TEST_CHAIN) {
        rtn = lineaSepolia;
        // rtn.l1ChainCode = ChainCode.SEPOLIA_CHAIN;
        rtn.rpcUrls.default.http.unshift(
            "https://linea-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW"
        );
        console.log("test,linea test chain:", rtn);
    } else if (chainCode == ChainCode.LINEA_CHAIN) {
        rtn = linea;
        // rtn.l1ChainCode = ChainCode.ETHEREUM_MAIN_NET;
        rtn.rpcUrls.default.http.unshift(
            "https://linea-mainnet.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW"
        );
    } else if (chainCode == ChainCode.SEPOLIA_CHAIN) {
        // rtn = sepolia;
        rtn = { ...sepolia };
        rtn.rpcUrls.default.http.unshift(
            "https://eth-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW"
        );
    } else if (chainCode == ChainCode.NEOX_TEST_CHAIN) {
        rtn = neoxTestnet;
    } else if (chainCode == ChainCode.ARBITRUM_TEST_CHAIN) {
        rtn = { ...arbitrumSepolia };
        rtn.rpcUrls.default.http.unshift(
            "https://arb-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW",
        );
    } else if (chainCode == ChainCode.ETHEREUM_MAIN_NET) {
        rtn = { ...mainnet };
        rtn.rpcUrls.default.http.unshift(
            "https://eth-mainnet.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW",
        );
    } else if (chainCode == ChainCode.BASE_MAIN_CHAIN) {
        rtn = { ...base };
        rtn.rpcUrls.default.http.unshift(
            "https://base-mainnet.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW",
        );
    } else if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN) {
        rtn = { ...optimism };
        rtn.rpcUrls.default.http.unshift(
            "https://opt-mainnet.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW",
        );
    } 
    else if (chainCode == ChainCode.OPTIMISM_TEST_CHAIN) {
        rtn = { ...optimismSepolia };
        rtn.rpcUrls.default.http.unshift(
            "https://opt-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW",
        );
        // rtn.blockExplorers.default = {
        //     name: 'Sepolia Optimism Explorer',
        //     url: 'https://sepolia-optimism.etherscan.io',
        //     apiUrl: 'https://api-sepolia-optimistic.etherscan.io/api',
        // };
    } else if (chainCode == ChainCode.AIACHAIN_MAIN_CHAIN) {
        rtn = aiachainMainnet;
    } else if (chainCode == ChainCode.BSC_MAIN_NET) {
        rtn = bsc;
    } else if (chainCode == ChainCode.OPBNB_MAIN_NET) {
        rtn = opBNB;
    } else if (chainCode == ChainCode.BLAST_MAIN_CHAIN) {
        rtn = blast;
    } else if (chainCode == ChainCode.BLAST_TEST_CHAIN) {
        rtn = blastSepolia;
    } else if (chainCode == ChainCode.AIACHAIN_TEST_CHAIN) {
        rtn = aiachainTestnet;
    } else if (chainCode == ChainCode.UNICHAIN_TEST_CHAIN) {
        rtn = unichainTestnet;
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
    return chainCode == "SCROLL_TEST_CHAIN" || chainCode == "SCROLL_CHAIN";
}


// 

//

//


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

export const morphMainnet = /*#__PURE__*/ defineChain({
    id: 2818,
    name: 'Morph Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc-quicknode.morphl2.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'morph explore',
            url: 'https://explorer.morphl2.io',
            apiUrl: 'https://explorer-api.morphl2.io/api/v2',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 9473,
        },
    },
    testnet: false,
})


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


const aiachainMainnet = defineChain({
    id: 1319,
    name: "AIA-mainnet",
    nativeCurrency: {
        decimals: 18,
        name: "AIA",
        symbol: "AIA",
    },
    rpcUrls: {
        default: {
            http: ["https://aia-dataseed1.aiachain.org"],
            webSocket: [""],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "http://aiascan.com",
        },
    },
    contracts: {
        multicall3: {
            address: "0xD6010D102015fEa9cB3a9AbFBB51994c0Fd6E672",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "http://aiascan.com/api/",
    testnet: false,
});



const aiachainTestnet = defineChain({
    id: 1320,
    name: "AIA-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "AIA",
        symbol: "AIA",
    },
    rpcUrls: {
        default: {
            http: ["https://aia-dataseed1-testnet.aiachain.org"],
            webSocket: [""],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://testnet.aiascan.com",
        },
    },
    contracts: {
        multicall3: {
            address: "0xD6010D102015fEa9cB3a9AbFBB51994c0Fd6E672",
            blockCreated: 1,
        },
    },
    explorerApiUrl: "https://testnet.aiascan.com/api/",
    testnet: true,
});

const unichainTestnetSourceId = 11_155_111
const unichainTestnet = defineChain({
    id: 1301,
    name: "Unichain Sepolia(testnet)",
    nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH",
    },
    rpcUrls: {
        default: {
            http: ["https://sepolia.unichain.org"],
            webSocket: ["wss://sepolia.unichain.org"],
        },
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://sepolia.uniscan.xyz",
        },
    },
    explorerApiUrl: "https://api-sepolia.uniscan.xyz/api",
    contracts: {
        ...opStackChainConfig.contracts,
        disputeGameFactory: {
            [unichainTestnetSourceId]: {
                address: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
            },
        },
        l2OutputOracle: {
            [unichainTestnetSourceId]: {
                address: '0xdfe97868233d1aa22e815a266982f2cf17685a27',
            },
        },
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 4286263,
        },
        portal: {
            [unichainTestnetSourceId]: {
                address: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
            },
        },
        l1StandardBridge: {
            [unichainTestnetSourceId]: {
                address: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
            },
        },
    },
    sourceId: unichainTestnetSourceId,
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




