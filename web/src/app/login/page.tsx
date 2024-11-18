"use server";

import BottomBar from "../bottom/bottombar";
import Login from "./login";

export default async function Page() {
    return (
        <div>
            <Login></Login>
            <BottomBar marginTop={44}></BottomBar>
        </div>
    );
}
