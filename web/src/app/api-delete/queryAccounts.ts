import { NextApiResponse, NextApiRequest } from "next";

type UserAccount = {
  addr: string;
  created: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAccount[]>
) {
  if (req.method === "GET") {
    console.log("req.....:");
    console.log(req);
    const aList = [
      { addr: "0xa12345aaa", created: false },
      { addr: "0xb12345bbb", created: false },
    ];
    res.status(200).json(aList);
  }
  // res.status(200).json({ name: "John Doe" });
}
