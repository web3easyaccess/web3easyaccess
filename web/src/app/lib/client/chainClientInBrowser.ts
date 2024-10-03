import { createPublicClient, http } from "viem";

import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

export const walletClient = (getChainObj) => {
    return createWalletClient({
        chain: getChainObj,
        transport: http(getChainObj.rpcUrls.default.http[0]),
    });
};
