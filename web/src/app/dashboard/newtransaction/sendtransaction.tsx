"use client";

import { signAuth } from "../privateinfo/lib/signAuthTypedData";

import {
    getOwnerIdBigBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "../privateinfo/lib/keyTools";

import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../../lib/myRandom";

import { aesEncrypt, aesDecrypt } from "../../lib/crypto.mjs";

import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
    formatEther,
    encodeFunctionData,
    parseAbiItem,
} from "viem";

import { chainPublicClient } from "../../lib/chainQueryClient";

import abis from "../../serverside/blockchain/abi/abis";

import React, { useState, useEffect, useRef } from "react";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";

import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/react";
import { Switch } from "@nextui-org/react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image,
    Input,
    Tabs,
    Tab,
    Checkbox,
} from "@nextui-org/react";

import { useFormState, useFormStatus } from "react-dom";

import { useRouter } from "next/navigation";
import { getOwnerIdSelfByBigBrother } from "../privateinfo/lib/keyTools";
import {
    queryAccount,
    queryQuestionIdsEnc,
    queryTokenDetail,
    queryNftDetail,
    queryNftsOwnerUri,
    formatUnits,
    parseUnits,
    queryEthBalance,
} from "../../lib/chainQuery";
import { getInputValueById, setInputValueById } from "../../lib/elementById";
import {
    newTransaction,
    createAccountAndSendTransaction,
} from "../../serverside/serverActions";

import {
    newAccountAndTransferETH,
    createTransaction,
} from "../../serverside/blockchain/chainWrite";

import { PrivateInfo } from "./privateinfo";

import { getChainObj } from "../../lib/myChain";

import { SelectedChainIcon } from "../../navbar/chainIcons";

import { Menu, UserInfo, uiToString, Transaction } from "../../lib/myTypes";

import lineaBridge from "./bridge/lineaBridge";
import { factory } from "typescript";

const questionNosEncode = (qNo1: string, qNo2: string, pin: string) => {
    let questionNosEnc = qNo1 + qNo2 + generateRandomString();
    console.log("questionNosEnc1:", questionNosEnc);
    questionNosEnc = aesEncrypt(questionNosEnc, pin);
    console.log("questionNosEnc2:", questionNosEnc);
    return questionNosEnc;
};

