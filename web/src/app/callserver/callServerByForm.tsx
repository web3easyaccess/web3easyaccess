"use client";

import { checkEmail } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { useState } from "react";

/**
 * @param method : 服务端处理数据的方法名
 * @param inputDataJson : 请求数据对象转换后的json字符串
 * @param setOutputDataJson : useState hook里的set成员，用于将服务端返回的json字符串设置到指定的变量outputDataJson里.
 * @param buttonRef : useRef类型的hook, 在外部的点击事件(或其他触发事件)里应该执行该hook的 buttonRef.current.click(), 应该延时0.5秒触发;
 * @returns
 */
export default function Page({
  method,
  inputDataJson,
  setOutputDataJson,
  buttonRef,
}) {
  const [returnJson, dispatch] = useFormState(method, "[init]");

  return (
    <div>
      <div style={{ display: "none" }}>
        <form action={dispatch}>
          <input
            id="id_input_data_json"
            defaultValue={inputDataJson}
            name="inputDataJson"
          />

          <input
            id="id_output_data_json"
            defaultValue={returnJson}
            name="inputDataJson"
          />

          <SubmitButton
            setOutputDataJson={setOutputDataJson}
            buttonRef={buttonRef}
          />
        </form>
      </div>
    </div>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SubmitButton({ setOutputDataJson, buttonRef }) {
  const { pending } = useFormStatus();

  const handleClick = (event) => {
    console.log("callServerByForm was triggered,----1");
    if (pending) {
      event.preventDefault();
      return;
    }
    console.log("callServerByForm was triggered,----2");

    setTimeout(async () => {
      var kk = 0;
      while (true) {
        let msg = document.getElementById("id_output_data_json").value;

        if (msg != "[init]") {
          setOutputDataJson(msg);
          break;
        }
        kk++;
        if (kk > 120) {
          // break if more than 10 minutes
          console.log("wait for server side timeout!");
          break;
        }
        await sleep(500);
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
