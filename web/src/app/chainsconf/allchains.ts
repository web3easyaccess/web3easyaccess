import { ChainCode } from "../lib/myTypes";

export const supportedChains = () => {
    return allChains.filter((c) => c.closed != true);
};

export const showingChains = (testMode: boolean) => {
    return supportedChains().filter((s) => s.isTestnet == testMode);
};

const testChains = [
    {
        closed: false,
        chainCode: ChainCode.UNICHAIN_TEST_CHAIN,
        img: "/chain/unichaintest.png",
        title: "Unichain Sepolia",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.MANTLE_TEST_CHAIN,
        img: "/chain/mantletest.png",
        title: "Mantle Sepolia",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.AIACHAIN_TEST_CHAIN,
        img: "/chain/aiachaintest.png",
        title: "AIA Testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.NEOX_TEST_CHAIN,
        img: "/chain/neoxtest.png",
        title: "NeoX testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.SOLANA_TEST_CHAIN,
        img: "/chain/solanatest.png",
        title: "Solana testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.SEPOLIA_CHAIN,
        img: "/chain/sepolia.png",
        title: "Sepolia testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.LINEA_TEST_CHAIN,
        img: "/chain/lineatest.png",
        title: "Linea Sepolia",
        size: "sm",
        bordered: false,
    },

    {
        closed: false,
        chainCode: ChainCode.SCROLL_TEST_CHAIN,
        img: "/chain/scrolltest.png",
        title: "Scroll Sepolia",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.MORPH_TEST_CHAIN,
        img: "/chain/morphl2test.png",
        title: "Morph testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.DEFAULT_ANVIL_CHAIN,
        img: "/chain/anvil.png",
        title: "anvil testnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.OPTIMISM_TEST_CHAIN,
        img: "/chain/optimismtest.png",
        title: "OP Sepolia",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.BLAST_TEST_CHAIN,
        img: "/chain/blasttest.png",
        title: "Blast Sepolia",
        size: "sm",
        bordered: false,
    },

];

const mainChains = [
    {
        closed: true,
        chainCode: ChainCode.BLAST_MAIN_CHAIN,
        img: "/chain/blast.png",
        title: "Blast Mainnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.MANTLE_MAIN_CHAIN,
        img: "/chain/mantle.png",
        title: "Mantle Mainnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.OPTIMISM_MAIN_CHAIN,
        img: "/chain/optimism.png",
        title: "OP Mainnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.BSC_MAIN_NET,
        img: "/chain/bnbbsc.png",
        title: "BSC",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.OPBNB_MAIN_NET,
        img: "/chain/bnbopbnb.png",
        title: "opBNB",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.LINEA_CHAIN,
        img: "/chain/linea.png",
        title: "Linea Mainnet",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.ETHEREUM_MAIN_NET,
        img: "/chain/ethereum.png",
        title: "Ether eum",
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.MORPH_CHAIN,
        img: "/chain/morphl2.png",
        title: "Morph Mainnet",
        size: "sm",
        bordered: false,
    },


    {
        closed: true,
        chainCode: ChainCode.AIACHAIN_MAIN_CHAIN,
        img: "/chain/aiachain.png",
        title: "AIA Mainnet",
        size: "sm",
        bordered: false,
    },
]

export const allChains: {
    closed: boolean | undefined;
    chainCode: ChainCode;
    img: string;
    title: string;
    isTestnet: boolean;
    size: "sm" | "md";
    bordered: boolean;
}[] = [];

mainChains.forEach(c => {
    const cc = { ...c, isTestnet: false };
    allChains.push(cc);
});

testChains.forEach(c => {
    const cc = { ...c, isTestnet: true };
    allChains.push(cc);
})