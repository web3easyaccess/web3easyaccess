import { Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { getPasswdState } from "../passwdauth/passwdAuthModal";
import ThirdDapps from "@/app/chainsconf/thirddapps";
import { ChainCode } from "@/app/lib/myTypes";

export default function IframeWallet({
    channelId,
    mainHostUrl,
    walletConnectHostUrl,
    passwdState,
    acctCreated,
    chainCode,
}: {
    channelId: string;
    mainHostUrl: string;
    walletConnectHostUrl: string;
    passwdState: string;
    acctCreated: boolean;
    chainCode: ChainCode;
}) {
    const Wc = ({ height }: { height: number }) => {
        return (
            <>
                <div
                    id="div_w3eaWalletconnect"
                    style={{
                        height: height + 20 + "px",
                    }}
                >
                    {height > 100 ? (
                        <ThirdDapps chainCode={chainCode}></ThirdDapps>
                    ) : null}

                    <iframe
                        id="w3eaWalletconnect"
                        src={
                            walletConnectHostUrl +
                            "/walletconnect?mainHostUrl=" +
                            mainHostUrl +
                            "&walletConnectHostUrl=" +
                            walletConnectHostUrl +
                            "&channelId=" +
                            channelId
                        }
                        style={{
                            width: "800px",
                            height: height + "px",
                            overflow: "scroll",
                        }}
                    />
                </div>
            </>
        );
    };

    const [wcHeight, setWcHeight] = useState(0);
    useEffect(() => {
        if (passwdState == "OK" && acctCreated) {
            setWcHeight(500);
        } else {
            setWcHeight(1);
        }
    }, [passwdState, acctCreated]);

    return (
        <div>
            <div>
                <Wc height={wcHeight}></Wc>
            </div>
            <div
                style={
                    wcHeight <= 1 ? { display: "block" } : { display: "none" }
                }
            >
                {wcHeight == 0 ? (
                    <p>hold...</p>
                ) : acctCreated ? (
                    <p>please check your password on [Passwd Auth]</p>
                ) : (
                    <p>
                        this account has not created! You can create it by send
                        first transaction.For example, send to yourself a
                        transaction with a value of 0
                    </p>
                )}
            </div>
        </div>
    );
}
