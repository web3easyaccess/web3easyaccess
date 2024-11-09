import {
    Hex,
    PrivateKeyAccount,
    PublicClient,
    createPublicClient,
    http,
    createClient,
    HttpTransport,
    Address
} from 'viem'
import { EIP155Wallet } from '../lib/EIP155Lib'
import { providers, Wallet, utils, Contract, BytesLike } from 'ethers'

import { JsonRpcProvider } from '@ethersproject/providers'
import { privateKeyToAccount } from 'viem/accounts'
import {
    PimlicoPaymasterClient,
    createPimlicoPaymasterClient
} from 'permissionless/clients/pimlico'
import {
    BundlerActions,
    BundlerClient,
    ENTRYPOINT_ADDRESS_V06,
    ENTRYPOINT_ADDRESS_V07,
    SmartAccountClient,
    SmartAccountClientConfig,
    bundlerActions,
    createSmartAccountClient
} from 'permissionless'
import { PimlicoBundlerActions, pimlicoBundlerActions } from 'permissionless/actions/pimlico'
import {
    PIMLICO_NETWORK_NAMES,
    publicClientUrl,
    publicRPCUrl,
    UrlConfig
} from '@/utils/SmartAccountUtil'
import { Chain } from '@/consts/smartAccounts'
import { EntryPoint } from 'permissionless/types/entrypoint'
import { Erc7579Actions, erc7579Actions } from 'permissionless/actions/erc7579'
import { SmartAccount } from 'permissionless/accounts'
import { SendCallsParams, SendCallsPaymasterServiceCapabilityParam } from '@/data/EIP5792Data'
import { UserOperation } from 'permissionless/_types/types'
import { paymasterActionsEip7677 } from 'permissionless/experimental'
import { getSendCallData } from '@/utils/EIP5792WalletUtil'

import { chat_signMessage, chat_sendTransaction } from "./channelInWc"


type SmartAccountLibOptions = {
    privateKey: string
    chain: Chain
    sponsored?: boolean
    entryPointVersion?: number
}

export type TransactionRequest = {
    to?: string,
    from?: string,
    nonce?: string,

    gasLimit?: string,
    gasPrice?: string,

    data?: string,
    value?: string,
    chainId?: string,

    type?: string,
    accessList?: string,

    maxPriorityFeePerGas?: string,
    maxFeePerGas?: string,

    customData?: Record<string, any>;
    ccipReadEnabled?: boolean;
}



// interface TransactionResponse {
//     to?: string;
//     nonce: number;
//     gasLimit: string;
//     gasPrice?: string;

//     data: string;
//     value: string;
//     chainId: number;

//     r?: string;
//     s?: string;
//     v?: number;

//     // Typed-Transaction features
//     type?: number | null;

//     // EIP-2930; Type 1 & EIP-1559; Type 2
//     accessList?: any; // AccessList;

//     // EIP-1559; Type 2
//     maxPriorityFeePerGas?: string;
//     maxFeePerGas?: string;
//     //////
//     hash: string;

//     // Only if a transaction has been mined
//     blockNumber?: number,
//     blockHash?: string,
//     timestamp?: number,

//     confirmations: number,

//     // Not optional (as it is in Transaction)
//     from: string;

//     // The raw transaction
//     raw?: string,

//     // This function waits until the transaction has been mined
//     // wait: (confirmations?: number) => Promise<TransactionReceipt>
// };



export class W3eaWallet implements EIP155Wallet {
    address: string;
    passwdPrivateKey: string;
    constructor(address: string, passwdPrivateKey: string) {
        this.address = address;
        this.passwdPrivateKey = passwdPrivateKey;
    }

    getMnemonic(): string {
        throw new Error('getMnemonic Method not implemented.@w3ea')
    }
    getPrivateKey(): string {
        throw new Error('getPrivateKey Method not implemented.@w3ea')
    }
    getAddress(): string {
        return this.address;
    }
    async signMessage(message: string) {
        const rtn = await chat_signMessage(message, false);
        return rtn;
    }

    // Promise<string>
    async _signTypedData(domain: any, types: any, data: any, _primaryType?: string) {

        let typedData = {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                ],
                ...types
            },
            primaryType: _primaryType,
            domain: domain,
            message: data,
        };
        if (typedData.domain.version == undefined) {
            console.log("WARN, w3ea,_signTypedData,domain.version is not exists!");
            typedData = {
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        // { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" },
                    ],
                    ...types
                },
                primaryType: _primaryType,
                domain: domain,
                message: data,
            };
        }
        console.log("w3ea,_signTypedData:", typedData);
        const message = JSON.stringify(
            typedData
        );

        const rtn = await chat_signMessage(message, true);
        return rtn;

        // throw new Error('_signTypedData Method not implemented.@w3ea')
    }


    connect(provider: providers.JsonRpcProvider) {

        // return new Wallet("" as BytesLike);
        // avoid build's error:
        return this.connectAsync(provider) as unknown as Wallet;
    }


    async connectAsync(provider: providers.JsonRpcProvider) {
        const connectedWallet = {
            sendTransaction: async (tx: TransactionRequest) => {
                console.log("w3ea wallet, tx data:", tx);
                const hash = chat_sendTransaction(tx);
                return hash;
            }
        }
        return connectedWallet;
    }
    signTransaction(transaction: providers.TransactionRequest): Promise<string> {
        throw new Error('signTransaction Method not implemented.@w3ea')
    }

}


