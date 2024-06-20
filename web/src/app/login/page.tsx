"use client";

import { checkEmail } from "../lib/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import Passwd from "./passwd";

import { useState } from "react";
import Navbar from "../navbar/navbar";

import VerifyCode from "./verifyCode";

export default function Page() {
  const [displayVerify, setDisplayVerify] = useState(false);
  // const [displayPermit, setDisplayPermit] = useState(false);

  const [resultMsg, dispatch] = useFormState(checkEmail, undefined);

  return (
    <div>
      <Navbar></Navbar>
      <div
        style={{
          width: "300px",
          height: "300px",
          margin: "0 auto",
          marginTop: "100px",
        }}
      >
        <form action={dispatch}>
          <input
            id="id_login_email"
            style={{ display: "none" }}
            name="email"
            placeholder="Email"
            required
          />
          {/* <input
          id="id_login_passwd"
          type="password"
          style={{ display: "none" }}
          name="password"
          placeholder="Password"
          required
        /> */}

          <Input
            id="id_login_email_ui"
            isRequired
            type="email"
            label="Email"
            defaultValue="zhtkeepup@gmail.com"
            className="max-w-xs"
          />
          {/* <Passwd id="id_login_passwd_ui"></Passwd> */}

          <div id="id_rtn_message" style={{ display: "block" }}>
            {resultMsg && <p>{resultMsg}</p>}
          </div>

          <SubmitEmail
            style={
              displayVerify // || displayPermit
                ? { display: "none" }
                : { display: "block" }
            }
            setDisplayVerify={setDisplayVerify}
            // setDisplayPermit={setDisplayPermit}
          />
        </form>

        <VerifyCode
          style={displayVerify ? { display: "block" } : { display: "none" }}
        ></VerifyCode>
      </div>
    </div>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SubmitEmail({
  style,
  setDisplayVerify, // , setDisplayPermit
}) {
  const router = useRouter();
  const { pending } = useFormStatus();

  const handleClick = (event) => {
    if (pending) {
      event.preventDefault();
      return;
    }

    let email = document.getElementById("id_login_email_ui").value;
    document.getElementById("id_login_email").value = email; //

    setTimeout(async () => {
      var kk = 0;
      while (true) {
        let msg = document.getElementById("id_rtn_message")?.innerText;
        if (msg != null && msg.length > 0) {
          console.log(msg);
          if (msg.indexOf("welcome") >= 0) {
            // exists user
            router.push("/dashboard");
            // setDisplayPermit(true);
          } else if (msg.indexOf("verify code") >= 0) {
            // new user
            setDisplayVerify(true);
          }
          break;
        }
        kk++;
        if (kk > 120) {
          // break if more than 10 minutes
          break;
        }
        await sleep(500);
      }
    }, 500);
  };

  return (
    // <button aria-disabled={pending} type="submit" onClick={handleClick}>
    //   Login
    // </button>
    <>
      <Button
        disabled={pending}
        style={style}
        type="submit"
        onPress={handleClick}
        color="primary"
      >
        Submit Email
      </Button>
    </>
  );
}