export default function App({
    currentUserInfo,
}: {
    currentUserInfo: UserInfo;
}) {
    const router = useRouter();

    const chainObj = getChainObj(currentUserInfo.chainCode);
    const explorerUrl = chainObj.blockExplorers.default.url;

    let l1Chain = null; // it will be not null if current chain is a L2 chain.
    if (chainObj.l1ChainCode != "" && chainObj.l1ChainCode != undefined) {
        l1Chain = getChainObj(chainObj.l1ChainCode);
    }
    // console.log("xxxx:l1Chain:", chainObj.l1ChainCode, l1Chain);
    const bridgeProps = {
        title: `Bridge between [${l1Chain?.name}] and [${chainObj.name}]`,
        isShow:
            l1Chain != null &&
            // 下面这个临时限制为只支持 LINEA_TEST_CHAIN
            currentUserInfo.chainCode == "LINEA_TEST_CHAIN",
        l1ChainCode: l1Chain != null ? l1Chain.chainCode : "",
        l2ChainCode: l1Chain != null ? chainObj.chainCode : "",
    };
    const [bridgeL1ToL2, setBridgeL1ToL2] = useState(true);
    const [bridgeBalanceInfo, setBridgeBalanceInfo] = useState({
        l1Balance: "-",
        l2Balance: "-",
    });

    console.log(
        "======++++++++++++000:",
        bridgeProps.l1ChainCode,
        currentUserInfo
    );

    const currentTabTagRef = useRef("sendETH");
    const [currentTabShow, setCurrentTabShow] = useState(
        currentTabTagRef.current
    );

    const bridgeTxList = [];
    let kk = 0;

    useEffect(() => {
        // l1Balance
        const refreshBalance = async () => {
            if (currentUserInfo.selectedAccountAddr != "") {
                console.log(
                    "======++++++++++++:",
                    bridgeProps.l1ChainCode,
                    currentUserInfo
                );
                const b1 = await queryEthBalance(
                    bridgeProps.l1ChainCode,
                    currentUserInfo.factoryAddr,
                    currentUserInfo.selectedAccountAddr
                );
                const b2 = await queryEthBalance(
                    bridgeProps.l2ChainCode,
                    currentUserInfo.factoryAddr,
                    currentUserInfo.selectedAccountAddr
                );
                setBridgeBalanceInfo({
                    l1Balance: "" + b1,
                    l2Balance: "" + b2,
                });
            }
        };

        console.log("xxxxxx110A");
        if (bridgeL1ToL2 == false) {
            alert("current not supported: bridging from L2 to L1!");
            setBridgeL1ToL2(true);
            return;
        }
        console.log("xxxxxx110B");
        //
        refreshBalance();

        console.log("xxxxxx110C:", bridgeL1ToL2, currentTabTagRef.current);
        if (bridgeL1ToL2 && currentTabTagRef.current == "bridgeL2AndL1") {
            console.log("xxxxxx111:");
            setInterval(async () => {
                const cpc = chainPublicClient(
                    bridgeProps.l1ChainCode,
                    currentUserInfo.factoryAddr
                );
                console.log(
                    "xxxxxx112:",
                    lineaBridge.getL1MessageServiceContract(
                        bridgeProps.l1ChainCode
                    ),
                    cpc
                );
                const logs = await cpc.publicClient.getLogs({
                    address: lineaBridge
                        .getL1MessageServiceContract(bridgeProps.l1ChainCode)
                        .toLowerCase(),
                    // event: {
                    //     name: "MessageSent",
                    //     inputs: [
                    //         { type: "address", indexed: true, name: "_from" },
                    //         { type: "address", indexed: true, name: "_to" },
                    //         { type: "uint256", indexed: false, name: "_fee" },
                    //         { type: "uint256", indexed: false, name: "_value" },
                    //         { type: "uint256", indexed: false, name: "_nonce" },
                    //         {
                    //             type: "bytes",
                    //             indexed: false,
                    //             name: "_calldata",
                    //         },
                    //         {
                    //             type: "bytes32",
                    //             indexed: true,
                    //             name: "_messageHash",
                    //         },
                    //     ],
                    // },
                    event: parseAbiItem(
                        "event MessageSent(address indexed _from,address indexed _to,uint256 _fee,uint256 _value,uint256 _nonce,bytes _calldata,bytes32 _messageHash)"
                    ),
                    // args: {
                    //     _from: "0xed2d5c55883142A1a2f45f7a3379f6f349CF6561",
                    //     _to: "0xed2d5c55883142A1a2f45f7a3379f6f349CF6561",
                    // },
                    fromBlock: BigInt(6646393),
                    toBlock: BigInt(6646394),
                });
                // 这里args里需要同时输入 from、to、messagehash才行，不可行。transactionHash也不能作为参数。 只能事先根据自己的transactionHash找到所在的fromBlock，然后找出这里所有的event，然后后面根据from和to进行过滤.

                console.log("xxxxxx113:", logs);
            }, 1000 * 6);
        }
    }, [
        bridgeL1ToL2,
        setBridgeL1ToL2,
        currentUserInfo.selectedAccountAddr,
        setCurrentTabShow,
        currentTabShow,
    ]);

    const handleSelectionChage = (e: any) => {
        currentTabTagRef.current = e.toString();
        setCurrentTabShow(currentTabTagRef.current);
        setPrivateFillInOk(0);
        refreshButtonText();
    };

    const readReceiverInfo = () => {
        let receiverAddr = "";
        let amount = "";
        let tokenAddr = "";
        let amountDecimals = 18;
        let nftId = "";
        let bridgeDirection = "";
        if (currentTabTagRef.current == "sendETH") {
            receiverAddr = getInputValueById("id_newtrans_receiver_addr_ui");
            amount = getInputValueById("id_newtrans_amount_ui");
        } else if (currentTabTagRef.current == "sendToken") {
            receiverAddr = getInputValueById(
                "id_newtrans_receiver_addr_ui_token"
            );
            amount = getInputValueById("id_newtrans_amount_ui_token");
            tokenAddr = getInputValueById("id_newtrans_token_addr_ui_token");
            amountDecimals = Number(tokenDetail.decimals);
            if (tokenAddr == "") {
                tokenAddr = "NULL";
            }
        } else if (currentTabTagRef.current == "sendNFT") {
            receiverAddr = getInputValueById(
                "id_newtrans_receiver_addr_ui_nft"
            );
            // it is nftId here.
            nftId = getInputValueById("id_newtrans_nftId_ui_nft");
            tokenAddr = getInputValueById("id_newtrans_token_addr_ui_nft");
            if (tokenAddr == "") {
                tokenAddr = "NULL";
            }
        } else if (currentTabTagRef.current == "bridgeL2AndL1") {
            receiverAddr = currentUserInfo.selectedAccountAddr;
            amount = getInputValueById("id_newtrans_amount_ui_bridge");
            //
            //
            // tokenAddr == a contract which interact with it
            if (bridgeL1ToL2) {
                bridgeDirection = "L1ToL2";
                tokenAddr = lineaBridge.getL1MessageServiceContract(
                    bridgeProps.l1ChainCode
                );
            } else {
                bridgeDirection = "L2ToL1";
                tokenAddr = lineaBridge.getL2MessageServiceContract(
                    bridgeProps.l2ChainCode
                );
            }
        }

        return {
            receiverAddr: receiverAddr,
            amount: amount,
            tokenAddr: tokenAddr, // it is nft address when sendNFT.
            amountDecimals: amountDecimals,
            nftId: nftId,
            bridgeDirection: bridgeDirection,
        };
    };

    const [privateinfoHidden, setPrivateinfoHidden] = useState(false);

    const [buttonText, setButtonText] = useState("Send ETH");

    const bigBrotherAccountCreated = () => {
        return currentUserInfo.accountAddrList.length > 1;
    };
    const [privateFillInOk, setPrivateFillInOk] = useState(0);

    const refreshButtonText = () => {
        let msg = "Send ETH";
        if (currentTabTagRef.current == "sendETH") {
            if (myAccountCreated) {
                msg = "Send ETH";
            } else {
                // todo it's different when create other account.
                msg = "Create Account and Send ETH";
            }
        } else if (currentTabTagRef.current == "sendToken") {
            if (myAccountCreated) {
                msg = "Send Token";
            } else {
                // todo it's different when create other account.
                msg = "Create Account and Send Token";
            }
        } else if (currentTabTagRef.current == "sendNFT") {
            if (myAccountCreated) {
                msg = "Send NFT";
            } else {
                // todo it's different when create other account.
                msg = "Create Account and Send NFT";
            }
        } else if (currentTabTagRef.current == "bridgeL2AndL1") {
            if (bridgeL1ToL2) {
                msg = "Bridge from L1 to L2";
            } else {
                msg = "Bridge from L2 to L1";
            }
        } else {
        }

        console.log(
            "refreshButtonText, currentTabTag:",
            currentTabTagRef.current
        );
        setButtonText(msg);
    };

    const updateFillInOk = () => {
        let x = privateFillInOk;
        setPrivateFillInOk(x + 1);

        console.log("updateFillInOk, currentTabTag:", currentTabTagRef.current);
        // Send transactions while creating an account
        refreshButtonText();
    };

    const [inputFillInChange, setInputFillInChange] = useState(0);
    const updateInputFillInChange = () => {
        let x = inputFillInChange + 1;
        setInputFillInChange(x);

        refreshButtonText();
    };

    const shortAddr = (aa: string) => {
        if (aa == undefined || aa == null) {
            return "";
        }
        return aa.substring(0, 6) + " ... " + aa.substring(aa.length - 4);
    };

    const [tokenDetail, setTokenDetail] = useState({
        tokenAddress: "",
        symbol: "",
        name: "",
        totalSupply: "0",
        myBalance: "0",
        decimals: "0",
    });

    const tokenAddressBlur = async () => {
        const addr = getInputValueById("id_newtrans_token_addr_ui_token");
        setTokenDetail({
            tokenAddress: "",
            symbol: "Waiting ... ",
            name: "",
            totalSupply: "0",
            myBalance: "0",
            decimals: "0",
        });

        const detail = await queryTokenDetail(
            currentUserInfo.chainCode,
            currentUserInfo.factoryAddr,
            addr,
            currentUserInfo.selectedAccountAddr
        );

        console.log("tokenAddressBlur:", detail);
        setTokenDetail(detail);

        updateInputFillInChange();
    };

    const [nftDetail, setNftDetail] = useState({
        nftAddress: "",
        symbol: "",
        name: "",
        myBalance: "0",
        tokenUri: "",
        tokenIdMsg: "",
    });

    const nftAddressBlur = async () => {
        const addr = getInputValueById("id_newtrans_token_addr_ui_nft");
        setNftDetail({
            nftAddress: "",
            symbol: "Waiting ... ",
            name: "",
            myBalance: "0",
            tokenUri: "",
            tokenIdMsg: "",
        });

        const detail = await queryNftDetail(
            currentUserInfo.chainCode,
            currentUserInfo.factoryAddr,
            addr,
            currentUserInfo.selectedAccountAddr
        );

        detail.tokenUri = "";
        detail.tokenIdMsg = "";

        console.log("nftAddressBlur:", detail);
        setNftDetail(detail);

        updateInputFillInChange();
    };

    const nftIdBlur = async () => {
        const nftAddr = getInputValueById("id_newtrans_token_addr_ui_nft");
        const nftId = getInputValueById("id_newtrans_nftId_ui_nft");
        const { ownerAddr, tokenUri } = await queryNftsOwnerUri(
            currentUserInfo.chainCode,
            currentUserInfo.factoryAddr,
            nftAddr,
            BigInt(nftId)
        );

        let tokenIdMsg = "";
        if (
            ownerAddr.toLowerCase() !=
            currentUserInfo.selectedAccountAddr.toLowerCase()
        ) {
            tokenIdMsg = `ERROR: NFT ID[${nftId}] is not yours!`;
        } else {
            updateInputFillInChange();
        }

        setNftDetail({
            ...nftDetail,
            tokenUri: tokenUri as string,
            tokenIdMsg: tokenIdMsg,
        });
    };

    const [myAccountCreated, setMyAccountCreated] = useState(false);

    const piInit: PrivateInfoType = {
        email: "",
        pin: "",
        question1answer: "",
        question2answer: "",
        firstQuestionNo: "01",
        secondQuestionNo: "01",
        confirmedSecondary: true,
    };
    const currentPriInfoRef = useRef(piInit);
    const oldPriInfoRef = useRef(piInit);

    // const [myPrivateInfo, setMyPrivateInfo] = useState({
    //     email: "",
    //     pin: "",
    //     questionNos: "",
    //     question1answer: "",
    //     question2answer: "",
    //     bigBrotherCreated: true,
    // });
    // const myPrivateInfoRef = useRef(myPrivateInfo);
    // const updateTransactionByPriInfo = (private_info: any) => {
    //     setMyPrivateInfo(private_info);
    //     myPrivateInfoRef.current = private_info;
    // };

    const [currentTx, setCurrentTx] = useState("");
    const updateCurrentTx = (tx: string) => {
        setCurrentTx(tx);
        router.push("/dashboard/transactions");
    };

    const preparedPriceRef = useRef({
        preparedMaxFeePerGas: undefined,
        preparedGasPrice: undefined,
    });
    const [transactionFee, setTransactionFee] = useState("? ETH");

    useEffect(() => {
        const refreshFee = async () => {
            console.log("please waiting ...1");
            setTransactionFee("Please Waiting ... ");
            setPrivateinfoHidden(false);
            try {
                const {
                    receiverAddr,
                    amount,
                    tokenAddr,
                    amountDecimals,
                    nftId,
                    bridgeDirection,
                } = readReceiverInfo();
                console.log(
                    `readReceiverInfo, tokenAddr=${tokenAddr}, nftId=${nftId}`
                );

                if (
                    receiverAddr != "" &&
                    (amount != "" || nftId != "") &&
                    currentPriInfoRef.current.email != "" &&
                    currentPriInfoRef.current.pin != "" &&
                    currentPriInfoRef.current.question1answer != "" &&
                    currentPriInfoRef.current.question2answer != "" &&
                    currentPriInfoRef.current.confirmedSecondary == true
                ) {
                    const passwdAccount = getPasswdAccount(
                        currentPriInfoRef.current
                    );

                    const questionNosEnc = questionNosEncode(
                        currentPriInfoRef.current.firstQuestionNo,
                        currentPriInfoRef.current.secondQuestionNo,
                        currentPriInfoRef.current.pin
                    );

                    let eFee;
                    if (
                        tokenAddr != undefined &&
                        tokenAddr != null &&
                        tokenAddr.length > 2
                    ) {
                        let amountETH = "0";
                        let transferTokenData;
                        let theAccountCreated = myAccountCreated;

                        if (bridgeDirection != "") {
                            // bridge between L1 and L2linea.
                            const packedRes = lineaBridge.packDataOfBridgingETH(
                                bridgeDirection,
                                receiverAddr,
                                amount
                            );
                            transferTokenData = packedRes.data;
                            amountETH = packedRes.amountETH;

                            if (bridgeDirection == "L1ToL2") {
                                const acct = await queryAccount(
                                    bridgeProps.l1ChainCode,
                                    currentUserInfo.factoryAddr,
                                    currentUserInfo.selectedOwnerId
                                );
                                theAccountCreated = acct.created;
                            }
                        } else if (nftId != "") {
                            // transfer NFT
                            console.log("nft transer From ...");
                            transferTokenData = encodeFunctionData({
                                abi: abis.transferFrom,
                                functionName: "transferFrom",
                                args: [
                                    currentUserInfo.selectedAccountAddr,
                                    receiverAddr,
                                    BigInt(nftId),
                                ],
                            });
                        } else {
                            // transfer ERC20
                            // to address, value uint256;
                            transferTokenData = encodeFunctionData({
                                abi: abis.transfer,
                                functionName: "transfer",
                                args: [
                                    receiverAddr,
                                    parseUnits(amount, amountDecimals),
                                ],
                            });
                        }

                        eFee = await estimateTransFee(
                            currentUserInfo.selectedOwnerId,
                            currentUserInfo.selectedAccountAddr,
                            passwdAccount,
                            tokenAddr, // it maybe a bridge message contract when bridging.
                            amountETH,
                            transferTokenData,
                            chainObj,
                            theAccountCreated,
                            questionNosEnc,
                            preparedPriceRef,
                            bridgeDirection
                        );
                    } else {
                        // transfer ETH
                        eFee = await estimateTransFee(
                            currentUserInfo.selectedOwnerId,
                            currentUserInfo.selectedAccountAddr,
                            passwdAccount,
                            receiverAddr,
                            amount,
                            "",
                            chainObj,
                            myAccountCreated,
                            questionNosEnc,
                            preparedPriceRef,
                            bridgeDirection
                        );
                    }

                    console.log(",estimateTransFee...:" + eFee);
                    if (eFee.feeDisplay.indexOf("ERROR") >= 0) {
                        console.log(
                            "[ERROR]:" +
                                eFee.feeDisplay +
                                "....currentPriInfoRef.current:",
                            currentPriInfoRef.current
                        );
                    } else {
                        setPrivateinfoHidden(true);
                        if (privateFillInOk == 0) {
                            updateFillInOk();
                        }
                    }

                    let feePrice = "...";
                    try {
                        feePrice =
                            "(gasPrice=" +
                            Number(
                                preparedPriceRef.current.preparedMaxFeePerGas >
                                    0
                                    ? preparedPriceRef.current
                                          .preparedMaxFeePerGas
                                    : preparedPriceRef.current.preparedGasPrice
                            ) /
                                1e9 +
                            " Gwei)";
                    } catch (e) {
                        console.log("eee1:", e);
                    }
                    setTransactionFee(eFee.feeDisplay + feePrice);
                } else {
                    setTransactionFee("? ETH.");
                }
            } catch (e) {
                let feePrice = "...";
                try {
                    feePrice =
                        "(gasPrice=" +
                        Number(
                            preparedPriceRef.current.preparedMaxFeePerGas > 0
                                ? preparedPriceRef.current.preparedMaxFeePerGas
                                : preparedPriceRef.current.preparedGasPrice
                        ) /
                            1e9 +
                        " Gwei)";
                } catch (e) {
                    console.log("eee:", e);
                }

                console.log("seek error:", e);
                let kk = e.toString().indexOf(" ");
                setTransactionFee(e.toString().substring(0, kk) + feePrice);
            }
        };

        //
        refreshFee();
    }, [
        privateFillInOk,
        setPrivateFillInOk,
        inputFillInChange,
        setInputFillInChange,
    ]);

    //   const privateInfo: PrivateInfoType = {
    //     email: email,
    //     pin: pin1,
    //     question1answer: question1_answer_1,
    //     question2answer: question2_answer_1,
    //   };

    // className="max-w-[400px]"

    useEffect(() => {
        // init this component page.
        // console.log("init ...xxx...");
        // setCurrentTabTag("sendETH");
        // setPrivateinfoHidden(false);
        // setPrivateFillInOk(0);
        // setButtonText("Send ETH");
        // setInputFillInChange(0);
        // currentPriInfoRef.current = piInit;
        // oldPriInfoRef.current = piInit;
        // setCurrentTx("");
        // inputMaxFeePerGasRef.current = "0";
        // setTransactionFee("? ETH");
        //
        //

        const fetchMyAccountStatus = async () => {
            // suffix with 0000
            const acct = await queryAccount(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.selectedOwnerId
            );
            console.log(
                "my Account for new transaction:",
                acct,
                currentUserInfo.selectedOwnerId,
                currentUserInfo.bigBrotherOwnerId
            );
            if (acct.accountAddr != currentUserInfo.selectedAccountAddr) {
                console.log(
                    "develop error!",
                    currentUserInfo.bigBrotherOwnerId,
                    currentUserInfo.selectedAccountAddr,
                    currentUserInfo.selectedOwnerId,
                    acct.accountAddr
                );
                throw new Error("develop error2!");
            }
            setMyAccountCreated(acct?.created);
        };
        if (currentUserInfo.selectedAccountAddr != "") {
            fetchMyAccountStatus();
        }
    }, [
        currentUserInfo,
        currentUserInfo.selectedAccountAddr,
        currentUserInfo.chainCode,
    ]);

    return (
        <>
            <div id="var_tmp" style={{ display: "none" }}>
                <input id="id_estimateTransFeeTriggerText" />
                <input id="id_estimateTransFeeTriggerTime" />
                <input id="id_qCount" />
                <input id="id_lastError" />
            </div>
            <Tabs
                aria-label="Options"
                onSelectionChange={handleSelectionChage}
                selectedKey={currentTabTagRef.current}
                defaultSelectedKey={currentTabTagRef.current}
            >
                <Tab key="sendETH" title="Send ETH">
                    <div className="w-x-full flex flex-col gap-4">
                        <div
                            className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                            style={{ width: "500px" }}
                        >
                            <Input
                                id="id_newtrans_receiver_addr_ui"
                                type="text"
                                variant={"bordered"}
                                label="Receiver Address"
                                placeholder="Enter your Receiver Address"
                                onBlur={updateInputFillInChange}
                            />
                        </div>
                        <div
                            className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                            style={{ width: "500px" }}
                        >
                            <Input
                                id="id_newtrans_amount_ui"
                                type="text"
                                variant={"bordered"}
                                label="Amount"
                                placeholder="Enter your Amount"
                                onBlur={updateInputFillInChange}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab key="sendToken" title="Send Token">
                    <div style={{ display: "flex" }}>
                        <div className="w-x-full flex flex-col gap-4">
                            <div
                                className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_token_addr_ui_token"
                                    type="text"
                                    color="primary"
                                    variant="underlined"
                                    label="Token(ERC20) Address"
                                    placeholder="Enter Token Address"
                                    onBlur={tokenAddressBlur}
                                />
                            </div>
                            <div
                                className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_receiver_addr_ui_token"
                                    type="text"
                                    variant={"bordered"}
                                    label="Receiver Address"
                                    placeholder="Enter your Receiver Address"
                                    onBlur={updateInputFillInChange}
                                />
                            </div>
                            <div
                                className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_amount_ui_token"
                                    type="text"
                                    variant={"bordered"}
                                    label="Amount"
                                    placeholder="Enter your Amount"
                                    onBlur={updateInputFillInChange}
                                />
                            </div>
                        </div>
                        <Card
                            className="w-[360px]"
                            style={{ marginLeft: "10px" }}
                        >
                            <CardHeader className="flex gap-3">
                                {/* <Image
                                    alt="nextui logo"
                                    height={40}
                                    radius="sm"
                                    src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                    width={40}
                                /> */}
                                <div className="flex flex-col">
                                    <p className="text-md">
                                        {tokenDetail.symbol}
                                    </p>
                                    <p className="text-small text-default-500">
                                        {tokenDetail.name}
                                    </p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <Link
                                    isExternal
                                    showAnchorIcon
                                    href={
                                        explorerUrl +
                                        "/token/" +
                                        tokenDetail.tokenAddress
                                    }
                                    style={
                                        tokenDetail.tokenAddress == ""
                                            ? { display: "none" }
                                            : {}
                                    }
                                >
                                    {shortAddr(tokenDetail.tokenAddress)}
                                </Link>
                            </CardBody>
                            <Divider />
                            <CardBody>
                                <p>My Balance: {tokenDetail.myBalance}</p>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <p className="text-small text-default-500">
                                    Total Supply: {tokenDetail.totalSupply}
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </Tab>
                <Tab key="sendNFT" title="Send NFT">
                    <div style={{ display: "flex" }}>
                        <div className="w-x-full flex flex-col gap-4">
                            <div
                                className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_token_addr_ui_nft"
                                    type="text"
                                    color="primary"
                                    variant="underlined"
                                    label="NFT(ERC721) Address"
                                    placeholder="Enter NFT Address"
                                    onBlur={nftAddressBlur}
                                />
                            </div>
                            <div
                                className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_receiver_addr_ui_nft"
                                    type="text"
                                    variant={"bordered"}
                                    label="Receiver Address"
                                    placeholder="Enter your Receiver Address"
                                    onBlur={updateInputFillInChange}
                                />
                            </div>
                            <div
                                className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                                style={{ width: "500px" }}
                            >
                                <Input
                                    id="id_newtrans_nftId_ui_nft"
                                    type="text"
                                    variant={"bordered"}
                                    label="NFT ID"
                                    placeholder="Enter your NFT ID"
                                    onBlur={nftIdBlur}
                                />
                            </div>
                            <div>
                                <label
                                    style={
                                        nftDetail.tokenIdMsg == ""
                                            ? { display: "none" }
                                            : { display: "block" }
                                    }
                                >
                                    {nftDetail.tokenIdMsg}
                                </label>
                            </div>
                        </div>
                        <Card
                            className="w-[360px]"
                            style={{ marginLeft: "10px" }}
                        >
                            <CardHeader className="flex gap-3">
                                {/* <Image
                                    alt="nextui logo"
                                    height={40}
                                    radius="sm"
                                    src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                    width={40}
                                /> */}
                                <div className="flex flex-col">
                                    <p className="text-md">
                                        {nftDetail.symbol}
                                    </p>
                                    <p className="text-small text-default-500">
                                        {nftDetail.name}
                                    </p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <Link
                                    isExternal
                                    showAnchorIcon
                                    href={
                                        explorerUrl +
                                        "/token/" +
                                        nftDetail.nftAddress
                                    }
                                    style={
                                        nftDetail.nftAddress == ""
                                            ? { display: "none" }
                                            : {}
                                    }
                                >
                                    {shortAddr(nftDetail.nftAddress)}
                                </Link>
                            </CardBody>
                            <Divider />
                            <CardBody>
                                <p>My NFT Count: {nftDetail.myBalance}</p>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <Link
                                    isExternal
                                    showAnchorIcon
                                    href={nftDetail.tokenUri}
                                    style={
                                        nftDetail.tokenUri == ""
                                            ? { display: "none" }
                                            : {}
                                    }
                                >
                                    {shortAddr(nftDetail.tokenUri)}
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </Tab>
                <Tab style={{ display: "none" }} key="swap" title="Swap Token">
                    <p>Coming soon...</p>
                </Tab>
                <Tab
                    style={{ display: "none" }}
                    key="createCustomTransaction"
                    title="Create Custom Transaction"
                >
                    <p>Coming soon...</p>
                </Tab>
                <Tab
                    key="bridgeL2AndL1"
                    title={bridgeProps.title}
                    style={
                        bridgeProps.isShow
                            ? { display: "block" }
                            : { display: "none" }
                    }
                >
                    <div style={{ display: "flex" }}>
                        <Switch
                            color="default"
                            size="sm"
                            defaultSelected={bridgeL1ToL2}
                            isSelected={bridgeL1ToL2}
                            onValueChange={setBridgeL1ToL2}
                        />
                        <div>
                            <div className="flex gap-4">
                                <Chip color="secondary" radius="sm" size="lg">
                                    From:
                                </Chip>
                                <SelectedChainIcon
                                    chainCodeState={
                                        bridgeL1ToL2
                                            ? bridgeProps.l1ChainCode
                                            : bridgeProps.l2ChainCode
                                    }
                                ></SelectedChainIcon>
                                <p>{currentUserInfo.selectedAccountAddr}</p>
                                <p>
                                    {bridgeL1ToL2
                                        ? bridgeBalanceInfo.l1Balance
                                        : bridgeBalanceInfo.l2Balance}{" "}
                                    ETH
                                </p>
                            </div>
                            <Divider
                                style={{
                                    marginTop: "10px",
                                    width: "600px",
                                }}
                            />
                            <div
                                className="flex gap-4"
                                style={{ marginTop: "10px" }}
                            >
                                <Chip color="success" radius="sm" size="lg">
                                    To: &nbsp;&nbsp;&nbsp;
                                </Chip>
                                <SelectedChainIcon
                                    chainCodeState={
                                        bridgeL1ToL2
                                            ? bridgeProps.l2ChainCode
                                            : bridgeProps.l1ChainCode
                                    }
                                ></SelectedChainIcon>
                                <p>{currentUserInfo.selectedAccountAddr}</p>
                                <p>
                                    {bridgeL1ToL2
                                        ? bridgeBalanceInfo.l2Balance
                                        : bridgeBalanceInfo.l1Balance}{" "}
                                    ETH
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                        style={{ width: "500px", marginTop: "30px" }}
                    >
                        <p>ETH:</p>
                        <Input
                            id="id_newtrans_amount_ui_bridge"
                            type="text"
                            variant={"bordered"}
                            label="Amount"
                            placeholder="Enter your Amount"
                            onBlur={updateInputFillInChange}
                        />
                    </div>
                    <div style={{ width: "600px", marginTop: "30px" }}>
                        <Table
                            removeWrapper
                            aria-label="Example static collection table"
                        >
                            <TableHeader>
                                <TableColumn style={{ width: "50px" }}>
                                    Send ETH Transaction on L1(Sepolia)
                                </TableColumn>
                                {/* <TableColumn style={{ width: "50px" }}>
                                    Send Timestamp on L1(Sepolia)
                                </TableColumn> */}
                                <TableColumn style={{ width: "50px" }}>
                                    Did L1 transaction exceeded about 21 minutes
                                </TableColumn>
                                <TableColumn style={{ width: "50px" }}>
                                    <label title="Usually, we can only claim the bridged assets on L2 after the L1 transaction exceeds about 21 minutes">
                                        Perform the CLAIM operation on L2
                                    </label>
                                </TableColumn>
                                {/* <TableColumn style={{ width: "50px" }}>
                                    Claim ETH Transaction on L2Linea Sepolia)
                                </TableColumn>
                                <TableColumn style={{ width: "50px" }}>
                                    Transaction Hash on L2
                                </TableColumn> */}
                            </TableHeader>
                            <TableBody>
                                {bridgeTxList.map((tx) => (
                                    <TableRow key={(++kk).toString()}>
                                        <TableCell>
                                            <Link
                                                isExternal
                                                href={""}
                                                color={"danger"}
                                            >
                                                {123}
                                            </Link>
                                        </TableCell>
                                        <TableCell>11 minutes</TableCell>
                                        <TableCell>CLAIM</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Tab>
            </Tabs>
            <div
                style={
                    currentTabTagRef.current == "sendETH" ||
                    currentTabTagRef.current == "sendToken" ||
                    currentTabTagRef.current == "sendNFT" ||
                    currentTabTagRef.current == "bridgeL2AndL1"
                        ? { display: "block" }
                        : { display: "none" }
                }
            >
                <PrivateInfo
                    currentUserInfo={currentUserInfo}
                    forTransaction={true}
                    currentPriInfoRef={currentPriInfoRef}
                    oldPriInfoRef={oldPriInfoRef}
                    updateFillInOk={updateFillInOk}
                    privateinfoHidden={privateinfoHidden}
                ></PrivateInfo>
            </div>
            <div
                style={
                    transactionFee.indexOf("ERROR") >= 0
                        ? {
                              marginTop: "10px",
                              width: "800px",
                              fontWeight: "bold",
                          }
                        : {
                              marginTop: "10px",
                              width: "600px",
                              fontWeight: "bold",
                          }
                }
            >
                <Input
                    readOnly
                    color="secondary"
                    type="text"
                    label="Transaction Fee:"
                    placeholder=""
                    defaultValue={transactionFee}
                    value={transactionFee}
                    radius="sm"
                    style={{ fontWeight: "bold", fontSize: "16px" }}
                />
            </div>
            <div
                style={
                    currentTx != ""
                        ? { display: "block", marginTop: "10px" }
                        : { display: "none" }
                }
            >
                <p>Transaction:</p>
                <Link isExternal href={`/${currentTx}`} showAnchorIcon>
                    {currentTx}
                </Link>
            </div>
            <div
                style={
                    currentTx == undefined || currentTx == ""
                        ? { display: "block" }
                        : { display: "none" }
                }
            >
                <div
                    style={
                        privateFillInOk > 0 &&
                        transactionFee.indexOf("ERROR") < 0
                            ? { display: "block" }
                            : { display: "none" }
                    }
                >
                    <SendTransaction
                        myOwnerId={currentUserInfo.selectedOwnerId}
                        verifyingContract={currentUserInfo.selectedAccountAddr}
                        email={currentUserInfo.email}
                        chainObj={chainObj}
                        buttonText={buttonText}
                        myAccountCreated={myAccountCreated}
                        currentPriInfoRef={currentPriInfoRef}
                        preparedPriceRef={preparedPriceRef}
                        updateCurrentTx={updateCurrentTx}
                        readReceiverInfo={readReceiverInfo}
                        factoryAddr={currentUserInfo.factoryAddr}
                    />
                </div>
            </div>
        </>
    );
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function SendTransaction({
    myOwnerId,
    verifyingContract,
    email,
    chainObj,
    buttonText,
    myAccountCreated,
    currentPriInfoRef,
    preparedPriceRef,
    updateCurrentTx,
    readReceiverInfo,
    factoryAddr,
}: {
    myOwnerId: string;
    verifyingContract: string;
    email: string;
    chainObj: any;
    buttonText: string;
    myAccountCreated: boolean;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    preparedPriceRef: any;
    updateCurrentTx: any;
    readReceiverInfo: any;
    factoryAddr: string;
}) {
    const router = useRouter();
    const { pending } = useFormStatus();

    const handleClick = async (event) => {
        if (pending) {
            event.preventDefault();
            return;
        }

        const {
            receiverAddr,
            amount,
            tokenAddr,
            amountDecimals,
            nftId,
            bridgeDirection,
        } = readReceiverInfo();

        if (
            receiverAddr == null ||
            receiverAddr.trim().length != 42 ||
            receiverAddr.trim().startsWith("0x") == false
        ) {
            alert("Receiver Address invalid!");
            return;
        }
        if (isNaN(parseFloat(amount)) && nftId == "") {
            alert("NFT ID or Amount invalid!");
            return;
        }

        // let pin1 = getInputValueById("id_private_pin_1");
        // let question1_answer_1 = getInputValueById(
        //     "id_private_question1_answer_1"
        // );
        // let question2_answer_1 = getInputValueById(
        //     "id_private_question2_answer_1"
        // );
        if (
            currentPriInfoRef.current.pin == "" ||
            currentPriInfoRef.current.question1answer == "" ||
            currentPriInfoRef.current.question2answer == ""
        ) {
            console.log("private info invalid:", currentPriInfoRef.current);
            alert("please input private info first!");
            return;
        }
        // myOwnerId
        const passwdAccount = getPasswdAccount(currentPriInfoRef.current);

        // keccak256(abi.encode(...));
        console.log("encodeAbiParameters1111zzzz:", receiverAddr, amount);
        let myDetectEstimatedFee = BigInt(0);

        const questionNosEnc = questionNosEncode(
            currentPriInfoRef.current.firstQuestionNo,
            currentPriInfoRef.current.secondQuestionNo,
            currentPriInfoRef.current.pin
        );

        let tx = "";

        if (
            tokenAddr != undefined &&
            tokenAddr != null &&
            tokenAddr.length > 2
        ) {
            let amountETH = "0";
            let transferTokenData;
            let theAccountCreated = myAccountCreated;
            if (bridgeDirection != "") {
                // bridge between L1 and L2linea.
                const packedRes = lineaBridge.packDataOfBridgingETH(
                    bridgeDirection,
                    receiverAddr,
                    amount
                );
                transferTokenData = packedRes.data;
                amountETH = packedRes.amountETH;
                if (bridgeDirection == "L1ToL2") {
                    const acct = await queryAccount(
                        chainObj.l1ChainCode,
                        factoryAddr, // if l1 and l2 's factoryAddr is different, it may be error.
                        myOwnerId
                    );
                    theAccountCreated = acct.created;
                }
            } else if (nftId != "") {
                console.log("nft transer From 2...");
                transferTokenData = encodeFunctionData({
                    abi: abis.transferFrom,
                    functionName: "transferFrom",
                    args: [verifyingContract, receiverAddr, BigInt(nftId)],
                });
            } else {
                // to address, value uint256;
                transferTokenData = encodeFunctionData({
                    abi: abis.transfer,
                    functionName: "transfer",
                    args: [receiverAddr, parseUnits(amount, amountDecimals)],
                });
            }
            tx = await executeTransaction(
                myOwnerId,
                verifyingContract,
                passwdAccount,
                tokenAddr,
                amountETH,
                transferTokenData,
                chainObj,
                theAccountCreated,
                questionNosEnc,
                preparedPriceRef,
                bridgeDirection
            );
        } else {
            tx = await executeTransaction(
                myOwnerId,
                verifyingContract,
                passwdAccount,
                receiverAddr,
                amount,
                "",
                chainObj,
                myAccountCreated,
                questionNosEnc,
                preparedPriceRef,
                ""
            );
        }

        updateCurrentTx(tx);

        // signature: signature, eoa: eoa, nonce: nonce.toString()
        // document.getElementById("id_newtrans_owner_id").value = ownerId;
        // document.getElementById("id_newtrans_signature").value = sign.signature;
        // document.getElementById("id_newtrans_passwd_addr").value = sign.eoa;
        // document.getElementById("id_newtrans_nonce").value = sign.nonce;
    };

    return (
        // <button aria-disabled={pending} type="submit" onClick={handleClick}>
        //   Login
        // </button>
        <div
            style={{
                marginTop: "10px",
                marginLeft: "300px",
                width: "300px",
            }}
        >
            <div>
                {/* <Checkbox defaultSelected={false}>
                    <p style={{ fontSize: "14px" }}>Add to Batch</p>
                </Checkbox> */}
            </div>
            <Button
                disabled={pending}
                type="button"
                onPress={handleClick}
                color="primary"
                style={{ marginTop: "3px", marginLeft: "28px" }}
            >
                {buttonText}
            </Button>
        </div>
    );
}

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
    preparedPriceRef: any,
    bridgeDirection: string
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
        argumentsHash = keccak256(argumentsHash);
        console.log(
            "encodeAbiParameters3333:",
            bridgeDirection,
            ":::",
            argumentsHash,
            "xx:",
            chainObj
        );
        let chainId = chainObj.id;
        console.log("id-----------------:1:", chainId);
        if (bridgeDirection == "L1ToL2") {
            // L2 is selected, but it need to switch to L1
            chainId = getChainObj(chainObj.l1ChainCode).id;
        }
        console.log("id-----------------:2:", chainId);
        let withZeroNonce = !myAccountCreated;
        const sign = await signAuth(
            passwdAccount,
            chainId,
            myContractAccount,
            chainObj,
            argumentsHash,
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
                BigInt(0),
                bridgeDirection
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
                receiverData,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                myL1DataFee,
                BigInt(0),
                BigInt(0),
                bridgeDirection
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
        console.log(
            "let's see fee info:+++++++++++++++++++++++k=",
            k,
            detectRes
        );

        // store fei info for every "k";
        preparedPriceRef.current = {
            preparedMaxFeePerGas: detectRes.maxFeePerGas,
            preparedGasPrice: detectRes.gasPrice,
        };
        //

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
    preparedPriceRef: any,
    bridgeDirection: string
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
        preparedPriceRef,
        bridgeDirection
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
    if (bridgeDirection == "L1ToL2") {
        // L2 is selected, but it need to switch to L1
        chainId = getChainObj(chainObj.l1ChainCode).id;
    }
    let withZeroNonce = !myAccountCreated;
    const sign = await signAuth(
        passwdAccount,
        chainId,
        myContractAccount,
        chainObj,
        argumentsHash,
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
            preparedPriceRef.current.preparedGasPrice,
            bridgeDirection
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
            receiverData,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            eFee.l1DataFeeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice,
            bridgeDirection
        );
    }

    if (!detectRes.success) {
        console.log("ERROR:", detectRes);
        return "ERROR: " + detectRes.msg;
    }

    console.log("detectRes.tx=" + detectRes.tx);
    return detectRes.tx;
}
