import { getOwnerIdBigBrother as getBigBrotherOwnerId, getOwnerIdLittleBrother } from "../lib/client/keyTools";

import { ChainCode, Menu, chainCodeFromString, exampleEmail } from "../lib/myTypes";

const KEY_PREFIX = "W3EA_PROFILE_V7:";

export type UpdateUserProperty = ({
    email, testMode, selectedChainCode, accountAddrList,
    selectedOrderNo, w3eapAddr, factoryAddr,
    bigBrotherPasswdAddr, }: {
        email: string;
        testMode: boolean | undefined;
        selectedChainCode: ChainCode | undefined;
        accountAddrList: string[] | undefined;
        selectedOrderNo: number | undefined;
        w3eapAddr: string | undefined;
        factoryAddr: string | undefined;
        bigBrotherPasswdAddr: string | undefined;
    }) => void;

export type UserProperty = {
    bigBrotherOwnerId: string;
    email: string;
    emailDisplay: string;
    testMode: boolean; // if true, only show testnet, otherwise,only show mainnet
    selectedChainCode: ChainCode;
    accountInfos: Map<ChainCode, {
        accountAddrList: string[];
        selectedOrderNo: number;
        //
        w3eapAddr: string;
        factoryAddr: string;
        bigBrotherPasswdAddr: string;
    }>;
    myselfHost: string | undefined;
    walletconnectHost: string | undefined;

    /////
    // selectedAccountInfosXXX: {
    //     chainCode: ChainCode;
    //     selectedOrderNo: number;
    //     selectedAccountAddr: string;
    //     //
    //     w3eapAddr: string;
    //     factoryAddr: string;
    //     bigBrotherPasswdAddr: string;
    // }[];
    // selectedOrderNoXXX: number; // copy from selectedAccountInfos, means current selected
    // selectedAccountAddrXXX: string; // copy from selectedAccountInfos

};

export function readFactoryAddr(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        console.log("readFactoryAddr empty, prop1:", prop);
        return "";
    }
    if (acct.factoryAddr == undefined || acct.factoryAddr == "") {
        console.log("readFactoryAddr empty, prop2:", prop);
        return "";
    }

    return acct.factoryAddr;
}

export function readAccountList(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return [];
    }
    if (acct.accountAddrList == undefined) {
        return [];
    }
    return acct.accountAddrList;
}

export function readAccountAddr(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return "";
    }
    if (acct.accountAddrList == undefined) {
        return "";
    }
    let orderNo = acct.selectedOrderNo;
    if (orderNo == undefined || orderNo < 0) {
        acct.selectedOrderNo = 0;
        orderNo = 0;
    }
    if (orderNo >= acct.accountAddrList.length) {
        return "";
    }
    return acct.accountAddrList[orderNo];
}

export function accountAddrCreated(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return false;
    }
    if (acct.accountAddrList == undefined) {
        return false;
    }
    let orderNo = acct.selectedOrderNo;
    if (orderNo == undefined || orderNo < 0) {
        return false;
    }
    if (orderNo >= acct.accountAddrList.length - 1) {
        return false; // last one has not created
    }
    return true;
}

export function bigBrotherAccountCreated(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return false;
    }
    if (acct.accountAddrList == undefined) {
        return false;
    }

    if (acct.accountAddrList.length > 1) {
        return true;
    } else {
        return false;
    }
}



export function readBigBrotherAcctAddr(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return "";
    }
    if (acct.accountAddrList == undefined || acct.accountAddrList.length == 0) {
        return "";
    }
    return acct.accountAddrList[0];
}

export function readBigBrotherPasswdAddr(prop: UserProperty) {
    // console.log("in readBigBrotherPasswdAddr,:", prop);
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return "";
    }
    if (acct.bigBrotherPasswdAddr == undefined || acct.bigBrotherPasswdAddr == "") {
        return "";
    }

    return acct.bigBrotherPasswdAddr;
}



export function readOwnerId(prop: UserProperty) {
    const acct = prop.accountInfos[prop.selectedChainCode];
    if (acct == undefined || acct == null) {
        return "";
    }
    if (acct.accountAddrList == undefined) {
        return "";
    }
    const orderNo = acct.selectedOrderNo;
    if (orderNo == undefined || orderNo < 0) {
        return "";
    }
    if (orderNo >= acct.accountAddrList.length) {
        return "";
    }

    return getOwnerIdLittleBrother(
        prop.bigBrotherOwnerId,
        orderNo
    );
}

