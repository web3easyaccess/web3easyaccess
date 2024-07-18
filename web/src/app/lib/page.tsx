"use client";

import { test001 } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import { useState, useRef } from "react";

import CallServerByForm from "./callServerByForm";
import { getInputValueById } from "./elementById";

/*
this is Example of CallServerByForm
*/
export default function Page() {
  console.log("cccccccc1:");
  const [outputDataJson, setOutputDataJson] = useState("xyz");
  const inputDataJsonRef = useRef("[-]");
  const outputDataJsonRef = useRef("[-]");
  const buttonRef = useRef(null);

  const handleClick = () => {
    buttonRef.current.click();

    const inputData = { a: 1, b: 2 };
    inputDataJsonRef.current = JSON.stringify(inputData);

    setTimeout(async () => {
      var kk = 0;
      while (true) {
        if (outputDataJsonRef.current != "[-]") {
          console.log("server side result kk:", outputDataJsonRef.current);
          outputDataJsonRef.current = "[-]";
          break;
        }
        kk++;
        if (kk > 120) {
          // break if more than 10 minutes
          console.log("wait for server side timeout!222");
          break;
        }
        await sleep(500);
      }
    }, 500);
  };

  return (
    <div>
      <p>outputDataJson: {outputDataJson}</p>
      <CallServerByForm
        method={test001}
        inputDataJsonRef={inputDataJsonRef}
        outputDataJsonRef={outputDataJsonRef}
        buttonRef={buttonRef}
      ></CallServerByForm>

      <Button onPress={handleClick} color="primary">
        my click
      </Button>
    </div>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
