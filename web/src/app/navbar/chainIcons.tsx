import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Tooltip,
    Badge,
    SelectItem,
    Select,
    Switch,
} from "@nextui-org/react";
import { useState, useRef, useEffect, MutableRefObject } from "react";

import { useFormState, useFormStatus } from "react-dom";

import { saveChainCode } from "../serverside/serverActions";

import { ChainCode, chainCodeFromString } from "../lib/myTypes";
import { UpdateUserProperty, UserProperty } from "../storage/userPropertyStore";
import * as userPropertyStore from "../storage/userPropertyStore";

const supportedChains: {
    chainCode: ChainCode;
    img: string;
    title: string;
    isTestnet: boolean;
    size: "sm" | "md";
    bordered: boolean;
}[] = [
    {
        chainCode: ChainCode.NEOX_TEST_CHAIN,
        img: "/chain/neoxtest.png",
        title: "NeoX testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.SOLANA_TEST_CHAIN,
        img: "/chain/solanatest.png",
        title: "Solana testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.SEPOLIA_CHAIN,
        img: "/chain/sepolia.png",
        title: "Sepolia testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.LINEA_TEST_CHAIN,
        img: "/chain/lineatest.png",
        title: "Linea Sepolia",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.SCROLL_TEST_CHAIN,
        img: "/chain/scrolltest.png",
        title: "Scroll Sepolia",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.MORPH_TEST_CHAIN,
        img: "/chain/morphl2test.png",
        title: "Morph testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.DEFAULT_ANVIL_CHAIN,
        img: "/chain/anvil.png",
        title: "anvil testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        chainCode: ChainCode.ETHEREUM_MAIN_NET,
        img: "/chain/ethereum.png",
        title: "Ether eum",
        isTestnet: false,
        size: "sm",
        bordered: false,
    },
];

const currentAllChains = (testMode: boolean) => {
    return supportedChains.filter((s) => s.isTestnet == testMode);
};

