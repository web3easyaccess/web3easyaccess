import account from "./Account.json";
import admin from "./Agent.json";

const queryAccount = admin.abi.filter((e) => e.name == "queryAccount");

const newAccount = admin.abi.filter((e) => e.name == "newAccount");

const execute = admin.abi.filter((e) => e.name == "execute");

const transferETH = account.abi.filter((e) => e.name == "transferETH");

const chgPasswdAddr = account.abi.filter((e) => e.name == "chgPasswdAddr");

const questionNos = account.abi.filter((e) => e.name == "questionNos");

export default {
  queryAccount,
  newAccount,
  execute,
  transferETH,
  chgPasswdAddr,
  questionNos,
};
