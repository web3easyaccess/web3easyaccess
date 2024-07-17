"use client";

import { userLogout } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

export function Logout() {
  const [resultMsg, dispatch] = useFormState(userLogout, undefined);

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
            color: "FireBrick",
            backgroundColor: "white",
            borderStyle: "solid",
            borderWidth: "2px",
            marginLeft: "30px",
          }}
        >
          Logout
        </Button>
      </form>
    </div>
  );
}
