"use client";

import { userLogout } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { UserProperty } from "../storage/userPropertyStore";
import { exampleEmail } from "../lib/myTypes";

export function Logout({ userProp }: { userProp: UserProperty }) {
    const [resultMsg, dispatch] = useFormState(userLogout, undefined);
    console.log("userProp in logout:", userProp);
    //   setTimeout(() => {
    //     document.getElementById("id_button_logout")?.click();
    //   }, 2000);

    return (
        <div>
            <form action={dispatch}>
                <input
                    id="id_logout_byebye"
                    name="byebye"
                    style={{ display: "none" }}
                />

                <div id="id_rtn_message" style={{ display: "none" }}>
                    {resultMsg && <p>{resultMsg}</p>}
                </div>
                <Button
                    id="id_button_logout"
                    type="submit"
                    style={{
                        fontWeight: "bold",
                        color:
                            userProp.email == exampleEmail ||
                            userProp.email == ""
                                ? "Green"
                                : "FireBrick",
                        backgroundColor: "white",
                        borderStyle: "solid",
                        borderWidth: "2px",
                        marginLeft: "30px",
                    }}
                >
                    {userProp.email == exampleEmail || userProp.email == ""
                        ? "Login"
                        : "Logout"}
                </Button>
            </form>
        </div>
    );
}
