import React from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Tooltip,
} from "@nextui-org/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Input,
  CardHeader,
  Card,
  CardBody,
  Divider,
} from "@nextui-org/react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

import { ChainLogo } from "./myLogo";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { chains } from "./chains";

import { ChainIcons, SelectedChainIcon } from "./chainIcons";
import UserProfile from "./userProfile";

export default function App({ chainCode, acctAddr, ownerId, balance }) {
  const aa = false;

  // max-w-[30ch]
  return (
    <Navbar isBordered isBlurred={false} maxWidth="full">
      <NavbarBrand>
        <p className="text-md" style={{ color: "black" }}>
          {"z***p@g***m"}
        </p>
        <Divider orientation="vertical" style={{ marginLeft: "20px" }} />
        <NavbarItem>
          <SelectedChainIcon></SelectedChainIcon>
        </NavbarItem>
        <Divider orientation="vertical" style={{ marginLeft: "10px" }} />
        <NavbarItem>
          <UserProfile
            acctAddr={acctAddr}
            ownerId={ownerId}
            balance={balance}
          />
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">
  <Link href="/login">Swithch User</Link>
</NavbarItem> */}
        <Divider orientation="vertical" />
        <NavbarItem>
          <Card>
            <CardBody>
              <Tooltip content="Balance of W3EAP which is a token about Web3EasyAccess's rewards">
                <h4 className="text-middle font-semibold leading-none text-default-600">
                  1234500001
                </h4>
              </Tooltip>
              <h5
                className="text-small tracking-tight text-default-400"
                style={{ marginTop: "5px" }}
              >
                W3EAP
              </h5>
            </CardBody>
          </Card>
        </NavbarItem>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive></NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#"></Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <ChainIcons chainCode={chainCode} />
        <NavbarItem className="hidden lg:flex">
          <Button
            href="/logout"
            as={Link}
            // showAnchorIcon
            // variant="solid"
            style={{
              fontWeight: "bold",
              color: "FireBrick",
              backgroundColor: "white",
              borderStyle: "solid",
              borderWidth: "2px",
              marginLeft: "30px",
            }}
          >
            Logout
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
9 * 3;
