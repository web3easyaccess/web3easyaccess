import { ChainCode } from "@/app/lib/myTypes";
import { Link } from "@nextui-org/react";

const gasPrice = (cc: ChainCode) => {
    switch (cc) {
        case ChainCode.ETHEREUM_MAIN_NET:
            return "https://etherscan.io/gastracker#chart_gasprice";
        case ChainCode.OPTIMISM_MAIN_CHAIN:
            return "0.0011 Gwei";
        case ChainCode.OPTIMISM_TEST_CHAIN:
            return "0.000000799 Gwei";
        case ChainCode.LINEA_CHAIN:
            return "https://lineascan.build/gastracker";
        case ChainCode.MORPH_CHAIN:
            return "https://explorer.morphl2.io/gas-tracker";
        case ChainCode.SCROLL_CHAIN:
            return "https://scrollscan.com/gastracker";
        case ChainCode.BSC_MAIN_NET:
            return "https://bscscan.com/gastracker";
        case ChainCode.OPBNB_MAIN_NET:
            return "0.000000010 Gwei";
        case ChainCode.BLAST_MAIN_CHAIN:
            return "0.0011 Gwei";
        default:
            return "";
    }
};

export default function GastrackerLink({
    chainCode,
}: {
    chainCode: ChainCode;
}) {
    const gp = gasPrice(chainCode);

    return (
        <div>
            {gp.startsWith("http") ? (
                <>
                    <Link href={gp} isExternal>
                        Gas Tracker
                    </Link>
                </>
            ) : (
                <>
                    <div
                        style={
                            gp == "" ? { display: "none" } : { display: "flex" }
                        }
                    >
                        <p style={{ color: "grey" }}>Gas Price ≈&nbsp;</p>
                        <p>{gasPrice(chainCode)}</p>
                    </div>
                </>
            )}
        </div>
    );
}
