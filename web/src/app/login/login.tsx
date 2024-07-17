"use client";

import { checkEmail } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Textarea,
  ScrollShadow,
} from "@nextui-org/react";

import Passwd from "./passwd";
import { setInputValueById, getInputValueById } from "../lib/elementById";

import { useState } from "react";
import { Navbar4Login } from "../navbar/navbar";

import VerifyCode from "./verifyCode";

export default function Page<T extends { chainCode: string }>({
  chainCode,
}: T) {
  const [displayVerify, setDisplayVerify] = useState(false);
  // const [displayPermit, setDisplayPermit] = useState(false);

  const [resultMsg, dispatch] = useFormState(checkEmail, undefined);

  return (
    <div>
      <Navbar4Login chainCode={chainCode}></Navbar4Login>
      <Card
        className="py-4"
        style={{
          margin: "30 auto",
          marginTop: "50px",
          marginLeft: "50px",
          marginRight: "50px",
        }}
      >
        <div
          style={{
            width: "900px",
            height: "300px",
            margin: "0 auto",
            marginTop: "100px",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ScrollShadow className="w-[400px] h-[300px]">
            <div>
              <p>Welcome to Web3EasyAccess!</p>
              <p>
                Please enter your email address and verify that it belongs to
                you using a verification code.
              </p>
              <p style={{ color: "red" }}>Notice:</p>
              <p>
                Please be aware that once you are unable to log in to your email
                to retrieve the verification code, you will permanently lose
                your account and the assets in it.
              </p>
            </div>
          </ScrollShadow>
          <div
            style={{
              display: "block",
              marginLeft: "60px",
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
                defaultValue=""
                className="max-w-xs"
              />
              {/* <Passwd id="id_login_passwd_ui"></Passwd> */}
              <div id="id_rtn_message" style={{ display: "none" }}>
                {resultMsg && <p>{resultMsg}</p>}
              </div>
              <div style={{ display: "block" }}>
                <p id="id_rtn_message_show"></p>
              </div>
              <p>&nbsp;</p>
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
      </Card>
    </div>
  );
}

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SubmitEmail<T extends { style: string; setDisplayVerify: any }>({
  style,
  setDisplayVerify, // , setDisplayPermit
}: T) {
  const router = useRouter();
  const { pending } = useFormStatus();

  const handleClick = (event: any) => {
    if (pending) {
      event.preventDefault();
      return;
    }

    let email = (
      document.getElementById("id_login_email_ui") as HTMLInputElement
    ).value;
    (document.getElementById("id_login_email") as HTMLInputElement).value =
      email; //

    setTimeout(async () => {
      var kk = 0;
      while (true) {
        let rtn = document.getElementById("id_rtn_message")?.innerText;
        if (rtn != null && rtn.length > 0) {
          let rrr = JSON.parse(rtn);
          if (rrr.success) {
            if (rrr.msg == "[existing]") {
              router.push("/dashboard");
              return;
            }
            // new user
            setDisplayVerify(true);
            console.log("mmmmsssg:", rrr.msg);
            // setInputValueById("id_rtn_message_show", rrr.msg);
          }
          document.getElementById("id_rtn_message_show").innerHTML = rrr.msg;
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
