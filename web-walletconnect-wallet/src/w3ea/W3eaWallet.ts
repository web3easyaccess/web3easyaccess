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
import { providers, Wallet, utils, Contract } from 'ethers'

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

type SmartAccountLibOptions = {
    privateKey: string
    chain: Chain
    sponsored?: boolean
    entryPointVersion?: number
}

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
    signMessage(message: string): Promise<string> {
        throw new Error('signMessage Method not implemented.@w3ea')
    }
    _signTypedData(domain: any, types: any, data: any, _primaryType?: string): Promise<string> {
        throw new Error('_signTypedData Method not implemented.@w3ea')
    }
    connect(provider: providers.JsonRpcProvider) {
        throw new Error('connect Method not implemented.@w3ea')
    }
    signTransaction(transaction: providers.TransactionRequest): Promise<string> {
        throw new Error('signTransaction Method not implemented.@w3ea')
    }

}
