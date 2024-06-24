import React from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

import { MyLogo } from "./myLogo";

import { saveChainName } from "../serverside/serverActions";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { chains } from "./chains";

import CallServerByForm from "../callserver/callServerByForm";

export default function App({ chainCode }) {
  const [outputDataJson, setOutputDataJson] = useState("");
  const buttonRef = useRef(null);
  const triggerCallServer = () => {
    buttonRef.current.click();
  };
  console.log("navbar....net222:", chainCode);
  const [myChain, setMyChain] = useState({ value: chainCode });

  // const [chainCode, setChainCode] = useState("MORPH_TEST_CHAIN");
  const onSelectionChange = (cc) => {
    console.log("chain onSelectionChange:", cc);
    setMyChain({ value: cc });

    setTimeout(triggerCallServer, 500);
  };

  // max-w-[30ch]
  return (
    <Navbar isBordered isBlurred={false} maxWidth="full">
      <CallServerByForm
        method={saveChainName}
        inputDataJson={JSON.stringify(myChain)}
        setOutputDataJson={setOutputDataJson}
        buttonRef={buttonRef}
      ></CallServerByForm>
      <NavbarBrand>
        <MyLogo />
        <Autocomplete
          color={"success"}
          defaultItems={chains}
          placeholder="Choose a chain"
          aria-label="Choose a chain"
          defaultSelectedKey={myChain.value}
          className="max-w-xs"
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>

        <p className="font-bold text-inherit"></p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#"></Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Web3EasyAccess.link
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#"></Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="/login">Swithch User</Link>
        </NavbarItem>
        {/* <NavbarItem>{newAcctButton()}</NavbarItem> */}
      </NavbarContent>
    </Navbar>
  );
}
9 * 3;
