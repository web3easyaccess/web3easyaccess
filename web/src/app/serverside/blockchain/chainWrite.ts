"use server";

import popularAddr from "../../dashboard/privateinfo/lib/popularAddr";

import {
    getContract,
    formatEther,
    parseEther,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
} from "viem";

import { chainClient } from "./chainWriteClient";
import { queryAccount } from "../../lib/chainQuery";

import abis from "./abi/abis";
import redirectTo from "../redirectTo";

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function getW3eapAddr() {
    const myClient = chainClient();
    const addr = await myClient.publicClient.readContract({
        account: myClient.account,
        address: myClient.factoryAddr,
        abi: abis.w3eaPoint,
        functionName: "w3eaPoint",
        args: [],
    });

    return addr;
}

export async function newAccount(
    ownerId: `0x${string}`,
    passwdAddr: `0x${string}`,
    questionNos: `0x${string}`
) {
    console.log(
        `newAccount called ... ownerId= ${ownerId}, passwdAddr=${passwdAddr}`
    );
    const myClient = chainClient();
    let freeFeeAmount = 0;
    if (ownerId.endsWith("0000")) {
        freeFeeAmount = myClient.freeFeeWhen1stCreated;
    }
    let hash = null;
    var newAccountData;
    try {
        newAccountData = encodeFunctionData({
            abi: abis.newAccount,
            functionName: "newAccount",
            args: [ownerId, passwdAddr, questionNos, freeFeeAmount],
        });

        hash = await myClient.walletClient.sendTransaction({
            account: myClient.account,
            to: myClient.factoryAddr,
            value: BigInt(0), // parseEther("0.0"),
            data: newAccountData,
        });

        console.log(`newAccount, hash=${hash}`);

        let acct = { accountAddr: null, created: false };
        for (let kk = 0; kk < 600; kk++) {
            acct = await queryAccount(
                myClient.chainCode,
                myClient.factoryAddr,
                ownerId
            );
            if (acct?.created == false) {
                console.log("waiting for creating new account...", kk);
                await sleep(1000);
            } else {
                console.log("created new account:", acct);
                return {
                    success: true,
                    accountId: acct.accountAddr,
                    hash: hash,
                };
            }
        }

        return { success: false, accountId: "timeOut", hash: hash };
    } catch (e) {
        console.log("newAccount error:", e);
        return { success: false, accountId: "error", hash: hash };
    }
}

async function getL1DataFee(cc: any, data: any) {
    if (cc.l1GasPriceOracleContract.length < 42) {
        return BitInt(0);
    }

    const myAbi = abis.getL1DataFee;
    myAbi[0].name = cc.l1DataFeeFunc;
    console.log("getL1DataFee:", myAbi, data, cc.publicClient.readContract);
    const l1DataFee = await cc.publicClient.readContract({
        account: cc.account,
        address: cc.l1GasPriceOracleContract,
        abi: myAbi,
        functionName: cc.l1DataFeeFunc,
        args: [data],
    });
    console.log("getL1DataFee22:", l1DataFee);
    return BigInt((l1DataFee * BigInt(105)) / BigInt(100));
}

