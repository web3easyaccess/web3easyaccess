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
                    {"explore OP Mainnet's DApps"}
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
                    {"explore Ethereum Mainnet's DApps"}
                </Link>
                <Tips></Tips>
            </div>
        );
    } else {
        return <div></div>;
    }
}
