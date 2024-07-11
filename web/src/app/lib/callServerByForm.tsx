"use client";

import { checkEmail } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { useRef, useState } from "react";

import { getInputValueById, setInputValueById } from "./elementById";

/**
 * @param method : 服务端处理数据的方法名
 * @param outputDataJsonRef : useRef 类型.
 * @param buttonRef : useRef类型的hook, 在外部的点击事件(或其他触发事件)里应该执行该hook的 buttonRef.current.click(), 应该延时0.5秒触发;
 * @returns
 */
export default function Page({
  method,
  inputDataJsonRef,
  outputDataJsonRef,
  methodAfterServrReturn,
  buttonRef,
  show,
}) {
  const [returnJson, dispatch] = useFormState(method, "[init]");

  return (
    <div>
      <div style={show ? { display: "block" } : { display: "none" }}>
        <form action={dispatch}>
          <input id="id_input_data_json" defaultValue="" name="inputDataJson" />

          <input
            id="id_output_data_json"
            defaultValue={returnJson}
            name="inputDataJson"
          />

          <SubmitButton
            inputDataJsonRef={inputDataJsonRef}
            outputDataJsonRef={outputDataJsonRef}
            methodAfterServrReturn={methodAfterServrReturn}
            buttonRef={buttonRef}
            method={method}
          />
        </form>
      </div>
    </div>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SubmitButton({
  inputDataJsonRef,
  outputDataJsonRef,
  methodAfterServrReturn,
  buttonRef,
  method,
}) {
  const { pending } = useFormStatus();

  const handleClick = (event) => {
    console.log("callServerByForm was triggered, before pending");
    if (pending) {
      event.preventDefault();
      return;
    }
    console.log(
      `callServerByForm was triggered success1, inputData=${inputDataJsonRef.current}`
    );
    setInputValueById("id_input_data_json", inputDataJsonRef.current);

    console.log(
      `callServerByForm was triggered success2, inputData=${getInputValueById(
        "id_input_data_json"
      )}`
    );

    setTimeout(async () => {
      let kk = 0;
      while (true) {
        let msg = getInputValueById("id_output_data_json");

        if (msg != "[init]") {
          setInputValueById("id_output_data_json", "[init]");
          outputDataJsonRef.current = msg;
          console.log(
            "callServerByForm return data:",
            outputDataJsonRef.current
          );
          methodAfterServrReturn();
          break;
        }
        kk++;
        if (kk > 300) {
          // break if more than 10 minutes
          console.log("wait for server side timeout!");
          break;
        }
        await sleep(100);
      }
    }, 500);
  };

  return (
    <>
      <Button
        disabled={pending}
        type="submit"
        onPress={handleClick}
        color="primary"
        ref={buttonRef}
      >
        Submit
      </Button>
    </>
  );
}
