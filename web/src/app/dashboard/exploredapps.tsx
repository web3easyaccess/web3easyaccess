"use client";
import { useEffect, useState } from "react";
import WalletConnectApp from "../walletconnect/pages/_app";

export default function WalletConnect() {
    const [wallect, setWallect] = useState(<div></div>);
    useEffect(() => {
        const fetchWallect = async () => {
            console.log("fetchWallect...");
            setWallect(<WalletConnectApp></WalletConnectApp>);
        };
        fetchWallect();
    }, []);

    return <div>{wallect}</div>;
}
