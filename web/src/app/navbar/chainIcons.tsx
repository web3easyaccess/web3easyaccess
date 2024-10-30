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

const allChains: {
    closed: boolean | undefined;
    chainCode: ChainCode;
    img: string;
    title: string;
    isTestnet: boolean;
    size: "sm" | "md";
    bordered: boolean;
}[] = [
    {
        closed: false,
        chainCode: ChainCode.AIACHAIN_TEST_CHAIN,
        img: "/chain/aiachaintest.png",
        title: "AIA Testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.NEOX_TEST_CHAIN,
        img: "/chain/neoxtest.png",
        title: "NeoX testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.SOLANA_TEST_CHAIN,
        img: "/chain/solanatest.png",
        title: "Solana testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.SEPOLIA_CHAIN,
        img: "/chain/sepolia.png",
        title: "Sepolia testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.LINEA_TEST_CHAIN,
        img: "/chain/lineatest.png",
        title: "Linea Sepolia",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.SCROLL_TEST_CHAIN,
        img: "/chain/scrolltest.png",
        title: "Scroll Sepolia",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: false,
        chainCode: ChainCode.MORPH_TEST_CHAIN,
        img: "/chain/morphl2test.png",
        title: "Morph testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.DEFAULT_ANVIL_CHAIN,
        img: "/chain/anvil.png",
        title: "anvil testnet",
        isTestnet: true,
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.ETHEREUM_MAIN_NET,
        img: "/chain/ethereum.png",
        title: "Ether eum",
        isTestnet: false,
        size: "sm",
        bordered: false,
    },
    {
        closed: true,
        chainCode: ChainCode.AIACHAIN_MAIN_CHAIN,
        img: "/chain/aiachain.png",
        title: "AIA Mainnet",
        isTestnet: false,
        size: "sm",
        bordered: false,
    },
];

const supportedChains = () => {
    return allChains.filter((c) => c.closed != true);
};

const showingChains = (testMode: boolean) => {
    return supportedChains().filter((s) => s.isTestnet == testMode);
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

        const allChains = showingChains(userProp.testMode);

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
        console.log("validLatestChains:", validLatestChains);

        validLatestChains.forEach((c) => {
            if (c.chainCode == userProp.selectedChainCode) {
                c.bordered = true;
                c.size = "md";
            }
        });

        if (validLatestChains.length > 3) {
            return validLatestChains.slice(0, 3);
        } else {
            return validLatestChains;
        }
    };

    const testModeMsg = () => {
        if (userProp.testMode) {
            return "Now in test mode, please be aware that the assets on the test chain are worthless";
        } else {
            return "Switch to TestMode";
        }
    };
    const updateTestMode = (tm: boolean) => {
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

    // const myDefault = {
    //     size: "sm",
    //     bordered: false,
    // };
    // const myChecked = {
    //     size: "md",
    //     bordered: true,
    // };

    // const [morphl2testState, setMorphl2testState] = useState(myDefault);
    // const [scrolltestState, setScrolltestState] = useState(myDefault);
    // const [lineatestState, setLineatestState] = useState(myDefault);
    // const [sepoliaState, setSepoliaState] = useState(myDefault);
    // const [defaultAnvilState, setDefaultAnvilState] = useState(myDefault);
    // const [ethereumMainnetState, setEthereumMainnetState] = useState(myDefault);
    // const [neoxtestState, setNeoxtestState] = useState(myDefault);
    // const [arbitrumtestState, setArbitrumtestState] = useState(myDefault);

    // const [solanatestnetState, setSolanatestnetState] = useState(myDefault);

    // const setChainCodeHere = (cc: ChainCode) => {
    //     // console.log("setChainCodeHere,2:", cc);
    //     // setMorphl2testState(myDefault);
    //     // setDefaultAnvilState(myDefault);
    //     // setEthereumMainnetState(myDefault);
    //     // setScrolltestState(myDefault);
    //     // setLineatestState(myDefault);
    //     // setSepoliaState(myDefault);
    //     // setNeoxtestState(myDefault);
    //     // setArbitrumtestState(myDefault);
    //     // setSolanatestnetState(myDefault);
    //     // if (cc == ChainCode.MORPH_TEST_CHAIN) {
    //     //     setMorphl2testState(myChecked);
    //     // } else if (cc == ChainCode.DEFAULT_ANVIL_CHAIN) {
    //     //     setDefaultAnvilState(myChecked);
    //     // } else if (cc == ChainCode.ETHEREUM_MAIN_NET) {
    //     //     setEthereumMainnetState(myChecked);
    //     // } else if (cc == ChainCode.SCROLL_TEST_CHAIN) {
    //     //     setScrolltestState(myChecked);
    //     // } else if (cc == ChainCode.LINEA_TEST_CHAIN) {
    //     //     setLineatestState(myChecked);
    //     // } else if (cc == ChainCode.SEPOLIA_CHAIN) {
    //     //     setSepoliaState(myChecked);
    //     // } else if (cc == ChainCode.NEOX_TEST_CHAIN) {
    //     //     setNeoxtestState(myChecked);
    //     // } else if (cc == ChainCode.ARBITRUM_TEST_CHAIN) {
    //     //     setArbitrumtestState(myChecked);
    //     // } else if (cc == ChainCode.SOLANA_TEST_CHAIN) {
    //     //     setSolanatestnetState(myChecked);
    //     // }
    // };

    // // if (initChainRef.current == "[init]") {
    // //     setChainCodeHere(userProp.selectedChainCode);
    // //     initChainRef.current = userProp.selectedChainCode;
    // // }
    // useEffect(() => {
    //     console.log("setChainCodeHere,1:", userProp);
    //     // setChainCodeHere(userProp.selectedChainCode);
    // }, [userProp]);
    //
    // // // ////////////////////

    const handleClick = (chainCode: ChainCode) => {
        console.log(chainCode);
        if (ChainCode.ETHEREUM_MAIN_NET == chainCode) {
            // alert("not supprted " + chainCode + " this time.");
            // chainCode = userProp.selectedChainCode;
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
                    title={testModeMsg()}
                ></Switch>

                {latestChains().map((cc) => (
                    <Tooltip content={cc.title} key={cc.chainCode}>
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
                        showingChains(
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

    return (
        <>
            {allChains
                .filter((c) => c.chainCode == userProp.selectedChainCode)
                .map((c) => (
                    <div className="flex gap-3 items-center" key={c.chainCode}>
                        <Badge content="" color="secondary">
                            <Tooltip content={c.title}>
                                <Avatar
                                    src={c.img}
                                    size={c.size}
                                    color="primary"
                                    radius="sm"
                                />
                            </Tooltip>
                        </Badge>
                    </div>
                ))}
        </>
    );
};
