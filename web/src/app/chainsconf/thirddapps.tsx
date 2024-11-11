import { CardBody, Link } from "@nextui-org/react";
import { ChainCode } from "../lib/myTypes";

export default function ThirdDapps({ chainCode }: { chainCode: ChainCode }) {
    if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN) {
        return (
            <div>
                <Link
                    isExternal
                    href="https://www.superchain.eco/projects"
                    showAnchorIcon
                >
                    {"explore OP Mainnet's Dapps"}
                </Link>
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
                    {"explore Ethereum Mainnet's Dapps"}
                </Link>
            </div>
        );
    } else {
        return <div></div>;
    }
}