export async function newAccountAndTransferETH(
    ownerId: `0x${string}`,
    passwdAddr: `0x${string}`,
    questionNos: `0x${string}`,
    to: `0x${string}`,
    amount: BigInt,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint
) {
    console.log(
        `newAccountAndTransferETH called ..onlyQueryFee=${onlyQueryFee}. ownerId= ${ownerId}, passwdAddr=${passwdAddr},detectEstimatedFee=${detectEstimatedFee}`
    );
    const myClient = chainClient();
    let freeFeeAmount = 0;
    if (ownerId.endsWith("0000")) {
        freeFeeAmount = myClient.freeFeeWhen1stCreated;
    }
    let hash = "";
    let newAccountData;
    let request = null;
    try {
        newAccountData = encodeFunctionData({
            abi: abis.newAccountAndSendTrans,
            functionName: "newAccountAndSendTrans",
            args: [
                ownerId,
                passwdAddr,
                questionNos,
                freeFeeAmount,
                to,
                amount,
                "",
                detectEstimatedFee + l1DataFee, // L2fee+L1fee  on client side.
                signature,
            ],
        });

        console.log(
            "total fee = txFee+L1DataFee =",
            detectEstimatedFee,
            "+",
            l1DataFee
        );

        console.log(
            "xxx:account,factory:",
            myClient.account.address,
            myClient.factoryAddr,
            "data:"
            // newAccountData
        );
        console.log("xxxxxxx---1,");
        // estimate transaction fee.
        if (onlyQueryFee) {
            console.log("xxxxxxx---2,");
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
            });
            // console.log("xxxxxxx---3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req:", request);
                throw Error("unsupport prepare req!");
            }

            console.log(
                `xxxxx-4,newAccountAndTransferETH detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "xxxxx-5,newAccountAndTransferETH detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );

            console.log("xxxxxxx---2a,");
            const _l1DataFee = await getL1DataFee(
                myClient,
                encodePacked(
                    // from,to,value,data,nonce,gasPrice,gasLimit
                    [
                        "address",
                        "address",
                        "uint256",
                        "bytes",
                        "uint256",
                        "uint256",
                        "uint256",
                    ],
                    [
                        myClient.account?.address,
                        myClient.factoryAddr,
                        BigInt(0),
                        newAccountData,
                        BigInt(999999),
                        BigInt(999999999),
                        BigInt(99999),
                    ]
                )
            );

            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: _l1DataFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log("sendTransaction with new Account:", hash);
            return { success: true, tx: hash, msg: "" };
        }
        // xxxx
    } catch (e) {
        console.log("newAccount error00:", e.shortMessage);
        console.log("newAccount error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

export async function createTransaction(
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
    preparedGasPrice: bigint
) {
    console.log(
        `createTransaction called ... ownerId= ${ownerId},accountAddr=${accountAddr}, amount=${amount},detectEstimatedFee=${detectEstimatedFee},onlyQueryFee=${onlyQueryFee},detectEstimatedFee=${detectEstimatedFee}`
    );
    let dataSendToAccount = null;
    let request = null;
    let hash = "";
    const myClient = chainClient();
    try {
        dataSendToAccount = encodeFunctionData({
            abi: abis.sendTransaction,
            functionName: "sendTransaction",
            args: [
                to,
                amount,
                data,
                detectEstimatedFee + l1DataFee,
                passwdAddr,
                signature,
            ],
        });

        console.log(
            "22 total fee = txFee+L1DataFee =",
            detectEstimatedFee,
            "+",
            l1DataFee
        );

        // console.log("dataSendToAccount:", dataSendToAccount);

        if (onlyQueryFee) {
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
            });

            // console.log("xxxxxxx---3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req2:", request);
                throw Error("unsupport prepare req2!");
            }

            console.log(
                `createTransaction detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "createTransaction detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );

            const _l1DataFee = await getL1DataFee(
                myClient,
                encodePacked(
                    // from,to,value,data,nonce,gasPrice,gasLimit
                    [
                        "address",
                        "address",
                        "uint256",
                        "bytes",
                        "uint256",
                        "uint256",
                        "uint256",
                    ],
                    [
                        myClient.account?.address,
                        accountAddr,
                        BigInt(0),
                        dataSendToAccount,
                        BigInt(999999),
                        BigInt(999999999),
                        BigInt(99999),
                    ]
                )
            );

            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: _l1DataFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log("createTransaction success:", hash);
            return { success: true, tx: hash, msg: "" };
        }
    } catch (e) {
        console.log("createTransaction error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

export async function changePasswdAddr(
    bigBrotherOwnerId: `0x${string}`,
    bigBrotherAccountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint
) {
    console.log(
        `changePaswdAddr called ... bigBrotherOwnerId= ${bigBrotherOwnerId},bigBrotherAccountAddr=${bigBrotherAccountAddr}, newPasswdAddr=${newPasswdAddr},newQuestionNos=${newQuestionNos},detectEstimatedFee=${detectEstimatedFee},onlyQueryFee=${onlyQueryFee}`
    );
    let chgPasswdData = null;
    let request = null;
    let hash = "";
    const myClient = chainClient();
    try {
        chgPasswdData = encodeFunctionData({
            abi: abis.chgPasswdAddr,
            functionName: "chgPasswdAddr",
            args: [
                newPasswdAddr,
                newQuestionNos,
                detectEstimatedFee,
                passwdAddr,
                signature,
            ],
        });

        if (onlyQueryFee) {
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
            });

            // console.log("xxxxxxx---3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx-chgpasswd---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx-chgpasswd---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req2XX:", request);
                throw Error("unsupport prepare req2XX!");
            }

            console.log(
                `changePaswdAddr detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "changePaswdAddr detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );

            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log("chgPasswdAddr success:", hash);
            return { success: true, tx: hash, msg: "" };
        }
    } catch (e) {
        console.log("chgPasswdAddr error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

//////////////////

//////////////////

/////////////////  **************************

///////////////

export async function transferETHXXXXX(
    ownerId: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    passwdAddr: `0x${string}`,
    nonce: bigint,
    signature: `0x${string}`
) {
    console.log(`transferETH called ... ownerId= ${ownerId}, amount=${amount}`);
    var callAccountData;

    try {
        callAccountData = encodeFunctionData({
            abi: abis.transferETH,
            functionName: "transferETH",
            args: [to, amount, passwdAddr, nonce, signature],
        });

        console.log("transferETH , _execute");
        const hash = await _execute(ownerId, callAccountData);

        console.log(`transferETH finished, transHash=${hash}`);
        return hash;
    } catch (e) {
        console.log("transferETH error:passwdAddr=" + passwdAddr + ":", e);
        return popularAddr.ZERO_ADDRError;
    }
}

export async function chgPasswdAddrXXXX(
    ownerId: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: string,
    passwdAddr: `0x${string}`,
    nonce: bigint,
    signature: `0x${string}`
) {
    console.log(
        `chgPasswdAddr called ... ownerId= ${ownerId}, newPasswdAddr=${newPasswdAddr}`
    );
    var callAccountData;

    try {
        callAccountData = encodeFunctionData({
            abi: abis.chgPasswdAddr,
            functionName: "chgPasswdAddr",
            args: [newPasswdAddr, newQuestionNos, passwdAddr, nonce, signature],
        });

        console.log("chgPasswdAddr , _execute");
        const hash = await _execute(ownerId, callAccountData);

        console.log(`chgPasswdAddr finished, transHash=${hash}`);
        return hash;
    } catch (e) {
        console.log("chgPasswdAddr error:passwdAddr=" + passwdAddr + ":", e);
        return popularAddr.ZERO_ADDRError;
    }
}

async function _execute(
    ownerId: `0x${string}`,
    callAccountData: `0x${string}`
) {
    console.log(
        `_execute ownerId=${ownerId}, callAccountData= ${callAccountData}`
    );
    var callAdminData = encodeFunctionData({
        abi: abis.execute,
        functionName: "execute",
        args: [ownerId, callAccountData, BigInt(10)],
    });

    console.log(`_execute callAdminData= ${callAdminData}`);

    const eGas = await chainClient().publicClient.estimateGas({
        account: chainClient().account,
        to: chainClient().factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });

    // estimate transaction fee.
    const request = await chainClient().walletClient.prepareTransactionRequest({
        account: chainClient().account,
        to: chainClient().factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });

    const preGasFee = request.gas * request.maxFeePerGas;
    console.log("+++++preGasFee:", preGasFee, eGas, request.gas);

    callAdminData = encodeFunctionData({
        abi: abis.execute,
        functionName: "execute",
        args: [ownerId, callAccountData, preGasFee],
    });

    const hash = await chainClient().walletClient.sendTransaction({
        account: chainClient().account,
        to: chainClient().factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });
    console.log(`_execute hash=${hash}`);
    return hash;
}
