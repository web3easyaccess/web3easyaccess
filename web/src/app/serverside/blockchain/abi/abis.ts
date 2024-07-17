import account from "./AccountEntity.json";
import factory from "./Factory.json";
import w3eaPointJSON from "./W3EAPoint.json";
import impl from "./AccountLogicImplV1.json";

const chgPasswdAddr = impl.abi.filter((e) => e.name == "chgPasswdAddr");

const sendTransaction = impl.abi.filter((e) => e.name == "sendTransaction");

const gasFreeAmount = account.abi.filter((e) => e.name == "gasFreeAmount");

const nonce = account.abi.filter((e) => e.name == "nonce");

const questionNos = account.abi.filter((e) => e.name == "questionNos");

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
const symbol = w3eaPointJSON.abi.filter((e) => e.name == "symbol");
const decimals = w3eaPointJSON.abi.filter((e) => e.name == "decimals");

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

    balanceOf,
    symbol,
    decimals,
};
