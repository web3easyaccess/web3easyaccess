"use client";

import { signAuth } from "@/app/lib/client/signAuthTypedData";

import {
    getOwnerIdLittleBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "@/app/lib/client/keyTools";

import {
    generateRandomDigitInteger,
    generateRandomString,
} from "@/app/lib/myRandom";

import * as libsolana from "@/app/lib/client/solana/libsolana";

import { aesEncrypt, aesDecrypt } from "@/app/lib/crypto.mjs";

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

import * as funNewTrans from "@/app/dashboard/newtransaction/funNewTrans";

import { chainPublicClient } from "@/app/lib/chainQueryClient";

import abis from "@/app/serverside/blockchain/abi/abis";

import React, { useState, useEffect, useRef, MutableRefObject } from "react";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Textarea,
    Listbox,
    ListboxItem,
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

import {
    queryAccount,
    queryQuestionIdsEnc,
    queryTokenDetail,
    queryNftDetail,
    queryNftsOwnerUri,
    formatUnits,
    parseUnits,
    queryEthBalance,
} from "@/app/lib/chainQuery";
import { getInputValueById, setInputValueById } from "@/app/lib/elementById";

import { PrivateInfo } from "@/app/dashboard/newtransaction/privateinfo";

import { getChainObj } from "@/app/lib/myChain";

import { SelectedChainIcon } from "@/app/navbar/chainIcons";

import {
    Menu,
    UserInfo,
    uiToString,
    Transaction,
    ChainCode,
} from "@/app/lib/myTypes";

import { UserProperty } from "@/app/storage/userPropertyStore";

const questionNosEncode = (qNo1: string, qNo2: string, pin: string) => {
    let questionNosEnc = qNo1 + qNo2 + generateRandomString();
    console.log("questionNosEnc1:", questionNosEnc);
    questionNosEnc = aesEncrypt(questionNosEnc, pin);
    console.log("questionNosEnc2:", questionNosEnc);
    return questionNosEnc;
};

export default function UpgradeImpl({ userProp }: { userProp: UserProperty }) {
    return (
        <div>
            <p>
                Select the corresponding check box on the Send ETH interface to
            </p>
            <p>
                upgrade the functions of the wallet account to the latest
                version
            </p>
        </div>
    );
}