export function getUserProperty(email: string): UserProperty {
    const defaultProp = {
        bigBrotherOwnerId: "",
        email: email,
        emailDisplay: "***",
        testMode: false,
        selectedChainCode: ChainCode.ETHEREUM_MAIN_NET,
        accountInfos: new Map(),
    } as UserProperty;
    defaultProp.accountInfos[defaultProp.selectedChainCode] = {};

    if (typeof window == "undefined" || email == "" || email == undefined) {
        console.log("localstore, we are running on the server or email is empty!");
        return defaultProp;
    } else {
        console.log("localstore, we are running on the client");
    }

    const loginJson = localStorage.getItem(KEY_PREFIX + EMAIL_LOGIN_PAGE);
    if (loginJson == undefined || loginJson == null || loginJson == "") {
        console.log("loginChainCode: is null!");
    } else {
        const p: UserProperty = JSON.parse(loginJson);
        defaultProp.selectedChainCode = p.selectedChainCode;
        defaultProp.testMode = p.testMode;

        console.log("set default chainCode to ", p.selectedChainCode, "testMode:", p.testMode);
    }

    const propJson = localStorage.getItem(KEY_PREFIX + email);
    if (propJson == undefined || propJson == null || propJson == "") {
        const iBigBrotherOwnerId = getBigBrotherOwnerId(email, defaultProp.selectedChainCode);

        defaultProp.bigBrotherOwnerId = iBigBrotherOwnerId;
        defaultProp.emailDisplay = transToEmailDisplay(email),
            defaultProp.accountInfos[defaultProp.selectedChainCode] = {
                accountAddrList: [],
                selectedOrderNo: 0,
                //
                w3eapAddr: "",
                factoryAddr: "",
                bigBrotherPasswdAddr: "",
            };

        return defaultProp;
    }

    console.log("user propJson is exists!");

    const property: UserProperty = JSON.parse(propJson);
    property.selectedChainCode = defaultProp.selectedChainCode;
    property.testMode = defaultProp.testMode;
    console.log("user propJson is exists2:", property);
    if (property.accountInfos[property.selectedChainCode] == undefined) {
        property.accountInfos[property.selectedChainCode] = {};
    }
    // if (
    //     property.accountInfos == undefined
    // ) {
    //     property.accountInfos = new Map();
    // }

    return property;
}

export function saveUserProperty(
    email: string,
    testMode: boolean,
    selectedChainCode: ChainCode,
    accountAddrList: string[],
    selectedOrderNo: number,
    w3eapAddr: string,
    factoryAddr: string,
    bigBrotherPasswdAddr: string) {
    const prop = getUserProperty(email);
    if (testMode != undefined && testMode != null) {
        prop.testMode = testMode;
    }
    if (selectedChainCode != undefined && selectedChainCode != ChainCode.UNKNOW) {
        prop.selectedChainCode = selectedChainCode;

        // latest
        saveChain2Latest(email, selectedChainCode);
    }
    let acctInfo = prop.accountInfos[prop.selectedChainCode] as {
        accountAddrList: string[];
        selectedOrderNo: number;
        w3eapAddr: string;
        factoryAddr: string;
        bigBrotherPasswdAddr: string;
    };
    if (acctInfo == undefined) {
        acctInfo = {
            accountAddrList: [],
            selectedOrderNo: 0,
            w3eapAddr: "",
            factoryAddr: "",
            bigBrotherPasswdAddr: "",
        };
        prop.accountInfos[prop.selectedChainCode] = acctInfo;
    }
    //
    if (accountAddrList != undefined && accountAddrList != null && accountAddrList.length > 0) {
        acctInfo.accountAddrList = accountAddrList;
    }
    if (selectedOrderNo != undefined && selectedOrderNo >= 0) {
        acctInfo.selectedOrderNo = selectedOrderNo;
    }
    if (w3eapAddr != undefined && w3eapAddr != null && w3eapAddr.length > 0) {
        acctInfo.w3eapAddr = w3eapAddr;
    }
    if (factoryAddr != undefined && factoryAddr != null && factoryAddr.length > 0) {
        acctInfo.factoryAddr = factoryAddr;
    }
    if (bigBrotherPasswdAddr != undefined && bigBrotherPasswdAddr != null && bigBrotherPasswdAddr.length > 0) {
        acctInfo.bigBrotherPasswdAddr = bigBrotherPasswdAddr;
    }

    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
    localStorage.setItem(KEY_PREFIX + EMAIL_LOGIN_PAGE, JSON.stringify(prop));
}


