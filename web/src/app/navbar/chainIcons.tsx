import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Tooltip,
  Badge,
} from "@nextui-org/react";
import { useState, useRef } from "react";

import { saveChainName } from "../serverside/serverActions";
import CallServerByForm from "../lib/callServerByForm";

export const ChainIcons = ({ chainCode }) => {
  const inputDataJsonRef = useRef("[-]");
  const outputDataJsonRef = useRef("[-]");
  const buttonRef = useRef(null);

  console.log("navbar, input param[chainCode]:", chainCode);

  const newChainRef = useRef("");

  const [size1, setSize1] = useState("sm");
  const [size2, setSize2] = useState("sm");
  const [size3, setSize3] = useState("sm");
  const [bordered1, setBordered1] = useState(false);
  const [bordered2, setBordered2] = useState(false);
  const [bordered3, setBordered3] = useState(false);

  let t_lock = false;
  const triggerCallServer = (newChain) => {
    if (t_lock) {
      return;
    }
    t_lock = true;
    newChainRef.current = newChain;
    inputDataJsonRef.current = JSON.stringify({ value: newChainRef.current });
    buttonRef.current.click();
  };

  const fff = () => {
    setSize1("sm");
    setSize2("sm");
    setSize3("sm");
    setBordered1(false);
    setBordered2(false);
    setBordered3(false);

    if (newChainRef.current == "MORPH_TEST_CHAIN") {
      // setSize1("md");
      setBordered1(true);
    } else if (newChainRef.current == "DEFAULT_ANVIL_CHAIN") {
      // setSize2("md");
      setBordered2(true);
    } else if (newChainRef.current == "ETHEREUM") {
      // setSize3("md");
      setBordered3(true);
    }
  };

  const methodAfterServrReturn = () => {
    console.log("methodAfterServrReturn...");
    fff();
    t_lock = true;
  };

  // // // ////////////////////

  const handleClick1 = () => {
    triggerCallServer("MORPH_TEST_CHAIN");
  };
  const handleClick2 = () => {
    triggerCallServer("DEFAULT_ANVIL_CHAIN");
  };
  const handleClick3 = () => {
    triggerCallServer("ETHEREUM");
  };

  /////
  console.log("init first.0000..:", chainCode, "...", newChainRef.current);
  if (newChainRef.current == "" && chainCode && chainCode != "") {
    console.log("init first...:", chainCode);
    newChainRef.current = chainCode;
    fff();
  }

  return (
    <div className="flex gap-3 items-center">
      <CallServerByForm
        method={saveChainName}
        inputDataJsonRef={inputDataJsonRef}
        outputDataJsonRef={outputDataJsonRef}
        methodAfterServrReturn={methodAfterServrReturn}
        buttonRef={buttonRef}
        show={false}
      ></CallServerByForm>

      <Badge content="1" color="secondary">
        <Tooltip content="morph2 testnet">
          <Avatar
            src="/chain/morphl2test.png"
            size={size1}
            isBordered={bordered1}
            onClick={handleClick1}
            color="primary"
          />
        </Tooltip>
      </Badge>
      <Badge content="1" color="secondary">
        <Tooltip content="anvil testnet">
          <Avatar
            src="/chain/anvil.png"
            size={size2}
            isBordered={bordered2}
            onClick={handleClick2}
            color="primary"
          />
        </Tooltip>
      </Badge>
      <Badge content="1" color="secondary">
        <Tooltip content="Ethereum">
          <Avatar
            src="/chain/ethereum.png"
            size={size3}
            isBordered={bordered3}
            onClick={handleClick3}
            color="primary"
          />
        </Tooltip>
      </Badge>
    </div>
  );
};

export const SelectedChainIcon = ({ acctCount }) => {
  return (
    <div className="flex gap-3 items-center">
      <Badge content="1" color="secondary">
        <Tooltip content="anvil testnet">
          <Avatar src="/chain/anvil.png" size={"md"} />
        </Tooltip>
      </Badge>
    </div>
  );
};
