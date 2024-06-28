"use client";

import { verifyEmail } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import Passwd from "./passwd";

/*
email verify code for new user;
*/

export default function Page({ style }) {
  const [resultMsg, dispatch] = useFormState(verifyEmail, undefined);

  return (
    <div style={style}>
      <form action={dispatch}>
        <input
          id="id_login_email_verify"
          style={{ display: "none" }}
          name="email"
          placeholder="Email"
          required
        />
        <input
          id="id_login_passwd_verify"
          type="password"
          style={{ display: "none" }}
          name="code"
          placeholder="Password"
          required
        />

        <Passwd id="id_login_passwd_ui_verify"></Passwd>

        <div>{resultMsg && <p>1:{resultMsg}</p>}</div>
        <p>&nbsp;</p>
        <VerifyCode />
      </form>
    </div>
  );
}

function VerifyCode() {
  const { pending } = useFormStatus();

  const handleClick = (event) => {
    if (pending) {
      event.preventDefault();
    }

    let email = document.getElementById("id_login_email_ui").value;
    document.getElementById("id_login_email_verify").value = email;

    let code = document.getElementById("id_login_passwd_ui_verify").value;
    document.getElementById("id_login_passwd_verify").value = code;
  };

  return (
    // <button aria-disabled={pending} type="submit" onClick={handleClick}>
    //   Login
    // </button>

    <Button
      disabled={pending}
      type="submit"
      onPress={handleClick}
      color="primary"
    >
      Verify
    </Button>
  );
}
