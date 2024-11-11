import { ChainCode } from "../lib/myTypes";

export const supportedChains = () => {
    return allChains.filter((c) => c.closed != true);
};

export const showingChains = (testMode: boolean) => {
    return supportedChains().filter((s) => s.isTestnet == testMode);
};


export const allChains: {
    closed: boolean | undefined;
    chainCode: ChainCode;
    img: string;
    title: string;
    isTestnet: boolean;
    size: "sm" | "md";
    bordered: boolean;
}[] = [
        {
            closed: false,
            chainCode: ChainCode.UNICHAIN_TEST_CHAIN,
            img: "/chain/unichaintest.png",
            title: "Unichain Sepolia",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.AIACHAIN_TEST_CHAIN,
            img: "/chain/aiachaintest.png",
            title: "AIA Testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.NEOX_TEST_CHAIN,
            img: "/chain/neoxtest.png",
            title: "NeoX testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.SOLANA_TEST_CHAIN,
            img: "/chain/solanatest.png",
            title: "Solana testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.SEPOLIA_CHAIN,
            img: "/chain/sepolia.png",
            title: "Sepolia testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.LINEA_TEST_CHAIN,
            img: "/chain/lineatest.png",
            title: "Linea Sepolia",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: true,
            chainCode: ChainCode.LINEA_CHAIN,
            img: "/chain/linea.png",
            title: "Linea Mainnet",
            isTestnet: false,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.SCROLL_TEST_CHAIN,
            img: "/chain/scrolltest.png",
            title: "Scroll Sepolia",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.MORPH_TEST_CHAIN,
            img: "/chain/morphl2test.png",
            title: "Morph testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: true,
            chainCode: ChainCode.DEFAULT_ANVIL_CHAIN,
            img: "/chain/anvil.png",
            title: "anvil testnet",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.OPTIMISM_TEST_CHAIN,
            img: "/chain/optimismtest.png",
            title: "OP Sepolia",
            isTestnet: true,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.OPTIMISM_MAIN_CHAIN,
            img: "/chain/optimism.png",
            title: "OP Mainnet",
            isTestnet: false,
            size: "sm",
            bordered: false,
        },
        {
            closed: false,
            chainCode: ChainCode.ETHEREUM_MAIN_NET,
            img: "/chain/ethereum.png",
            title: "Ether eum",
            isTestnet: false,
            size: "sm",
            bordered: false,
        },
        {
            closed: true,
            chainCode: ChainCode.AIACHAIN_MAIN_CHAIN,
            img: "/chain/aiachain.png",
            title: "AIA Mainnet",
            isTestnet: false,
            size: "sm",
            bordered: false,
        },
    ];
