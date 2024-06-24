"use client";

import { test001 } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import { useState, useRef } from "react";

import CallServerByForm from "./callServerByForm";

/*
this is Example of CallServerByForm
*/
export default function Page() {
  console.log("cccccccc1:");
  const [outputDataJson, setOutputDataJson] = useState("xyz");
  const buttonRef = useRef(null);

  const handleClick = () => {
    buttonRef.current.click();
  };

  const inputData = { a: 1, b: 2 };

  return (
    <div>
      <p>outputDataJson: {outputDataJson}</p>
      <CallServerByForm
        method={test001}
        inputDataJson={JSON.stringify(inputData)}
        setOutputDataJson={setOutputDataJson}
        buttonRef={buttonRef}
      ></CallServerByForm>

      <Button onPress={handleClick} color="primary">
        my click
      </Button>
    </div>
  );
}