export const ChainIcons = ({
    userProp,
    updateUserProp,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
}) => {
    console.log("chain icons, userPropref:", userProp);
    console.log("chain icons, userPropState:", userProp);

    const latestChains = () => {
        const latestChainCodes = userPropertyStore.getNavbarLatestChains(
            userProp.email
        );

        const allChains = currentAllChains(userProp.testMode);

        const validLatestChains: {
            chainCode: ChainCode;
            img: string;
            title: string;
            isTestnet: boolean;
            size: "sm" | "md";
            bordered: boolean;
        }[] = [];

        latestChainCodes.forEach((code) => {
            const aa = allChains.filter((a) => a.chainCode == code);
            if (aa.length > 0) {
                const cc = { ...aa[0] };
                validLatestChains.push(cc);
            }
        });

        if (validLatestChains.length == 0) {
            const cc = { ...allChains[0] };
            validLatestChains.push(cc);
        }
        validLatestChains[0].bordered = true;
        validLatestChains[0].size = "md";
        console.log("validLatestChains:", validLatestChains);
        if (validLatestChains.length > 3) {
            return validLatestChains.slice(0, 3);
        } else {
            return validLatestChains;
        }
    };

    const [testModeMsg, setTestModeMsg] = useState("Switch to TestMode");
    const updateTestMode = (tm: boolean) => {
        if (tm) {
            setTestModeMsg(
                "Now in test mode, please be aware that the assets on the test chain are worthless"
            );
        } else {
            setTestModeMsg("Switch to TestMode");
        }
        updateUserProp({
            email: userProp.email,
            testMode: tm,
            selectedChainCode: undefined,
            accountAddrList: undefined,
            selectedOrderNo: undefined,
            w3eapAddr: undefined,
            factoryAddr: undefined,
            bigBrotherPasswdAddr: undefined,
        });
    };

    const updateSelectedChain = (cc: Set<never>) => {
        console.log("updateSelectedChain:", cc);
        console.log("updateSelectedChain2:", cc.values());
        let chainCode = cc.values().next();

        updateUserProp({
            email: userProp.email,
            testMode: undefined,
            selectedChainCode: chainCode.value,
            accountAddrList: undefined,
            selectedOrderNo: undefined,
            w3eapAddr: undefined,
            factoryAddr: undefined,
            bigBrotherPasswdAddr: undefined,
        });
    };

    const myDefault = {
        size: "sm",
        bordered: false,
    };
    const myChecked = {
        size: "md",
        bordered: true,
    };

    const [morphl2testState, setMorphl2testState] = useState(myDefault);
    const [scrolltestState, setScrolltestState] = useState(myDefault);
    const [lineatestState, setLineatestState] = useState(myDefault);
    const [sepoliaState, setSepoliaState] = useState(myDefault);
    const [defaultAnvilState, setDefaultAnvilState] = useState(myDefault);
    const [ethereumMainnetState, setEthereumMainnetState] = useState(myDefault);
    const [neoxtestState, setNeoxtestState] = useState(myDefault);
    const [arbitrumtestState, setArbitrumtestState] = useState(myDefault);

    const [solanatestnetState, setSolanatestnetState] = useState(myDefault);

    const setChainCodeHere = (cc: ChainCode) => {
        // console.log("setChainCodeHere,2:", cc);
        // setMorphl2testState(myDefault);
        // setDefaultAnvilState(myDefault);
        // setEthereumMainnetState(myDefault);
        // setScrolltestState(myDefault);
        // setLineatestState(myDefault);
        // setSepoliaState(myDefault);
        // setNeoxtestState(myDefault);
        // setArbitrumtestState(myDefault);
        // setSolanatestnetState(myDefault);
        // if (cc == ChainCode.MORPH_TEST_CHAIN) {
        //     setMorphl2testState(myChecked);
        // } else if (cc == ChainCode.DEFAULT_ANVIL_CHAIN) {
        //     setDefaultAnvilState(myChecked);
        // } else if (cc == ChainCode.ETHEREUM_MAIN_NET) {
        //     setEthereumMainnetState(myChecked);
        // } else if (cc == ChainCode.SCROLL_TEST_CHAIN) {
        //     setScrolltestState(myChecked);
        // } else if (cc == ChainCode.LINEA_TEST_CHAIN) {
        //     setLineatestState(myChecked);
        // } else if (cc == ChainCode.SEPOLIA_CHAIN) {
        //     setSepoliaState(myChecked);
        // } else if (cc == ChainCode.NEOX_TEST_CHAIN) {
        //     setNeoxtestState(myChecked);
        // } else if (cc == ChainCode.ARBITRUM_TEST_CHAIN) {
        //     setArbitrumtestState(myChecked);
        // } else if (cc == ChainCode.SOLANA_TEST_CHAIN) {
        //     setSolanatestnetState(myChecked);
        // }
    };

    // if (initChainRef.current == "[init]") {
    //     setChainCodeHere(userProp.selectedChainCode);
    //     initChainRef.current = userProp.selectedChainCode;
    // }
    useEffect(() => {
        console.log("setChainCodeHere,1:", userProp);
        // setChainCodeHere(userProp.selectedChainCode);
    }, [userProp]);
    //
    // // // ////////////////////

    const handleClick = (chainCode: ChainCode) => {
        console.log(chainCode);
        if (ChainCode.ETHEREUM_MAIN_NET == chainCode) {
            alert("not supprted " + chainCode + " this time.");
            chainCode = userProp.selectedChainCode;
        }
        console.log("do a choice in chainIcons,userPropState:", userProp);

        updateUserProp({
            email: userProp.email,
            testMode: undefined,
            selectedChainCode: chainCode,
            accountAddrList: undefined,
            selectedOrderNo: undefined,
            w3eapAddr: undefined,
            factoryAddr: undefined,
            bigBrotherPasswdAddr: undefined,
        });
        // // //
        // setChainCodeHere(chainCode);
        // console.log("id_setChainForm_button click before..");
        // document.getElementById("id_setChainForm_code").value =
        //     chainCode.toString();
        // document.getElementById("id_setChainForm_button").click();
        // console.log("id_setChainForm_button click afetr!");
    };

    return (
        <div style={{ display: "flex" }}>
            <div
                className="flex gap-3 items-center"
                style={{ cursor: "pointer", zIndex: 2 }}
            >
                <Switch
                    defaultSelected={userProp.testMode}
                    isSelected={userProp.testMode}
                    onValueChange={updateTestMode}
                    size={"sm"}
                    title={testModeMsg}
                ></Switch>

                {latestChains().map((cc) => (
                    <Tooltip content={cc.title}>
                        <Avatar
                            src={cc.img}
                            size={cc.size}
                            isBordered={cc.bordered}
                            onClick={() => {
                                handleClick(cc.chainCode);
                            }}
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                ))}
            </div>
            <div
                style={{
                    position: "absolute",
                    left: "1010px",
                    width: "150px",
                    backgroundColor: "transparent",
                    zIndex: 1,
                }}
            >
                <Select
                    selectionMode="single"
                    className="max-w-xs"
                    style={{
                        backgroundColor: "transparent",
                    }}
                    defaultSelectedKeys={[]}
                    label=" "
                    selectedKeys={
                        [] // selectedChain
                    }
                    onSelectionChange={updateSelectedChain}
                >
                    {(
                        currentAllChains(
                            userProp.testMode
                        ) as CollectionElement<object>
                    ).map((item: any) => (
                        <SelectItem
                            key={item.chainCode}
                            startContent={
                                <Avatar
                                    src={item.img}
                                    color="primary"
                                    radius="sm"
                                />
                            }
                        >
                            {item.title}
                        </SelectItem>
                    ))}

                    <SelectItem key={"bottomLine"} startContent={<p></p>}>
                        ------------
                    </SelectItem>
                    {/* <SelectItem key={"space"} startContent={<p></p>}>
                            {" "}
                        </SelectItem> */}
                </Select>
            </div>
        </div>
    );
};

