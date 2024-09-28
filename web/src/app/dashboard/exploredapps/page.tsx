import Main from "../page";

import { Menu } from "../../lib/myTypes";

export default async function Page() {
    const selectedMenu = Menu.ExploreDapps;

    return <Main selectedMenu={selectedMenu}></Main>;
}
