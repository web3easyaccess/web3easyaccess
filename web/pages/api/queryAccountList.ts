import { NextApiResponse, NextApiRequest } from "next";

import { queryAccountList } from "../../src/app/lib/chainQuery";
import myCookies from "@/app/serverside/myCookies";
import { getFactoryAddr } from "@/app/serverside/blockchain/chainWriteClient";
type UserAccount = {
    addr: string;
    created: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserAccount[]>
) {
    if (req.method === "POST") {
        console.log("req..11...:");
    }

    //   console.log("req...22..:");
    //   console.log(req.body);
    //   const ownerId = JSON.parse(req.body).ownerId;
    //   const aList = await queryAccountList(
    //     "DEFAULT_ANVIL_CHAIN",
    //     getFactoryAddr("DEFAULT_ANVIL_CHAIN"),
    //     ownerId
    //   );
    // console.log("queryAccountList res:", aList);
    res.status(200).json([]);
    // res.status(200).json({ name: "John Doe" });
}
