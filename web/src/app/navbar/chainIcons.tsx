import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Tooltip,
    Badge,
} from "@nextui-org/react";
import { useState, useRef, useEffect, MutableRefObject } from "react";

import { useFormState, useFormStatus } from "react-dom";

import { saveChainCode } from "../serverside/serverActions";

import { ChainCode, chainCodeFromString } from "../lib/myTypes";
import { UpdateUserProperty, UserProperty } from "../storage/userPropertyStore";

export const ChainIcons = ({
    userProp,
    updateUserProp,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
}) => {
    console.log("chain icons, userPropref:", userProp);
    console.log("chain icons, userPropState:", userProp);

    // const initChainRef = useRef("[init]");

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
        console.log("setChainCodeHere,2:", cc);
        setMorphl2testState(myDefault);
        setDefaultAnvilState(myDefault);
        setEthereumMainnetState(myDefault);
        setScrolltestState(myDefault);
        setLineatestState(myDefault);
        setSepoliaState(myDefault);
        setNeoxtestState(myDefault);
        setArbitrumtestState(myDefault);

        setSolanatestnetState(myDefault);
        if (cc == ChainCode.MORPH_TEST_CHAIN) {
            setMorphl2testState(myChecked);
        } else if (cc == ChainCode.DEFAULT_ANVIL_CHAIN) {
            setDefaultAnvilState(myChecked);
        } else if (cc == ChainCode.ETHEREUM_MAIN_NET) {
            setEthereumMainnetState(myChecked);
        } else if (cc == ChainCode.SCROLL_TEST_CHAIN) {
            setScrolltestState(myChecked);
        } else if (cc == ChainCode.LINEA_TEST_CHAIN) {
            setLineatestState(myChecked);
        } else if (cc == ChainCode.SEPOLIA_CHAIN) {
            setSepoliaState(myChecked);
        } else if (cc == ChainCode.NEOX_TEST_CHAIN) {
            setNeoxtestState(myChecked);
        } else if (cc == ChainCode.ARBITRUM_TEST_CHAIN) {
            setArbitrumtestState(myChecked);
        } else if (cc == ChainCode.SOLANA_TEST_CHAIN) {
            setSolanatestnetState(myChecked);
        }
    };

    // if (initChainRef.current == "[init]") {
    //     setChainCodeHere(userProp.selectedChainCode);
    //     initChainRef.current = userProp.selectedChainCode;
    // }
    useEffect(() => {
        console.log("setChainCodeHere,1:", userProp);
        setChainCodeHere(userProp.selectedChainCode);
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
        setChainCodeHere(chainCode);
        // console.log("id_setChainForm_button click before..");
        // document.getElementById("id_setChainForm_code").value =
        //     chainCode.toString();
        // document.getElementById("id_setChainForm_button").click();
        // console.log("id_setChainForm_button click afetr!");
    };

    // function SetChainForm({}) {
    //     const [message, formAction] = useFormState(saveChainCode, null);
    //     return (
    //         <form action={formAction} style={{ display: "none" }}>
    //             <input
    //                 id="id_setChainForm_code"
    //                 name="newChainCode"
    //                 defaultValue={userPropState.selectedChainCode.toString()}
    //             />
    //             <button id="id_setChainForm_button" type="submit">
    //                 Set Chain Code
    //             </button>
    //             {message}
    //         </form>
    //     );
    // }

    return (
        <div className="flex gap-3 items-center" style={{ cursor: "pointer" }}>
            {/* <SetChainForm /> */}
            {/* <Badge content="" color="secondary"> */}

            <Tooltip content="Arbitrum testnet">
                <Avatar
                    src="/chain/arbitrumtest.png"
                    size={arbitrumtestState.size}
                    isBordered={arbitrumtestState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.ARBITRUM_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>

            <Tooltip content="NeoX testnet">
                <Avatar
                    src="/chain/neoxtest.png"
                    size={neoxtestState.size}
                    isBordered={neoxtestState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.NEOX_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>

            <Tooltip content="Solana testnet">
                <Avatar
                    src="/chain/solanatest.png"
                    size={solanatestnetState.size}
                    isBordered={solanatestnetState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.SOLANA_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>

            <Tooltip content="Sepolia testnet">
                <Avatar
                    src="/chain/sepolia.png"
                    size={sepoliaState.size}
                    isBordered={sepoliaState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.SEPOLIA_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>

            <Tooltip content="Linea Sepolia testnet">
                <Avatar
                    src="/chain/lineatest.png"
                    size={lineatestState.size}
                    isBordered={lineatestState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.LINEA_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>

            <Tooltip content="Scroll Sepolia testnet">
                <Avatar
                    src="/chain/scrolltest.png"
                    size={scrolltestState.size}
                    isBordered={scrolltestState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.SCROLL_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>
            {/* </Badge> */}

            <Tooltip content="MorphL2 testnet">
                <Avatar
                    src="/chain/morphl2test.png"
                    size={morphl2testState.size}
                    isBordered={morphl2testState.bordered}
                    onClick={() => {
                        handleClick(ChainCode.MORPH_TEST_CHAIN);
                    }}
                    color="primary"
                    radius="sm"
                />
            </Tooltip>
            <div style={{ display: "none" }}>
                <Tooltip content="anvil testnet">
                    <Avatar
                        src="/chain/anvil.png"
                        size={defaultAnvilState.size}
                        isBordered={defaultAnvilState.bordered}
                        onClick={() => {
                            handleClick(ChainCode.DEFAULT_ANVIL_CHAIN);
                        }}
                        color="primary"
                        radius="sm"
                    />
                </Tooltip>

                <Tooltip content="Ethereum">
                    <Avatar
                        src="/chain/ethereum.png"
                        size={ethereumMainnetState.size}
                        isBordered={ethereumMainnetState.bordered}
                        onClick={() => {
                            handleClick(ChainCode.ETHEREUM_MAIN_NET);
                        }}
                        color="primary"
                        radius="sm"
                    />
                </Tooltip>
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
