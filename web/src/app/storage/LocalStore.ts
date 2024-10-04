import { getOwnerIdBigBrother as getBigBrotherOwnerId } from "../lib/client/keyTools";

import { ChainCode, Menu, chainCodeFromString } from "../lib/myTypes";

const KEY_PREFIX = "W3EA_PROFILE_V2:";

export type UserProperty = {
    bigBrotherOwnerId: string;
    email: string;
    emailDisplay: string;
    selectedChainCode: ChainCode;
    selectedAccountInfos: {
        chainCode: ChainCode;
        selectedOrderNo: number;
        selectedAccountAddr: string;
    }[];
    selectedOrderNo: number; // copy from selectedAccountInfos
    selectedAccountAddr: string; // copy from selectedAccountInfos
    testMode: boolean;
};

const userPropertyGetSelectedOrderNo = (prop: UserProperty) => {
    const a = prop.selectedAccountInfos.filter(
        (a) => a.chainCode == prop.selectedChainCode
    );
    if (a.length > 0) {
        return a[0].selectedOrderNo;
    } else {
        return 0;
    }
};
const userPropertyGetSelectedAccountAddr = (prop: UserProperty) => {
    const a = prop.selectedAccountInfos.filter(
        (a) => a.chainCode == prop.selectedChainCode
    );
    if (a.length > 0) {
        return a[0].selectedAccountAddr;
    } else {
        return "";
    }
};

function transToEmailDisplay(email: string) {
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

const EMAIL_LOGIN_PAGE = "[loginPage]";
function getLoginPageProperty() {
    const prop = getUserProperty(EMAIL_LOGIN_PAGE);
    prop.email = EMAIL_LOGIN_PAGE;
    return prop;
}

function getUserProperty(email: string): UserProperty {
    if (typeof window !== "undefined") {
        console.log("localstore, we are running on the client");
    } else {
        console.log("localstore, we are running on the server");
        return { selectedAccountInfos: [] };
    }

    let defaultChain: ChainCode = ChainCode.ETHEREUM_MAIN_NET;
    if (email.indexOf("@") >= 0) {
        defaultChain = getLoginPageProperty().selectedChainCode;
        console.log("xxxxx:defaultChain", defaultChain);
    }

    const iBigBrotherOwnerId = getBigBrotherOwnerId(email, defaultChain);
    const propJson = localStorage.getItem(KEY_PREFIX + email);
    console.log("propJson:::", email, "+", propJson, defaultChain);
    if (propJson == undefined || propJson == null || propJson == "") {
        console.log("propJson:::AA");
        const myRtn = {
            bigBrotherOwnerId: iBigBrotherOwnerId,
            email: email,
            emailDisplay: transToEmailDisplay(email),

            selectedChainCode: defaultChain,
            selectedAccountInfos: [
                {
                    chainCode: defaultChain,
                    selectedOrderNo: 0,
                    selectedAccountAddr: "",
                },
            ],
            selectedOrderNo: 0,
            selectedAccountAddr: "",
            testMode: false,
        };
        return myRtn;
    }
    console.log("propJson:::BB");

    const property: UserProperty = JSON.parse(propJson);
    property.selectedChainCode = chainCodeFromString(
        property.selectedChainCode?.toString()
    );
    property.selectedOrderNo = userPropertyGetSelectedOrderNo(property);
    property.selectedAccountAddr = userPropertyGetSelectedAccountAddr(property);
    return property;
}

function setPropSelectedOrderNo(
    email: string,
    sNo: number,
    selectedAccountAddr: string
) {
    const prop: UserProperty = getUserProperty(email);
    const cc = prop.selectedChainCode;
    let upFlag = false;
    prop.selectedAccountInfos.forEach((a) => {
        if (a.chainCode == cc) {
            a.selectedOrderNo = sNo;
            a.selectedAccountAddr = selectedAccountAddr;
            upFlag = true;
        }
    });
    if (!upFlag) {
        prop.selectedAccountInfos.push({
            chainCode: cc,
            selectedOrderNo: sNo,
            selectedAccountAddr: selectedAccountAddr,
        });
    }
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
}

function setPropChainCode(email: string, chainCode: ChainCode) {
    const prop: UserProperty = getUserProperty(email);
    prop.selectedChainCode = chainCode;
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
    localStorage.setItem(KEY_PREFIX + EMAIL_LOGIN_PAGE, JSON.stringify(prop));
    console.log("setPropChainCode:", email, chainCode);
}

function setPropTestMode(email: string, testMode: boolean) {
    const prop: UserProperty = getUserProperty(email);
    prop.testMode = testMode;
    localStorage.setItem(KEY_PREFIX + email, JSON.stringify(prop));
    localStorage.setItem(KEY_PREFIX + EMAIL_LOGIN_PAGE, JSON.stringify(prop));
}

function setCacheQueryAccount(
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

function getCacheQueryAccount(
    chainCode: string,
    factoryAddr: string,
    ownerId: string
) {
    const key =
        KEY_PREFIX + ":" + chainCode + ":" + factoryAddr + ":" + ownerId;
    return JSON.parse(localStorage.getItem(key));
}

function setMenu(menu: Menu) {
    localStorage.setItem(KEY_PREFIX + "-" + "Menu", menu.toString());
}
function getMenu() {
    const mm = localStorage.getItem(KEY_PREFIX + "-" + "Menu");
    if (mm == null || mm == undefined || mm == "") {
        return Menu.Asset;
    }
    console.log("getMenu,1:", mm);
    const rtn = mm as unknown as Menu;
    console.log("getMenu,2:", rtn);
    return rtn;
}

export default {
    getUserProperty,
    setPropSelectedOrderNo,
    setPropChainCode,
    setPropTestMode,
    getLoginPageProperty,
    setCacheQueryAccount,
    getCacheQueryAccount,
    setMenu,
    getMenu,
};
