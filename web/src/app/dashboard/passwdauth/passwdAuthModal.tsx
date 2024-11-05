"use client";

import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Progress,
    Switch,
    Textarea,
    useDisclosure,
} from "@nextui-org/react";
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Checkbox,
    Tooltip,
    Image,
    Button,
    Input,
} from "@nextui-org/react";

import { getInputValueById, setInputValueById } from "../../lib/elementById";
import { aesEncrypt, aesDecrypt } from "../../lib/crypto.mjs";
import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../../lib/myRandom";

import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
} from "viem";
import { useRouter } from "next/navigation";
import { queryPasswdAddr, queryQuestionIdsEnc } from "../../lib/chainQuery";

import pq from "../privateinfo/passwdQuestion.json";

import Passwd from "../privateinfo/passwd2";
import PasswdInput from "./passwdInput";
import { getPasswdAccount, PrivateInfoType } from "../../lib/client/keyTools";
import { signAuth } from "../../lib/client/signAuthTypedData";

import popularAddr from "../../lib/client/popularAddr";
import { useRef, useState, useEffect, MutableRefObject } from "react";

import { Menu, UserInfo, uiToString, Transaction } from "../../lib/myTypes";
import { getChainObj } from "../../lib/myChain";
import {
    bigBrotherAccountCreated,
    UserProperty,
} from "@/app/storage/userPropertyStore";
import {
    accountAddrCreated,
    readAccountAddr,
    readBigBrotherAcctAddr,
    readFactoryAddr,
} from "@/app/storage/userPropertyStore";
import { useFormStatus } from "react-dom";

const OP_TYPE = {
    // "Enter the email's new information for the first time",
    OP_newInfoFirstTime: "OP_newInfoFirstTime",

    // "Enter the email's new information for the second time",
    OP_newInfoSecondTime: "OP_newInfoSecondTime",

    // "Enter the information for authentication(permit)",
    OP_infoForPermit: "OP_infoForPermit",
};

const pwdRegex = new RegExp(
    "(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{11,30}"
);

type PasswdState = "OK" | "ERROR" | "Blank" | "BigBrotherNotCreated";

let fetchPasswdAddr: () => Promise<string>;

export let getAuthPasswdAccount: () => any = () => {
    throw Error("getAuthPasswdAccount uninitialized");
};

let setAuthPasswdAccount: (passwdAccount: any) => void = (
    passwdAccount: any
) => {
    throw Error("setAuthPasswdAccount uninitialized");
};

let getAuthPasswdAccountTmp: () => any = () => {
    throw Error("getAuthPasswdAccountTmp uninitialized");
};

let setAuthPasswdAccountTmp: (passwdAccount: any) => void = (
    passwdAccount: any
) => {
    throw Error("setAuthPasswdAccountTmp uninitialized");
};

const LOCK_TIME = 600 * 1000; //
let getLocked: () => boolean = () => {
    throw Error("getLocked uninitialized");
};
let setLocked: (newLocked: boolean) => void = (newLocked: boolean) => {
    throw Error("setLocked uninitialized");
};

let setProgressValue: (r: number, pgMax: number) => void = (
    r: number,
    pgMax: number
) => {
    throw Error("setProgressValue uninitialized");
};

type PasswdInfo = {
    pinCode: string;
    questoin1No: string;
    question1Ans: string;
    question2No: string;
    question2Ans: string;
};

let setPasswdInfo: (pwd: PasswdInfo) => void = (pwd: PasswdInfo) => {
    throw Error("setPasswdInfo uninit...");
};

let getPasswdInfo: () => PasswdInfo = () => {
    throw Error("getPasswdInfo uninit...");
};

let setPinCodeValue: (val: string) => void = (val: string) => {
    throw Error("setPinCodeValue uninit...");
};

let getPinCodeValue: () => string = () => {
    throw Error("getPinCodeValue uninit...");
};

let setQuestion1AnsValue: (val: string) => void = (val: string) => {
    throw Error("setQuestion1AnsValue uninit...");
};

