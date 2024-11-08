import { Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { getPasswdState } from "../passwdauth/passwdAuthModal";

export default function IframeWallet({
    channelId,
    mainHostUrl,
    walletConnectHostUrl,
    passwdState,
}: {
    channelId: string;
    mainHostUrl: string;
    walletConnectHostUrl: string;
    passwdState: string;
}) {
    const Wc = ({ height }: { height: number }) => {
        return (
            <>
                <div id="div_w3eaWalletconnect">
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
                        style={{ width: "800px", height: height + "px" }}
                    />
                </div>
            </>
        );
    };

    const [wcHeight, setWcHeight] = useState(500);
    useEffect(() => {
        if (passwdState == "OK") {
            setWcHeight(500);
        } else {
            setWcHeight(1);
        }
    }, [passwdState]);

    return (
        <>
            <div style={{ height: 500 - wcHeight + "px" }}>
                <p>please check your password on [Passwd Auth]</p>
            </div>
            <div>
                <Wc height={wcHeight}></Wc>
            </div>
        </>
    );
}
