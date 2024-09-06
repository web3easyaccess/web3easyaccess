async function estimateTransFee(
    myOwnerId: string,
    myContractAccount: string,
    passwdAccount: any,
    receiverAddr: string,
    receiverAmountETH: string,
    receiverData: string,
    chainObj: any,
    myAccountCreated: boolean,
    questionNos: string,
    preparedPriceRef: any
) {
    let myDetectEstimatedFee = BigInt(0);
    let myL1DataFee = BigInt(0);
    const receiverAmt = parseEther(receiverAmountETH);
    console.log(
        "estimateTransFee...",
        myOwnerId,
        myContractAccount,
        "myAccountCreated=" + myAccountCreated
    );
    let detectRes: {
        realEstimatedFee: bigint;
        l1DataFee: bigint;
        maxFeePerGas: bigint; //eip-1559
        gasPrice: bigint; // Legacy
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};
    for (let k = 0; k < 15; k++) {
        let argumentsHash = encodeAbiParameters(
            [
                { name: "funcId", type: "uint256" },
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "data", type: "bytes" },
                { name: "estimatedFee", type: "uint256" },
            ],
            [
                BigInt(3),
                receiverAddr,
                receiverAmt,
                receiverData,
                myDetectEstimatedFee + myL1DataFee,
            ]
        );
        console.log("encodeAbiParameters2222:", argumentsHash);
        argumentsHash = keccak256(argumentsHash);
        console.log("encodeAbiParameters3333:", argumentsHash);
        let chainId = chainObj.id;
        let withZeroNonce = !myAccountCreated;
        const sign = await signAuth(
            passwdAccount,
            chainId,
            myContractAccount,
            chainObj,
            argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" //
            withZeroNonce
        );

        const onlyQueryFee = true;

        if (myAccountCreated) {
            console.log(
                "account has created, do createTransaction0:",
                myOwnerId,
                myContractAccount
            );
            detectRes = await createTransaction(
                myOwnerId,
                myContractAccount,
                passwdAccount.address,
                receiverAddr,
                receiverAmt,
                receiverData,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                myL1DataFee,
                BigInt(0),
                BigInt(0)
            );
        } else {
            console.log(
                "account has not created, do newAccountAndTrans0:",
                myOwnerId,
                myContractAccount
            );
            detectRes = await newAccountAndTransferETH(
                myOwnerId,
                passwdAccount.address,
                questionNos,
                receiverAddr,
                receiverAmt,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                myL1DataFee,
                BigInt(0),
                BigInt(0)
            );
        }

        if (!detectRes.success) {
            return { feeDisplay: "ERROR: " + detectRes.msg };
        }
        console.log(
            "myDetectEstimatedFee=" + myDetectEstimatedFee,
            "myL1DataFee=" + myL1DataFee,
            "query estimatedFee detect,k=" + k + ",result:",
            detectRes
        );
        if (Number(myDetectEstimatedFee) > Number(detectRes.realEstimatedFee)) {
            preparedPriceRef.current = {
                preparedMaxFeePerGas: detectRes.maxFeePerGas,
                preparedGasPrice: detectRes.gasPrice,
            };
            myL1DataFee = detectRes.l1DataFee;
            break;
        } else {
            myDetectEstimatedFee = BigInt(
                Number(detectRes.realEstimatedFee) +
                    Number(
                        detectRes.maxFeePerGas != undefined &&
                            detectRes.maxFeePerGas > 0
                            ? detectRes.maxFeePerGas
                            : detectRes.gasPrice
                    ) *
                        1000
            );
            myL1DataFee = detectRes.l1DataFee;
        }
    }
    const feeDisplay =
        formatEther(myDetectEstimatedFee + detectRes.l1DataFee) + " ETH";
    return {
        ...detectRes,
        feeDisplay,
        feeWei: myDetectEstimatedFee,
        l1DataFeeWei: detectRes.l1DataFee,
    };
}

async function executeTransaction(
    myOwnerId: string,
    myContractAccount: string,
    passwdAccount: any,
    receiverAddr: string,
    receiverAmountETH: string,
    receiverData: string,
    chainObj: any,
    myAccountCreated: boolean,
    questionNos: string,
    preparedPriceRef: any
) {
    let eFee = await estimateTransFee(
        myOwnerId,
        myContractAccount,
        passwdAccount,
        receiverAddr,
        receiverAmountETH,
        receiverData,
        chainObj,
        myAccountCreated,
        questionNos,
        preparedPriceRef
    );
    console.log("user realtime fee, when executeing:", eFee);
    if (eFee.feeWei == undefined || eFee.feeWei == 0) {
        throw Error("estimateTransFee realtime fee ERROR.");
    }
    const receiverAmt = parseEther(receiverAmountETH);

    let argumentsHash = encodeAbiParameters(
        [
            { name: "funcId", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "data", type: "bytes" },
            { name: "estimatedFee", type: "uint256" },
        ],
        [
            BigInt(3),
            receiverAddr,
            receiverAmt,
            receiverData,
            eFee.feeWei + eFee.l1DataFeeWei,
        ]
    );
    console.log("encodeAbiParameters2222aaa:", argumentsHash);
    argumentsHash = keccak256(argumentsHash);
    console.log("encodeAbiParameters3333bbb:", argumentsHash);
    let chainId = chainObj.id;
    let withZeroNonce = !myAccountCreated;
    const sign = await signAuth(
        passwdAccount,
        chainId,
        myContractAccount,
        chainObj,
        argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" //
        withZeroNonce
    );

    let detectRes: {
        realEstimatedFee: bigint;
        l1DataFee: bigint;
        preparedMaxfeePerGas: bigint;
        preparedGasPrice: bigint;
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};

    const onlyQueryFee = false;

    if (myAccountCreated) {
        console.log(
            "account has created, do createTransaction:",
            myOwnerId,
            myContractAccount
        );
        detectRes = await createTransaction(
            myOwnerId,
            myContractAccount,
            passwdAccount.address,
            receiverAddr,
            receiverAmt,
            receiverData,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            eFee.l1DataFeeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice
        );
    } else {
        console.log(
            "account has not created, do newAccountAndTrans:",
            myOwnerId,
            myContractAccount
        );
        detectRes = await newAccountAndTransferETH(
            myOwnerId,
            passwdAccount.address,
            questionNos,
            receiverAddr,
            receiverAmt,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            eFee.l1DataFeeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice
        );
    }

    if (!detectRes.success) {
        console.log("ERROR:", detectRes);
        return "ERROR: " + detectRes.msg;
    }

    console.log("detectRes.tx=" + detectRes.tx);
    return detectRes.tx;
}