let getQuestion1AnsValue: () => string = () => {
    throw Error("getQuestion1AnsValue uninit...");
};

let setQuestion2AnsValue: (val: string) => void = (val: string) => {
    throw Error("setQuestion2AnsValue uninit...");
};

let getQuestion2AnsValue: () => string = () => {
    throw Error("getQuestion2AnsValue uninit...");
};

let clickPopButton: (msg: string) => void = (msg: string) => {
    throw Error("clickPopButton uninit...");
};

export function MenuItemOfPasswdAuth({ userProp }: { userProp: UserProperty }) {
    console.log("MenuItemOfPasswdAuth init ...");

    const [pinCodeValue, set0PinCodeValue] = useState("");
    setPinCodeValue = (val: string) => {
        set0PinCodeValue(val);
    };
    getPinCodeValue = () => {
        return pinCodeValue;
    };

    const [question1AnsValue, set0Question1AnsValue] = useState("");
    setQuestion1AnsValue = (val: string) => {
        set0Question1AnsValue(val);
    };
    getQuestion1AnsValue = () => {
        return question1AnsValue;
    };

    const [question2AnsValue, set0Question2AnsValue] = useState("");
    setQuestion2AnsValue = (val: string) => {
        set0Question2AnsValue(val);
    };
    getQuestion2AnsValue = () => {
        return question2AnsValue;
    };

    const passwdInfoRef = useRef({
        pinCode: "",
        questoin1No: "",
        question1Ans: "",
        question2No: "",
        question2Ans: "",
    } as PasswdInfo);
    const [passwdInfo, set0PasswdInfo] = useState(passwdInfoRef.current);
    setPasswdInfo = (pwd: PasswdInfo) => {
        passwdInfoRef.current = pwd;
        set0PasswdInfo(pwd);
    };
    getPasswdInfo = () => {
        return passwdInfoRef.current;
    };

    const authPasswdAccount = useRef();
    getAuthPasswdAccount = () => {
        if (passwdState != "OK") {
            let msg =
                "Please click [Passwd Auth] on the left and enter the correct password information";
            clickPopButton(msg);
            throw Error(msg);
        }
        if (getLocked()) {
            let msg =
                "Please click [Passwd Auth] on the left and unlock the password form";
            clickPopButton(msg);
            throw Error(msg);
        }
        return authPasswdAccount.current;
    };

    setAuthPasswdAccount = (passwdAccount: any) => {
        authPasswdAccount.current = passwdAccount;
    };

    // when need input twice, first passwd store here tmp.
    const authPasswdAccountTmp = useRef();
    getAuthPasswdAccountTmp = () => {
        return authPasswdAccountTmp.current;
    };
    setAuthPasswdAccountTmp = (passwdAccount: any) => {
        authPasswdAccountTmp.current = passwdAccount;
    };

    const [locked, set0Locked] = useState(false);
    getLocked = () => {
        return locked;
    };
    setLocked = (newLocked: boolean) => {
        set0Locked(newLocked);
    };

    /////

    const [passwdAuthMenuClickedCount, setPasswdAuthMenuClickedCount] =
        useState(0);
    const onClickPasswdAuthMenu = () => {
        console.log(
            "onClickPasswdAuthMenu, old count:",
            passwdAuthMenuClickedCount
        );
        setPasswdAuthMenuClickedCount(passwdAuthMenuClickedCount + 1);
    };

    const [passwdState, setPasswdState] = useState("Blank" as PasswdState);
    const updatePasswdState = (s: PasswdState) => {
        setPasswdState(s);
    };

    const getPasswdStateMsg = (ps: PasswdState) => {
        if (ps == "OK") {
            return "The password you filled in is correct";
        } else if (ps == "ERROR") {
            return "The password you filled in is wrong";
        } else if (ps == "Blank") {
            return "To initiate a transaction, you need to fill in the password information first";
        } else if (ps == "BigBrotherNotCreated") {
            return "You have not yet created your first account . To initiate a transaction,you need to enter the same password information again.";
        }
    };

    const getPasswdStateImg = (ps: PasswdState) => {
        passwdState == "OK" ? "/pwdSuccess.png" : "/pwdWarning.png";
        if (ps == "OK") {
            return "/pwdSuccess.png";
        } else if (ps == "ERROR") {
            return "/pwdError.png";
        } else if (ps == "Blank") {
            return "/pwdWarning.png";
        } else if (ps == "BigBrotherNotCreated") {
            return "/pwdWarning.png";
        }
    };

    const unlockBeginTime = useRef(Date.now());

    const [progressValue, set0ProgressValue] = useState(0);
    const progressMax = useRef(LOCK_TIME);
    setProgressValue = (r: number, pgMax: number) => {
        if (pgMax != undefined && pgMax > 0) {
            progressMax.current = pgMax;
        }
        set0ProgressValue(
            r > progressMax.current ? 100 : (r / progressMax.current) * 100
        );
    };

    const [popMsg, setPopMsg] = useState("");
    const popBtnRef = useRef(null as HTMLButtonElement | null);
    clickPopButton = (msg: string) => {
        setPopMsg(msg);
        popBtnRef.current?.click();
        setTimeout(() => {
            popBtnRef.current?.click();
        }, 5000);
    };

    return (
        <div>
            <div style={{ height: "0px" }}>
                <Popover placement="top-start" color={"warning"}>
                    <PopoverTrigger style={{ height: "0px" }}>
                        <Button ref={popBtnRef}></Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="px-1 py-2">
                            {/* <div className="text-small font-bold">
                                Passwd Auth
                            </div> */}
                            <div className="text-small">{popMsg}</div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>{" "}
            <ModalPasswdBox
                passwdAuthMenuClickedCount={passwdAuthMenuClickedCount}
                updatePasswdState={updatePasswdState}
                userProp={userProp}
                unlockBeginTime={unlockBeginTime}
            ></ModalPasswdBox>
            <Progress
                size="sm"
                aria-label="Loading..."
                color={progressValue == 100 ? "danger" : "primary"}
                value={progressValue}
            />
            <Tooltip content={getPasswdStateMsg(passwdState)}>
                <div className="flex">
                    <Avatar
                        radius="none"
                        size="sm"
                        src="/pwdLock.png"
                        color="default" // default | primary | secondary | success | warning | danger
                    />
                    <p
                        style={{
                            marginLeft: "10px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                        onClick={(event) => onClickPasswdAuthMenu()}
                    >
                        {"Passwd Auth"}
                    </p>
                    &nbsp;
                    <Image
                        width={30}
                        radius="none"
                        alt=""
                        src={getPasswdStateImg(passwdState)}
                    />
                </div>
            </Tooltip>
        </div>
    );
}

function ModalPasswdBox({
    passwdAuthMenuClickedCount,
    updatePasswdState,
    userProp,
    unlockBeginTime,
}: {
    passwdAuthMenuClickedCount: number;
    updatePasswdState: (s: PasswdState) => void;
    userProp: UserProperty;
    unlockBeginTime: MutableRefObject<number>;
}) {
    console.log("ModalPasswdBox, userProp:", userProp);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    useEffect(() => {
        if (
            passwdAuthMenuClickedCount == undefined ||
            passwdAuthMenuClickedCount == 0
        ) {
            return;
        }
        onOpen();
    }, [passwdAuthMenuClickedCount]);

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

    return (
        <>
            {/* <Button onPress={onOpen}>Open Modal</Button> */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={false}
                size="3xl"
                scrollBehavior={"inside"}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <div style={{ overflow: "scroll" }}>
                                    <PasswdAuthDetail
                                        userProp={userProp}
                                        forTransaction={false}
                                        currentPriInfoRef={currentPriInfoRef}
                                        oldPriInfoRef={oldPriInfoRef}
                                        privateinfoHidden={false}
                                        updatePrivateinfoHidden={function (
                                            hidden: boolean
                                        ): void {
                                            throw new Error(
                                                "Function not implemented."
                                            );
                                        }}
                                        closeModal={(
                                            passwdState: PasswdState
                                        ) => {
                                            console.log(
                                                "passwdState from PasswdAuthDetail:",
                                                passwdState
                                            );
                                            updatePasswdState(passwdState);
                                            onClose();
                                        }}
                                        unlockBeginTime={unlockBeginTime}
                                    ></PasswdAuthDetail>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {/* <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button> */}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function LockScreen({
    currentPriInfoRef,
    unlockBeginTime,
    locked,
    updateLocked,
}: {
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    unlockBeginTime: MutableRefObject<number>;
    locked: boolean;
    updateLocked: (newLocked: boolean) => void;
}) {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    useEffect(() => {
        console.log("xxxxxx8888:", locked);
        if (locked) {
            onOpen();
        } else {
            onClose();
        }
    }, [locked]);

    const [pre4pc, setPre4pc] = useState("");

    const myOnClose = () => {
        console.log("myOnClose....:isOpen:", isOpen);
        // to close....check it.
        if (currentPriInfoRef.current.pin.length > 4) {
            if (
                pre4pc.substring(0, 4) ==
                currentPriInfoRef.current.pin.substring(0, 4)
            ) {
                setPre4pc("");
                updateLocked(false);
            } else {
                alert("First 4 characters of the pin code are invalid");
                onOpen(); // reOpen.
            }
        } else {
            updateLocked(false);
        }
    };

    return (
        <>
            {" "}
            <div></div>
            <Modal
                backdrop={"blur"}
                isOpen={isOpen}
                onClose={myOnClose}
                onOpenChange={onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={false}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Unlock
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    to unlock, please enter the first 4
                                    characters of the pin code
                                </p>
                                <Input
                                    type="password"
                                    label="First 4 characters of the pin code"
                                    placeholder=""
                                    defaultValue={pre4pc}
                                    value={pre4pc}
                                    onValueChange={setPre4pc}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={
                                        //onClose
                                        () => {
                                            onClose();
                                        }
                                    }
                                >
                                    OK
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

function PasswdAuthDetail({
    userProp,
    forTransaction,
    currentPriInfoRef,
    oldPriInfoRef,
    privateinfoHidden,
    updatePrivateinfoHidden,
    closeModal,
    unlockBeginTime,
}: {
    userProp: UserProperty;
    forTransaction: boolean;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    oldPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    privateinfoHidden: boolean;
    updatePrivateinfoHidden: (hidden: boolean) => void;
    closeModal: (passwdState: PasswdState) => void;
    unlockBeginTime: MutableRefObject<number>;
}) {
    const questions = pq.questions[1];
    console.log("PrivateInfo Modal, userProp :", userProp);

    console.log("PrivateInfo, currentPriInfoRef init...1");
    if (currentPriInfoRef.current.email == "") {
        console.log("PrivateInfo, currentPriInfoRef init...2");
        currentPriInfoRef.current.email = userProp.email;
        currentPriInfoRef.current.pin = "";
        currentPriInfoRef.current.question1answer = "";
        currentPriInfoRef.current.question2answer = "";
        currentPriInfoRef.current.firstQuestionNo = "";
        currentPriInfoRef.current.secondQuestionNo = "";

        currentPriInfoRef.current.confirmedSecondary = true;
    }

    oldPriInfoRef.current.email = userProp.email;
    oldPriInfoRef.current.pin = "";
    oldPriInfoRef.current.question1answer = "";
    oldPriInfoRef.current.question2answer = "";
    oldPriInfoRef.current.firstQuestionNo = "";
    oldPriInfoRef.current.secondQuestionNo = "";

    console.log("factoryAddr in privateinfo:", readFactoryAddr(userProp));

    const selectedQuestionIdsEncRef = useRef("");

    console.log(`privateinfo..123,forTransaction=${forTransaction},`);

    const chainObj = getChainObj(userProp.selectedChainCode);

    const fetchBigBrothersQuestionNos = async (myPin: string) => {
        if (!bigBrotherAccountCreated(userProp)) {
            return;
        }
        if (myPin != "") {
            console.log(
                "fetchBigBrothersQuestionNos:",
                userProp.bigBrotherOwnerId,
                readBigBrotherAcctAddr(userProp)
            );
            const encQuestionNos = await queryQuestionIdsEnc(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                readBigBrotherAcctAddr(userProp)
            );
            console.log("fetchBigBrothersQuestionNos, encNos:", encQuestionNos);
            const nos = aesDecrypt(encQuestionNos, myPin);
            const no1 = nos.substring(0, 2);
            const no2 = nos.substring(2, 4);

            currentPriInfoRef.current.firstQuestionNo = no1;
            currentPriInfoRef.current.secondQuestionNo = no2;
            setMyFirstQuestionNo(no1);
            setMySecondQuestionNo(no2);
        }
    };

    fetchPasswdAddr = async () => {
        console.log("fetchPasswdAddr,1,", userProp);
        const bbac = bigBrotherAccountCreated(userProp);
        if (!bbac) {
            return "";
        }
        console.log("fetchPasswdAddr,2,", bbac);
        const passwdAddr = await queryPasswdAddr(
            userProp.selectedChainCode,
            readFactoryAddr(userProp),
            readBigBrotherAcctAddr(userProp)
        );
        console.log("fetchPasswdAddr,3,", passwdAddr);
        return "" + passwdAddr;
    };

    const [pinErrorMsg, setPinErrorMsg] = useState("");

    const handlePinBlur = () => {
        console.log("handlePinBlur,ac:", forTransaction);
        console.log("handlePinBlur,pinX.length:", getPinCodeValue().length);
        if (
            getPinCodeValue().length == 0 ||
            !pwdRegex.test(getPinCodeValue())
        ) {
            setPinErrorMsg(
                "PIN required: The length is greater than 10, contains special characters for upper and lower case letters"
            );
            return;
        }
        setPinErrorMsg("");

        // here, has created bigBrother.
        let myPin = "";

        // just see pin1 ,forTransaction
        if (getPinCodeValue().length > 0) {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                pin: getPinCodeValue(),
            };
        } else {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                pin: "",
            };
        }
        myPin = currentPriInfoRef.current.pin;

        fetchBigBrothersQuestionNos(myPin);

        // console.log("privateinfo,pinBlur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion1AnswerBlur = () => {
        // here, has created bigBrother.

        if (getQuestion1AnsValue().length > 0) {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                question1answer: getQuestion1AnsValue(),
            };
        } else {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                question1answer: "",
            };
        }

        // console.log("privateinfo,q1answer blur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion2AnswerBlur = () => {
        // here, has created bigBrother.

        if (getQuestion2AnsValue().length > 0) {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                question2answer: getQuestion2AnsValue(),
            };
        } else {
            currentPriInfoRef.current = {
                ...currentPriInfoRef.current,
                question2answer: "",
            };
        }
    };

    const [myFirstQuestionNo, setMyFirstQuestionNo] = useState(
        currentPriInfoRef.current.firstQuestionNo
    );
    const [mySecondQuestionNo, setMySecondQuestionNo] = useState(
        currentPriInfoRef.current.secondQuestionNo
    );

    const onSelectionChange1 = (key: string) => {
        currentPriInfoRef.current = {
            ...currentPriInfoRef.current,
            firstQuestionNo: key,
        };
        setMyFirstQuestionNo(key);
    };
    const onSelectionChange2 = (key: string) => {
        currentPriInfoRef.current = {
            ...currentPriInfoRef.current,
            secondQuestionNo: key,
        };
        setMySecondQuestionNo(key);
    };

    const [isShowWarning, setIsShowWarning] = useState(false);
    useEffect(() => {
        setIsShowWarning(true);

        //
        setPinCodeValue(currentPriInfoRef.current.pin);
        setQuestion1AnsValue(currentPriInfoRef.current.question1answer);
        setQuestion2AnsValue(currentPriInfoRef.current.question2answer);

        setAuthPasswdAccountTmp(null);
    }, []);

    const updateLocked = (newLocked: boolean) => {
        setLocked(newLocked);
        if (newLocked == false) {
            unlockBeginTime.current = Date.now();
            setProgressValue(0, LOCK_TIME);
        }
    };

    useEffect(() => {
        const watch = async () => {
            while (true) {
                await sleep(100);

                if (
                    currentPriInfoRef == undefined ||
                    currentPriInfoRef.current == undefined ||
                    currentPriInfoRef.current.pin == undefined
                ) {
                    continue;
                }
                if (currentPriInfoRef.current.pin.length <= 4) {
                    continue;
                }
                if (
                    unlockBeginTime == undefined ||
                    unlockBeginTime.current == undefined
                ) {
                    continue;
                }
                if (unlockBeginTime.current == 0) {
                    continue;
                }
                const xxx = Date.now() - unlockBeginTime.current;
                if (xxx > LOCK_TIME) {
                    console.log("lock time xyz.");
                    updateLocked(true);
                }
                setProgressValue(xxx, 0);
                await sleep(900);
            }
        };
        watch();
    }, []);

    return (
        <>
            <div style={{ display: "flex" }}>
                <LockScreen
                    currentPriInfoRef={currentPriInfoRef}
                    unlockBeginTime={unlockBeginTime}
                    locked={getLocked()}
                    updateLocked={updateLocked}
                ></LockScreen>
                <p
                    style={{
                        fontWeight: "bold",
                        fontSize: "20px",
                    }}
                >
                    {userProp.email}
                </p>
                <p
                    style={{
                        fontSize: "20px",
                    }}
                >
                    &nbsp; 's Private information
                </p>
                <Popover
                    isOpen={isShowWarning}
                    onOpenChange={(open) => setIsShowWarning(open)}
                    showArrow
                >
                    <PopoverTrigger>
                        <Button
                            style={{ marginLeft: "20px", marginBottom: "8px" }}
                            size="sm"
                            color="warning"
                        >
                            Warning
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="px-1 py-2">
                            <WarnMessage />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Card
                className="max-w-[800px]"
                style={
                    privateinfoHidden == false
                        ? { marginTop: "0px" }
                        : { marginTop: "0px", height: "54px" }
                }
            >
                <CardBody>
                    <div>
                        <div>
                            <div style={{ display: "flex" }}>
                                <Card
                                    style={{
                                        width: "300px",
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        backgroundColor: "LightBlue",
                                    }}
                                >
                                    <CardBody>
                                        <p>PIN Code:</p>
                                    </CardBody>
                                </Card>
                                <p
                                    style={{
                                        width: "340px",
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                        marginLeft: "15px",
                                        color: "red",
                                        // backgroundColor: "#FAD7A0",
                                    }}
                                >
                                    {pinErrorMsg}
                                </p>
                            </div>

                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                {/* <Passwd
                                    id="aa_id_private_pin_1"
                                    label="pin code"
                                    hint="input private pin code"
                                    onMyBlur={handlePinBlur}
                                ></Passwd> */}
                                <PasswdInput
                                    label="pin code"
                                    hint="input private pin code"
                                    onMyBlur={handlePinBlur}
                                    value={getPinCodeValue()}
                                    setValue={setPinCodeValue}
                                ></PasswdInput>
                            </div>
                            <Divider
                                style={{
                                    marginTop: "10px",
                                    color: "black",
                                    height: "5px",
                                }}
                            ></Divider>
                            <Card
                                style={{
                                    width: "300px",
                                    marginTop: "5px",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    backgroundColor: "LightBlue",
                                }}
                            >
                                <CardBody>
                                    <p>First Private Question:</p>
                                </CardBody>
                            </Card>

                            <Autocomplete
                                label="Choose the first question"
                                className="max-w-2xl"
                                onSelectionChange={onSelectionChange1}
                                selectedKey={myFirstQuestionNo}
                                defaultSelectedKey={myFirstQuestionNo}
                            >
                                {questions.map((item) => (
                                    <AutocompleteItem
                                        key={item.idx}
                                        value={item.question}
                                    >
                                        {item.question}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <PasswdInput
                                    label="first question's answer"
                                    hint="input first question's answer"
                                    onMyBlur={handleQuestion1AnswerBlur}
                                    value={getQuestion1AnsValue()}
                                    setValue={setQuestion1AnsValue}
                                ></PasswdInput>
                            </div>
                            <Divider
                                style={{
                                    marginTop: "10px",
                                    color: "black",
                                    height: "5px",
                                }}
                            ></Divider>
                            <Card
                                style={{
                                    width: "300px",
                                    marginTop: "5px",
                                    marginBottom: "5px",
                                    fontWeight: "bold",
                                    backgroundColor: "LightBlue",
                                }}
                            >
                                <CardBody>
                                    <p>Second Private Question:</p>
                                </CardBody>
                            </Card>

                            <Autocomplete
                                label="Choose the second question"
                                className="max-w-2xl"
                                onSelectionChange={onSelectionChange2}
                                selectedKey={mySecondQuestionNo}
                                defaultSelectedKey={mySecondQuestionNo}
                            >
                                {questions.map((item) => (
                                    <AutocompleteItem
                                        key={item.idx}
                                        value={item.question}
                                    >
                                        {item.question}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <PasswdInput
                                    label="second question's answer"
                                    hint="input second question's answer"
                                    onMyBlur={handleQuestion2AnswerBlur}
                                    value={getQuestion2AnsValue()}
                                    setValue={setQuestion2AnsValue}
                                ></PasswdInput>
                            </div>
                            <>
                                {/*todo need show multi chain when modifying....*/}
                                <MultiChainForModify />
                                <SubmitMessage
                                    email={userProp.email}
                                    verifyingContract={readAccountAddr(
                                        userProp
                                    )}
                                    chainObj={chainObj}
                                    currentPriInfoRef={currentPriInfoRef}
                                    closeModal={closeModal}
                                    userProp={userProp}
                                />
                            </>
                        </div>

                        <Divider
                            style={{
                                marginTop: "10px",
                                color: "black",
                                height: "10px",
                            }}
                        ></Divider>
                    </div>
                </CardBody>
            </Card>
        </>
    );
}

function WarnMessage() {
    return (
        <div className="max-w-[800px]" style={{ marginTop: "0px" }}>
            <p>Warning: The server does not store your personal information.</p>
            <p>
                1. Once the personal information is forgotten, you will never be
                able to recover your accounts and assets
            </p>
            <p>
                2. Once personal information is leaked, your account or assets
                may be stolen
            </p>
        </div>
    );
}

function checkInfo(pin1, question1_answer_1, question2_answer_1) {
    if (pin1 == "" || pin1 == undefined || pin1.length == 0) {
        alert("pin code cann't be empty!");
        throw new Error("pin code cann't be empty!");
    }
    if (!pwdRegex.test(pin1)) {
        alert("pin error!");
        throw new Error("pin error!");
    }
    if (
        question1_answer_1 == "" ||
        question1_answer_1 == undefined ||
        question1_answer_1.length == 0
    ) {
        alert("first question's answer cann't be empty!");
        throw new Error("question1_answer_1 cann't be empty!");
    }
    if (
        question2_answer_1 == "" ||
        question2_answer_1 == undefined ||
        question2_answer_1.length == 0
    ) {
        alert("second question's answer cann't be empty!");
        throw new Error("question2_answer_1 cann't be empty!");
    }
}

function SubmitMessage({
    email,
    verifyingContract,
    chainObj,
    currentPriInfoRef,
    closeModal,
    userProp,
}: {
    email: string;
    verifyingContract: string;
    chainObj: any;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    closeModal: (passwdState: PasswdState) => void;
    userProp: UserProperty;
}) {
    const { pending } = useFormStatus();
    const router = useRouter();
    let buttonType = "button";
    let buttonShowMsg = "Confirm First";
    let marginLeft = "0px";

    console.log("private info, submitMessage");

    buttonType = "button";
    buttonShowMsg = "PrivateInfo OK.";
    marginLeft = "350px";

    const handleClick = async (event: any) => {
        if (pending) {
            event.preventDefault();
        }

        let pin1 = getPinCodeValue();
        let question1_answer_1 = getQuestion1AnsValue();
        let question2_answer_1 = getQuestion2AnsValue();

        if (
            currentPriInfoRef.current.firstQuestionNo == "" ||
            currentPriInfoRef.current.secondQuestionNo == ""
        ) {
            alert("please select question!");
            return;
        }

        checkInfo(pin1, question1_answer_1, question2_answer_1);

        let passwdAccount = getPasswdAccount(
            currentPriInfoRef.current,
            chainObj.chainCode
        );
        setAuthPasswdAccount(passwdAccount);

        let passwdState: PasswdState;
        if (
            pin1 == "" ||
            question1_answer_1 == "" ||
            question2_answer_1 == ""
        ) {
            passwdState = "Blank";
        } else {
            let chainPasswdAddr = await fetchPasswdAddr();
            if (chainPasswdAddr == "" || chainPasswdAddr == undefined) {
                passwdState = "BigBrotherNotCreated";
            } else if (chainPasswdAddr == passwdAccount.address) {
                passwdState = "OK";
            } else {
                passwdState = "ERROR";
            }
            console.log("xyz,passwdState2:", passwdState);
        }

        if (passwdState == "BigBrotherNotCreated") {
            const acctTmp = getAuthPasswdAccountTmp();
            if (
                acctTmp != undefined &&
                acctTmp != null &&
                acctTmp.address != undefined &&
                acctTmp.address != ""
            ) {
                // has input twice
                if (acctTmp.address != passwdAccount.address) {
                    setMarginTopTmp(marginTopTmp == "10px" ? "30px" : "10px");
                    setTwiceMsg(
                        "The two password information you entered did not match"
                    );
                    return;
                }
            } else {
                setAuthPasswdAccountTmp(passwdAccount);
                setPinCodeValue("");
                setQuestion1AnsValue("");
                setQuestion2AnsValue("");
                setMarginTopTmp(marginTopTmp == "10px" ? "30px" : "10px");
                setTwiceMsg(
                    "This is the first new account under your email, please enter the password information again"
                );
                return;
            }
            passwdState = "OK";
        }

        closeModal(passwdState);
    };

    console.log("button's submit type:", buttonType);

    const [twiceMsg, setTwiceMsg] = useState("");
    const [marginTopTmp, setMarginTopTmp] = useState("10px");
    return (
        <div>
            <p
                style={{
                    marginTop: marginTopTmp,
                    color: "red",
                }}
            >
                {twiceMsg}
            </p>
            <Button
                disabled={pending}
                type={buttonType}
                onPress={handleClick}
                color="primary"
                style={{
                    marginTop: "20px",
                    width: "300px",
                    marginLeft: marginLeft,
                }}
            >
                {buttonShowMsg}
            </Button>
        </div>
    );
}

function MultiChainForModify() {
    return (
        <div style={{ display: "none" }}>
            <Tooltip content="The transaction of Private Info Modification will be sent to multiple selected chains">
                <Card style={{ marginTop: "20px" }}>
                    <CardBody>
                        <p style={{ color: "grey" }}>
                            The transaction of Private Info Modification will be
                            sent to multiple selected chains
                        </p>
                    </CardBody>
                    <CardBody>
                        <div className="flex gap-4">
                            <Checkbox defaultSelected size="md">
                                MorphL2 Testnet
                            </Checkbox>
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Local Anvil
                            </Checkbox>
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Sepolia
                            </Checkbox>
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Solana testnet
                            </Checkbox>
                        </div>
                    </CardBody>
                </Card>
            </Tooltip>
        </div>
    );
}
