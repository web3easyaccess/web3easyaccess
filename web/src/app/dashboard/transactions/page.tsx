"use server";
import Main from "../page";

import { Menu } from "../../lib/myTypes";

export default async function Page() {
    const selectedMenu = Menu.Transactions;

    return <Main selectedMenu={selectedMenu}></Main>;
}
