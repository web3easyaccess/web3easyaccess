import account from "./AccountEntity.json";
import factory from "./Factory.json";
import w3eaPointJSON from "./W3EAPoint.json";
import impl from "./AccountLogicImplV1.json";
import eip721 from "./Eip721.json";

const chgPasswdAddr = impl.abi.filter((e) => e.name == "chgPasswdAddr");

const sendTransaction = impl.abi.filter((e) => e.name == "sendTransaction");

const gasFreeAmount = account.abi.filter((e) => e.name == "gasFreeAmount");

const nonce = account.abi.filter((e) => e.name == "nonce");

const questionNos = account.abi.filter((e) => e.name == "questionNos");

const passwdAddr = account.abi.filter((e) => e.name == "passwdAddr");

const queryAccount = factory.abi.filter((e) => e.name == "queryAccount");

const predictAccountAddress = factory.abi.filter(
    (e) => e.name == "predictAccountAddress"
);

const w3eaPoint = factory.abi.filter((e) => e.name == "w3eaPoint");

const newAccount = factory.abi.filter((e) => e.name == "newAccount");

const newAccountAndSendTrans = factory.abi.filter(
    (e) => e.name == "newAccountAndSendTrans"
);

const balanceOf = w3eaPointJSON.abi.filter((e) => e.name == "balanceOf");
const transfer = w3eaPointJSON.abi.filter((e) => e.name == "transfer");
const symbol = w3eaPointJSON.abi.filter((e) => e.name == "symbol");
const decimals = w3eaPointJSON.abi.filter((e) => e.name == "decimals");
const totalSupply = w3eaPointJSON.abi.filter((e) => e.name == "totalSupply");
const name = w3eaPointJSON.abi.filter((e) => e.name == "name");

const ownerOf = eip721.abi.filter((e) => e.name == "ownerOf");
const tokenURI = eip721.abi.filter((e) => e.name == "tokenURI");
const transferFrom = eip721.abi.filter((e) => e.name == "transferFrom");

const getL1DataFee = {
    abi: [
        {
            type: "function",
            name: "_NEED_DYNAMIC_SET", // "getL1Fee",
            inputs: [{ name: "_data", type: "bytes", internalType: "bytes" }],
            outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
            stateMutability: "view",
        },
    ],
}.abi.filter((e) => e.name == "_NEED_DYNAMIC_SET");

export default {
    nonce,
    queryAccount,
    predictAccountAddress,
    w3eaPoint,
    gasFreeAmount,
    newAccount,
    newAccountAndSendTrans,
    sendTransaction,
    chgPasswdAddr,
    questionNos,
    passwdAddr,

    balanceOf,
    transfer,
    symbol,
    name,
    decimals,
    totalSupply,
    getL1DataFee,
    ownerOf,
    tokenURI,
    transferFrom,
};
