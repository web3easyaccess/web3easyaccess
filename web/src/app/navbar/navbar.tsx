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

import { ChainLogo } from "./myLogo";

import { saveChainName } from "../serverside/serverActions";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { chains } from "./chains";

import CallServerByForm from "../lib/callServerByForm";

export default function App({ chainCode }) {
  const inputDataJsonRef = useRef("[-]");
  const outputDataJsonRef = useRef("[-]");
  const buttonRef = useRef(null);

  console.log("navbar, input param[chainCode]:", chainCode);
  const [myChain, setMyChain] = useState({ value: chainCode });

  const triggerCallServer = (newChain) => {
    inputDataJsonRef.current = JSON.stringify({ value: newChain });
    buttonRef.current.click();
    setTimeout(() => {
      setMyChain({ value: newChain });
    }, 500);
  };

  // const [chainCode, setChainCode] = useState("MORPH_TEST_CHAIN");
  const onSelectionChange = (cc) => {
    console.log("onSelectionChange, selected chain:", cc);
    triggerCallServer(cc);
    // setTimeout(triggerCallServer, 500);
  };

  // max-w-[30ch]
  return (
    <Navbar isBordered isBlurred={false} maxWidth="full">
      <CallServerByForm
        method={saveChainName}
        inputDataJsonRef={inputDataJsonRef}
        outputDataJsonRef={outputDataJsonRef}
        buttonRef={buttonRef}
        show={false}
      ></CallServerByForm>
      <NavbarBrand>
        <ChainLogo chainCode={chainCode} />
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
