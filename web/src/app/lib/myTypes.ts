export enum Menu {
    OOOO,
    Asset,
    Transactions,
    SendTransaction,
    PrivateSetting,
    ExploreDapps,
    Guardian,
}

export enum ChainCode {
    UNKNOW = "UNKNOW",
    ETHEREUM_MAIN_NET = "ETHEREUM_MAIN_NET",
    DEFAULT_ANVIL_CHAIN = "DEFAULT_ANVIL_CHAIN",
    MORPH_TEST_CHAIN = "MORPH_TEST_CHAIN",
    SCROLL_TEST_CHAIN = "SCROLL_TEST_CHAIN",
    LINEA_TEST_CHAIN = "LINEA_TEST_CHAIN",
    SEPOLIA_CHAIN = "SEPOLIA_CHAIN",
    SOLANA_TEST_CHAIN = "SOLANA_TEST_CHAIN",
    NEOX_TEST_CHAIN = "NEOX_TEST_CHAIN",
}

export function chainCodeFromString(chainCode: string) {
    if (chainCode == "ETHEREUM_MAIN_NET") {
        return ChainCode.ETHEREUM_MAIN_NET;
    } else if (chainCode == "DEFAULT_ANVIL_CHAIN") {
        return ChainCode.DEFAULT_ANVIL_CHAIN;
    } else if (chainCode == "MORPH_TEST_CHAIN") {
        return ChainCode.MORPH_TEST_CHAIN;
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        return ChainCode.SCROLL_TEST_CHAIN;
    } else if (chainCode == "LINEA_TEST_CHAIN") {
        return ChainCode.LINEA_TEST_CHAIN;
    } else if (chainCode == "SEPOLIA_CHAIN") {
        return ChainCode.SEPOLIA_CHAIN;
    } else if (chainCode == "SOLANA_TEST_CHAIN") {
        return ChainCode.SOLANA_TEST_CHAIN;
    } else if (chainCode == "NEOX_TEST_CHAIN") {
        return ChainCode.NEOX_TEST_CHAIN;
    } else {
        console.log("ERROR.....chainCodeFromString..:", chainCode);
        return ChainCode.UNKNOW;
    }
}

export const commonTokens = { MORPH_TEST_CHAIN: [{ addr: "", name: "USDT" }] };
export const commonNfts = {};

export type UserInfo = {
    selectedMenu: Menu;
    chainCode: ChainCode;
    factoryAddr: string;
    w3eapAddr: string;
    email: string;
    emailDisplay: string;
    bigBrotherOwnerId: string;
    bigBrotherPasswdAddr: string;
    selectedOwnerId: string;
    selectedOrderNo: number;
    selectedAccountAddr: string;
    accountAddrList: string[]; // last one has not created, others has created.
    accountToOwnerIdMap: Map<string, string>; // key is accountAddr, val is ownerId
    accountToOrderNoMap: Map<string, string>; // key is accountAddr, val is orderNo
};

export function uiToString(ui: UserInfo) {
    const ss = `selectedMenu=${ui.selectedMenu}, selectedOwnerId=${ui.selectedOwnerId},chainCode=${ui.chainCode},factoryAddr=${ui.factoryAddr},w3eapAddr=${ui.w3eapAddr},emailDisplay=${ui.emailDisplay},selectedOrderNo=${ui.selectedOrderNo},selectedAccountAddr=${ui.selectedAccountAddr}`;
    return ss;
}

export type Transaction = {
    timestamp: string;
    block_number: number;
    result: string;
    to: string;
    hash: string;
    gas_price: string;
    gas_used: number;
    gas_limit: number;
    l1_fee: number;
    from: string;
    value: string;
};

export const formatNumber = (num0: any) => {
    const num = Number(num0);
    if (num >= 10) {
        return num.toFixed(2);
    } else if (num >= 1) {
        return num.toFixed(3);
    } else if (num >= 0.1) {
        return num.toFixed(3);
    } else if (num >= 0.01) {
        return num.toFixed(4);
    } else if (num >= 0.001) {
        return num.toFixed(5);
    } else if (num >= 0.0001) {
        return num.toFixed(6);
    } else if (num >= 0.00001) {
        return num.toFixed(7);
    } else if (num >= 0.000001) {
        return num.toFixed(8);
    } else if (num >= 0.0000001) {
        return num.toFixed(9);
    } else if (num >= 0.00000001) {
        return num.toFixed(10);
    } else if (num >= 0.000000001) {
        return num.toFixed(11);
    } else if (num >= 0.0000000001) {
        return num.toFixed(12);
    } else if (num >= 0.00000000001) {
        return num.toFixed(13);
    } else if (num >= 0.000000000001) {
        return num.toFixed(14);
    } else if (num >= 0.0000000000001) {
        return num.toFixed(15);
    } else if (num >= 0.00000000000001) {
        return num.toFixed(16);
    } else {
        return num;
    }
};
