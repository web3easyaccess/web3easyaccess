import { getOwnerIdBigBrother as getBigBrotherOwnerId } from "../dashboard/privateinfo/lib/keyTools";

import { ChainCode, Menu, chainCodeFromString } from "../lib/myTypes";

const KEY_PREFIX = "W3EA_PROFILE:";

export type UserProperty = {
    bigBrotherOwnerId: string;
    email: string;
    emailDisplay: string;
    selectedOrderNo: number;
    selectedAccountAddr: string;
    selectedChainCode: ChainCode;
    testMode: boolean;
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

function getUserProperty(email: string): {
    bigBrotherOwnerId: string;
    email: string;
    emailDisplay: string;
    selectedOrderNo: number;
    selectedAccountAddr: string;
    selectedChainCode: ChainCode;
    testMode: boolean;
} {
    if (typeof window !== "undefined") {
        console.log("localstore, we are running on the client");
    } else {
        console.log("localstore, we are running on the server");
        return {};
    }

    let defaultChain: ChainCode = ChainCode.ETHEREUM_MAIN_NET;
    if (email.indexOf("@") >= 0) {
        defaultChain = getLoginPageProperty().selectedChainCode;
        console.log("xxxxx:defaultChain", defaultChain);
    }

    const iBigBrotherOwnerId = getBigBrotherOwnerId(email);
    const propJson = localStorage.getItem(KEY_PREFIX + email);
    console.log("propJson:::", email, "+", propJson, defaultChain);
    if (propJson == undefined || propJson == null || propJson == "") {
        console.log("propJson:::AA");
        return {
            bigBrotherOwnerId: iBigBrotherOwnerId,
            email: email,
            emailDisplay: transToEmailDisplay(email),
            selectedOrderNo: 0,
            selectedAccountAddr: "",
            selectedChainCode: defaultChain,
            testMode: false,
        };
    }
    console.log("propJson:::BB");

    const property: UserProperty = JSON.parse(propJson);
    property.selectedChainCode = chainCodeFromString(
        property.selectedChainCode?.toString()
    );
    return property;
}

function setPropSelectedOrderNo(
    email: string,
    sNo: number,
    selectedAccountAddr: string
) {
    const prop: UserProperty = getUserProperty(email);
    prop.selectedOrderNo = sNo;
    prop.selectedAccountAddr = selectedAccountAddr;
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
