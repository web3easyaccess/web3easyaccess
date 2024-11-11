import { ChainCode } from "../lib/myTypes";

export const isOpStackChain = (chainCode: ChainCode) => {
    if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN ||
        chainCode == ChainCode.OPTIMISM_TEST_CHAIN ||
        chainCode == ChainCode.UNICHAIN_MAIN_CHAIN ||
        chainCode == ChainCode.UNICHAIN_TEST_CHAIN) {
        return true;
    } else {
        return false;
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