export const SelectedChainIcon = ({ userProp }: { userProp: UserProperty }) => {
    if (typeof window !== "undefined") {
        console.log("SelectedChainIcon, we are running on the client");
    } else {
        console.log("SelectedChainIcon, we are running on the server");
    }
    const [myChainCode, setMyChainCode] = useState(ChainCode.UNKNOW);
    useEffect(() => {
        console.log("setMyChainCode,chainCode:", userProp);
        setMyChainCode(userProp.selectedChainCode);
    }, [userProp]);
    console.log("SelectedChainIcon,chainCode:", userProp);
    if (myChainCode == ChainCode.DEFAULT_ANVIL_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="anvil testnet">
                        <Avatar
                            src="/chain/anvil.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.MORPH_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="MorphL2 testnet">
                        <Avatar
                            src="/chain/morphl2test.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.SCROLL_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="scroll sepolia testnet">
                        <Avatar
                            src="/chain/scrolltest.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.LINEA_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="linea sepolia testnet">
                        <Avatar
                            src="/chain/lineatest.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.SEPOLIA_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="sepolia testnet">
                        <Avatar
                            src="/chain/sepolia.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.NEOX_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="NeoX testnet">
                        <Avatar
                            src="/chain/neoxtest.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.ARBITRUM_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="Arbitrum testnet">
                        <Avatar
                            src="/chain/arbitrumtest.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (myChainCode == ChainCode.SOLANA_TEST_CHAIN) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="solana testnet">
                        <Avatar
                            src="/chain/solanatest.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else if (userProp.selectedChainCode == ChainCode.ETHEREUM_MAIN_NET) {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="Ethereum">
                        <Avatar
                            src="/chain/ethereum.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    } else {
        return (
            <div className="flex gap-3 items-center">
                <Badge content="" color="secondary">
                    <Tooltip content="unknow">
                        <Avatar
                            src="/chain/unknow.png"
                            size="sm"
                            color="primary"
                            radius="sm"
                        />
                    </Tooltip>
                </Badge>
            </div>
        );
    }
};
