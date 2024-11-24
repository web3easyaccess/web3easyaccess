import { CardBody, Link } from "@nextui-org/react";
import { ChainCode } from "../lib/myTypes";

export default function ThirdDapps({ chainCode }: { chainCode: ChainCode }) {
    const Tips = () => {
        return (
            <>
                <p>{`Tip: If you see a "waiting" message in a DApp, it usually means`}</p>
                <p>{`you'll need to come back to this page to give it permission to continue.`}</p>
            </>
        );
    };
    if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://www.superchain.eco/projects"
                    showAnchorIcon
                >
                    {"explore DApps on OP Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else if (chainCode == ChainCode.MANTLE_MAIN_CHAIN) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://www.mantle.xyz/dapp"
                    showAnchorIcon
                >
                    {"explore DApps on Mantle Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else if (chainCode == ChainCode.ETHEREUM_MAIN_NET) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://ethereum.org/en/dapps/#beginner"
                    showAnchorIcon
                >
                    {"explore  DApps on Ethereum Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else if (chainCode == ChainCode.LINEA_CHAIN) {
        return (
            <div>
                <Link isExternal href="https://linea.build/apps" showAnchorIcon>
                    {"explore  DApps on Linea Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else if (chainCode == ChainCode.MORPH_CHAIN) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://www.morphl2.io/apps"
                    showAnchorIcon
                >
                    {"explore  DApps on Morph Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else if (
        chainCode == ChainCode.BSC_MAIN_NET ||
        chainCode == ChainCode.OPBNB_MAIN_NET
    ) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://dappbay.bnbchain.org/"
                    showAnchorIcon
                >
                    {"explore  DApps on BSC Mainnet and OPBNB Mainnet"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else {
        return <div></div>;
    }
}
