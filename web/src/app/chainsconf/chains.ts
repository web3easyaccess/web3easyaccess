import { ChainCode } from "../lib/myTypes";

export const isOpStackChain = (chainCode: ChainCode) => {
    if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN ||
        chainCode == ChainCode.OPTIMISM_TEST_CHAIN ||
        chainCode == ChainCode.UNICHAIN_MAIN_CHAIN ||
        chainCode == ChainCode.UNICHAIN_TEST_CHAIN ||
        chainCode == ChainCode.BLAST_MAIN_CHAIN ||
        chainCode == ChainCode.BLAST_TEST_CHAIN ||
        // chainCode == ChainCode.MANTLE_MAIN_CHAIN ||
        // chainCode == ChainCode.MANTLE_TEST_CHAIN ||
        chainCode == ChainCode.OPBNB_MAIN_NET) {
        return true;
    } else {
        return false;
    }
}

export function getAssetsScanUrl(chainCode: ChainCode, addr: string) {
    if (chainCode == ChainCode.ETHEREUM_MAIN_NET) {
        return "https://etherscan.io/tokenholdings?a=${addr}";
    } else if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN) {
        return `https://optimistic.etherscan.io/tokenholdings?a=${addr}`
    } else if (chainCode == ChainCode.BSC_MAIN_NET) {
        return `https://bscscan.com/tokenholdings?a=${addr}`
    } else if (chainCode == ChainCode.BLAST_MAIN_CHAIN) {
        return `https://blastscan.io/tokenholdings?a=${addr}`
    } else if (chainCode == ChainCode.MANTLE_MAIN_CHAIN) {
        return `https://mantlescan.xyz/tokenholdings?a=${addr}`
    } else {
        return ""
    }
}

export function chainQuerysApiKeyStartBlock(chainCode: string) {

    const CHAIN_PROPS = {
        SEPOLIA_CHAIN: {
            scanApiKey: "4U7TMXB289TBXHT2WRT6MZN4QCGZA1E5R5",
            startBlock: 6633000,
        },
        LINEA_TEST_CHAIN: {
            scanApiKey: "Y3EURWY2JI96686J7G6G4I614IF48ZM6JF",
            startBlock: 3735000,
        },
        LINEA_CHAIN: {
            scanApiKey: "Y3EURWY2JI96686J7G6G4I614IF48ZM6JF",
            startBlock: 11911524,
        },
        NEOX_TEST_CHAIN: {
            scanApiKey: "123apiKey",
            startBlock: 526100,
        },
        AIACHAIN_MAIN_CHAIN: {
            scanApiKey: "123apiKey",
            startBlock: 1,
        },
        AIACHAIN_TEST_CHAIN: {
            scanApiKey: "123apiKey",
            startBlock: 35759035,
        },
        ARBITRUM_TEST_CHAIN: {
            scanApiKey: "M8YBQ2W5RCFR9A71Y17XBY6AF8XCBGJPYN",
            startBlock: 90137319,
        },
        OPTIMISM_TEST_CHAIN: {
            scanApiKey: "XH8CU3I81U378WUTG5AGG17V8UCNZP6CRU",
            startBlock: 19500650,
        },
        OPTIMISM_MAIN_CHAIN: {
            scanApiKey: "XH8CU3I81U378WUTG5AGG17V8UCNZP6CRU",
            startBlock: 127633028,
        },
        BSC_MAIN_NET: {
            scanApiKey: "5NIAXSP2GCRTVABUX4R2KM2PD6GKF3Q7Q4",
            startBlock: 43941613,
        },
        OPBNB_MAIN_NET: {
            scanApiKey: "5NIAXSP2GCRTVABUX4R2KM2PD6GKF3Q7Q4",
            startBlock: 39651888,
        },
        BLAST_MAIN_CHAIN: {
            scanApiKey: "VUSJEQQSW6X1Q1594M9H3MTF4WGSJ4XPM8",
            startBlock: 11384053,
        },
        BLAST_TEST_CHAIN: {
            scanApiKey: "VUSJEQQSW6X1Q1594M9H3MTF4WGSJ4XPM8",
            startBlock: 13445625,
        },
        MANTLE_MAIN_CHAIN: {
            scanApiKey: "NVXN6ZV8FC7XA8HCFCZU46YQ3WA4CPJQR5",
            startBlock: 72055721,
        },
        MANTLE_TEST_CHAIN: {
            scanApiKey: "NVXN6ZV8FC7XA8HCFCZU46YQ3WA4CPJQR5",
            startBlock: 15348607,
        },
        UNICHAIN_TEST_CHAIN: {
            scanApiKey: "",
            startBlock: 4345600,
        },
        UNICHAIN_MAIN_CHAIN: {
            scanApiKey: "",
            startBlock: 0,
        }
    };

    return CHAIN_PROPS[chainCode];
}

