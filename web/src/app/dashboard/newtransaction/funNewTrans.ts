import { PrivateInfoType } from "@/app/lib/client/keyTools";
import * as libsolana from "@/app/lib/client/solana/libsolana";
import {
    newAccountAndTransferETH,
    createTransaction as createTransactionETH,
} from "@/app/serverside/blockchain/chainWrite";

export async function newAccountAndTransfer(
    chainCode: string,
    ownerId: `0x${string}`,
    passwdAddr: `0x${string}`,
    questionNos: `0x${string}`,
    to: `0x${string}`,
    amount: BigInt,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string,
    privateInfo: PrivateInfoType
) {
    console.log("wrapped newAccountAndTransfer,chainCode=", chainCode);
    if (chainCode.indexOf("SOL") >= 0) {
        const rtn = await libsolana.newAccountAndTransferSol_onClient(
            chainCode,
            ownerId,
            questionNos,
            to,
            amount,
            data,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            l1DataFee,
            preparedMaxFeePerGas,
            preparedGasPrice,
            bridgeDirection,
            privateInfo
        );
        return rtn;
    } else {
        const rtn = await newAccountAndTransferETH(
            chainCode,
            ownerId,
            passwdAddr,
            questionNos,
            to,
            amount,
            data,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            l1DataFee,
            preparedMaxFeePerGas,
            preparedGasPrice,
            bridgeDirection
        );
        return rtn;
    }
}

export async function createTransaction(
    chainCode: string,
    ownerId: `0x${string}`,
    accountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string,
    privateInfo: PrivateInfoType
) {
    console.log("wrapped createTransaction,chainCode=", chainCode);
    if (chainCode.indexOf("SOLANA") >= 0) {
        const rtn = await libsolana.createTransaction_onClient(
            chainCode,
            ownerId,
            accountAddr,
            to,
            amount,
            data,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            l1DataFee,
            preparedMaxFeePerGas,
            preparedGasPrice,
            bridgeDirection,
            privateInfo
        );
        return rtn;
    } else {
        const rtn = await createTransactionETH(
            chainCode,
            ownerId,
            accountAddr,
            passwdAddr,
            to,
            amount,
            data,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            l1DataFee,
            preparedMaxFeePerGas,
            preparedGasPrice,
            bridgeDirection
        );
        return rtn;
    }
}
