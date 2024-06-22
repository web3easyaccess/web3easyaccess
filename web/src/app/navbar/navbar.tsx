import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { MyLogo } from "./myLogo";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

export default function App({ acctAddr }) {
  const newAcctButton = () => {
    console.log("navbar acctAddr:", acctAddr);
    if (acctAddr == undefined) {
      acctAddr = popularAddr.ZERO_ADDR;
    }
    if (acctAddr == popularAddr.ZERO_ADDR) {
      return (
        <Button as={Link} color="primary" href="/privateinfo" variant="flat">
          Create new Account
        </Button>
      );
    }
  };
  return (
    <Navbar isBordered isBlurred={false} maxWidth="full">
      <NavbarBrand>
        <MyLogo />
        <p className="font-bold text-inherit">Web3EasyAccess.link</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="/login">Login</Link>
        </NavbarItem>
        <NavbarItem>{newAcctButton()}</NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
