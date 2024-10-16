import { PrivateInfoType } from "@/app/lib/client/keyTools";
import * as libsolana from "@/app/lib/client/solana/libsolana";
import {
    newAccountAndTransferETH,
    createTransaction as createTransactionETH,
    changePasswdAddr as changePasswdAddrETH,
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
    privateInfo: PrivateInfoType,
    upgradeImpl: boolean,
) {
    console.log("wrapped createTransaction,chainCode=", chainCode);
    console.log("clientside,createTransaction,upgradeImpl=", upgradeImpl);
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
            bridgeDirection,
            upgradeImpl,
        );
        return rtn;
    }
}

export async function changePasswdAddr(
    chainCode: string,
    bigBrotherOwnerId: `0x${string}`,
    bigBrotherAccountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    privateInfo: PrivateInfoType, // old private info.
    newPrivateInfo: PrivateInfoType
) {
    console.log("wrapped changePasswdAddr,chainCode=", chainCode);
    if (chainCode.indexOf("SOLANA") >= 0) {
        const rtn = await libsolana.changePasswdAddr_onClient(
            chainCode,
            bigBrotherOwnerId,
            bigBrotherAccountAddr,
            passwdAddr,
            newPasswdAddr,
            newQuestionNos,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            preparedMaxFeePerGas,
            preparedGasPrice,
            privateInfo,
            newPrivateInfo
        );
        return rtn;
    } else {
        const rtn = await changePasswdAddrETH(
            chainCode,
            bigBrotherOwnerId,
            bigBrotherAccountAddr,
            passwdAddr,
            newPasswdAddr,
            newQuestionNos,
            signature,
            onlyQueryFee,
            detectEstimatedFee,
            preparedMaxFeePerGas,
            preparedGasPrice
        );
        return rtn;
    }
}