function transToEmailDisplay(email: string) {
    if (email == exampleEmail) {
        return email;
    }
    let idx = email.indexOf("@");
    let emailDisplay = "";
    for (let k = 0; k < email.length; k++) {
        if (k == 0 || k == idx - 1 || k == idx || k == idx + 1) {
            emailDisplay += email.substring(k, k + 1);
        } else {
            emailDisplay += "*";
        }
        emailDisplay = emailDisplay.replace("***", "**");
    }
    return emailDisplay;
}

export const EMAIL_LOGIN_PAGE: string = "[loginPage]";

export function getLoginPageProperty() {
    const prop = getUserProperty(EMAIL_LOGIN_PAGE);
    prop.email = EMAIL_LOGIN_PAGE;
    return prop;
}

export function setPropSelectedOrderNo(
    email: string,
    sNo: number,
    selectedAccountAddr: string
) {
    const prop: UserProperty = getUserProperty(email);
    const cc = prop.selectedChainCode;
    let upFlag = false;
    const acctInfo = prop.accountInfos.get(cc);
    if (acctInfo == undefined) {
        console.log("warn , setPropSelectedOrderNo, here is impossible!");
    } else {
        acctInfo.selectedOrderNo = sNo;
    }
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
}





export function getNavbarLatestChains(email: string): ChainCode[] {
    if (typeof window == "undefined" || email == "" || email == undefined) {
        console.log("localstore, getNavbarLatestChains, we are running on the server or email is empty!");
        return [];
    } else {
        console.log("localstore,getNavbarLatestChains, we are running on the client");
    }

    const cc3 = localStorage.getItem(KEY_PREFIX + email + "-" + "NavbarLatestChains");
    if (cc3 == null || cc3 == undefined || cc3 == "" || cc3.length == 0) {
        return [];
    }

    return JSON.parse(cc3);
}

export function setPropChainCode(email: string, chainCode: ChainCode) {
    const prop: UserProperty = getUserProperty(email);
    prop.selectedChainCode = chainCode;
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
    localStorage.setItem(KEY_PREFIX + EMAIL_LOGIN_PAGE, JSON.stringify(prop));
    console.log("setPropChainCode:", email, chainCode);

    // latest
    saveChain2Latest(email, chainCode)
}

function saveChain2Latest(email: string, chainCode: ChainCode) {
    const latest = getNavbarLatestChains(email);

    // if included by previeus three, not modify
    if ((latest.length > 0 && latest[0] == chainCode) ||
        (latest.length > 1 && latest[1] == chainCode) ||
        (latest.length > 2 && latest[2] == chainCode)) {

        return;
    }

    const newL = latest.filter(c => c != chainCode);
    newL.unshift(chainCode);

    localStorage.setItem(KEY_PREFIX + email + "-" + "NavbarLatestChains", JSON.stringify(newL));

}


export function setPropTestMode(email: string, testMode: boolean) {
    const prop: UserProperty = getUserProperty(email);
    prop.testMode = testMode;
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
    localStorage.setItem(KEY_PREFIX + EMAIL_LOGIN_PAGE, JSON.stringify(prop));
}

export function setCacheQueryAccount(
    chainCode: string,
    factoryAddr: string,
    ownerId: string,
    data: {
        accountAddr: string;
        created: boolean;
        passwdAddr: string;
    }
) {
    const key =
        KEY_PREFIX + ":" + chainCode + ":" + factoryAddr + ":" + ownerId;
    localStorage.setItem(key, JSON.stringify(data));
}

export function getCacheQueryAccount(
    chainCode: string,
    factoryAddr: string,
    ownerId: string
) {
    const key =
        KEY_PREFIX + ":" + chainCode + ":" + factoryAddr + ":" + ownerId;
    const data = localStorage.getItem(key);
    if (data == undefined) {
        return undefined;
    } else {
        return JSON.parse(data);
    }

}

export function setMenu(menu: Menu) {
    localStorage.setItem(KEY_PREFIX + "-" + "Menu", menu.toString());
}
export function getMenu() {
    const mm = localStorage.getItem(KEY_PREFIX + "-" + "Menu");
    if (mm == null || mm == undefined || mm == "") {
        return Menu.Asset;
    }
    console.log("getMenu,1:", mm);
    const rtn = mm as unknown as Menu;
    console.log("getMenu,2:", rtn);
    return rtn;
}

