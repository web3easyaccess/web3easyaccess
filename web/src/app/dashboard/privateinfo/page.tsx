"use server";
import Main from "../page";

import { Menu } from "../../lib/myTypes";

export default async function Page() {
    const selectedMenu = Menu.PrivateSetting;

    return <Main selectedMenu={selectedMenu}></Main>;
}
