import { defineChain } from "viem";

import { scrollSepolia, lineaSepolia, sepolia } from "viem/chains";
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

export const getChainObj = (chainCode: ChainCode) => {
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
