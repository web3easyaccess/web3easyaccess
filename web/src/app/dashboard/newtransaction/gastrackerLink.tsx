import { ChainCode } from "@/app/lib/myTypes";
import { Link } from "@nextui-org/react";

export default function GastrackerLink({
    chainCode,
}: {
    chainCode: ChainCode;
}) {
    if (chainCode == ChainCode.ETHEREUM_MAIN_NET) {
        return (
            <Link
                href="https://etherscan.io/gastracker#chart_gasprice"
                isExternal
            >
                &nbsp;&nbsp;Ethereum Mainnet Gastracker
            </Link>
        );
    } else {
        return (
            <p>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
        );
    }
}
