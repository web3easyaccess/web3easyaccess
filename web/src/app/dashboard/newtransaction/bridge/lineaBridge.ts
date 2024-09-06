import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
    formatEther,
    encodeFunctionData,
} from "viem";

const abi_lineaL1ToL2SendMessage = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_fee",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_calldata",
                type: "bytes",
            },
        ],
        name: "sendMessage",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];

function packDataOfBridgingETH(
    bridgeDirection: string,
    userAddress: string,
    amountInETH: string
) {
    if (bridgeDirection == "L1ToL2") {
        const to = userAddress;
        // const l2GasPrice = 0.000000005; // ETH
        // const l2ClaimFeeInETH = 100000 * l2GasPrice; //parseUnits("0.0007", 18);
        const l2ClaimFeeInETH = 0; // 0.000004;  if greater than 0 , may claim auto.
        const calldata = encodePacked(["string"], [""]);

        const data = encodeFunctionData({
            abi: abi_lineaL1ToL2SendMessage,
            functionName: "sendMessage",
            args: [to, l2ClaimFeeInETH * 1e18, calldata],
        });
        if (Number(amountInETH) < 0.0005) {
            const msg =
                "ETH Amount should be greater than 0.0005 when bridge from Ethereum to Linea.";
            alert(msg);
            throw new Error(msg);
        }
        const amountETH = "" + (Number(amountInETH) + l2ClaimFeeInETH);
        return {
            data: data,
            amountETH: amountETH,
        };
    } else if (bridgeDirection == "L2ToL1") {
        throw new Error("not support bridgeDirection: " + bridgeDirection);
        return {
            data: "",
            amountETH: "0",
        };
    } else {
        throw new Error("not support bridgeDirection: " + bridgeDirection);
    }
}

function getL1MessageServiceContract(l1ChainCode) {
    if (l1ChainCode == "SEPOLIA_CHAIN") {
        return "0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5";
    } else if (l1ChainCode == "ETHEREUM_MAIN_NET") {
        return "0xd19d4B5d358258f05D7B411E21A1460D11B0876F";
    }
    return "";
}

function getL2MessageServiceContract(l2ChainCode) {
    if (l2ChainCode == "LINEA_TEST_CHAIN") {
        return "0x971e727e956690b9957be6d51Ec16E73AcAC83A7";
    } else if (l2ChainCode == "LINEA_CHAIN") {
        return "0x508Ca82Df566dCD1B0DE8296e70a96332cD644ec";
    }
    return "";
}

export default {
    packDataOfBridgingETH,
    getL1MessageServiceContract,
    getL2MessageServiceContract,
};
