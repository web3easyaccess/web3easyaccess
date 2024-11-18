import React, { MutableRefObject } from "react";
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

export default function BottomBar({ marginTop }: { marginTop: number }) {
    // max-w-[30ch]
    return (
        <Navbar
            isBlurred={false}
            style={{ marginTop: marginTop + "px" }}
            height={"40px"}
        >
            <NavbarBrand>
                <NavbarItem>
                    <div className="flex gap-2">
                        <Link
                            isBlock
                            isExternal
                            showAnchorIcon
                            href="https://github.com/web3easyaccess/web3easyaccess"
                            color="foreground"
                            size="sm"
                        >
                            GitHub
                        </Link>
                        <Link
                            isBlock
                            isExternal
                            showAnchorIcon
                            href="https://github.com/web3easyaccess/web3easyaccess/blob/main/docs/docs-main_EN.md"
                            color="foreground"
                            size="sm"
                        >
                            Docs
                        </Link>
                    </div>
                </NavbarItem>
            </NavbarBrand>
        </Navbar>
    );
}
