import { NextApiResponse, NextApiRequest } from "next";

import { headers } from "next/headers";

import { saveChainCode } from "../../src/app/serverside/serverActions";
import myCookies from "@/app/serverside/myCookies";
import { getFactoryAddr } from "@/app/serverside/blockchain/chainWriteClient";
type UserAccount = {
    addr: string;
    created: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<object>
) {
    const headersList = headers();
    if (req.method === "POST") {
        console.log("req...22..:");
        console.log(req.body);
        const chainCode = JSON.parse(req.body).newChainCode;
        //  await saveChainCode(chainCode);
        res.status(200).json({ success: true });
        // res.status(200).json({ name: "John Doe" });
    } else {
        var a = 1 / 0;
    }
}
