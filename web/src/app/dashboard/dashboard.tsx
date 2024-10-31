"use client";

import React, { MutableRefObject, useRef } from "react";
import { useState, useEffect } from "react";

import Navbar from "../navbar/navbar";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import {
    Divider,
    Card,
    CardHeader,
    CardBody,
    Image,
    Tooltip,
} from "@nextui-org/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";

import OpMenu from "./opMenu";
import { ShowMain } from "./opMenu";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    chainCodeFromString,
} from "../lib/myTypes";
import { UpdateUserProperty, UserProperty } from "../storage/userPropertyStore";
import * as userPropertyStore from "../storage/userPropertyStore";

import { PrivateInfoModal } from "@/app/dashboard/privateinfoModal";
import { PrivateInfoType } from "../lib/client/keyTools";

export default function Dashboard({
    userProp,
    updateUserProp,
    loadUserData,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
    loadUserData: (myProp: UserProperty) => Promise<void>;
}) {
    console.log("dashborad,ui:", userProp);

    const [selectedMenu, setSelectedMenu] = useState(Menu.OOOO);
    const updateSelectedMenu = (menu: Menu) => {
        setSelectedMenu(menu);
        userPropertyStore.setMenu(menu);
    };

    useEffect(() => {
        const oldMenu: Menu = userPropertyStore.getMenu();
        setSelectedMenu(oldMenu);
    }, []);

    const [passwdAuthMenuClickedCount, setPasswdAuthMenuClickedCount] =
        useState(0);
    const onClickPasswdAuthMenu = () => {
        console.log(
            "onClickPasswdAuthMenu, old count:",
            passwdAuthMenuClickedCount
        );
        setPasswdAuthMenuClickedCount(passwdAuthMenuClickedCount + 1);
    };

    const MenuItemPasswdAuth = () => {
        return (
            <Tooltip
                content={
                    passwdState == "Yes"
                        ? "Password info is valid!"
                        : "Password info is invalid. If it's your first new account, it will be valid after your first transaction."
                }
            >
                <div className="flex ">
                    <Avatar
                        radius="none"
                        size="sm"
                        src="/pwdLock.png"
                        color="default" // default | primary | secondary | success | warning | danger
                    />
                    <p
                        style={{
                            marginLeft: "10px",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                        onClick={(event) => onClickPasswdAuthMenu()}
                    >
                        {"Passwd Auth"}
                    </p>
                    &nbsp;
                    <Image
                        width={30}
                        radius="none"
                        alt="NextUI hero Image"
                        src={
                            passwdState == "Yes"
                                ? "/pwdSuccess.png"
                                : "/pwdWarning.png"
                        }
                    />
                </div>
            </Tooltip>
        );
    };

    const state0: "No" | "Yes" = "No";
    const [passwdState, setPasswdState] = useState(state0);
    const updatePasswdState = (s) => {
        setPasswdState(s);
    };

    return (
        <>
            <Navbar
                userProp={userProp}
                updateUserProp={updateUserProp}
                loadUserData={loadUserData}
            ></Navbar>
            <Divider
                orientation="horizontal"
                style={{ backgroundColor: "grey", height: "5px" }}
            ></Divider>
            <PasswdWindow
                passwdAuthMenuClickedCount={passwdAuthMenuClickedCount}
                updatePasswdState={updatePasswdState}
                userProp={userProp}
            ></PasswdWindow>
            <div
                style={{
                    display: "flex",
                    marginLeft: "10px",
                    marginRight: "10px",
                }}
            >
                <Card style={{ width: "260px" }}>
                    <CardBody style={{ height: "56px" }}>
                        <MenuItemPasswdAuth></MenuItemPasswdAuth>
                    </CardBody>
                    <Divider />
                    <OpMenu
                        email={userProp.email}
                        selectedMenu={selectedMenu}
                        updateSelectedMenu={updateSelectedMenu}
                    />
                </Card>

                <Card
                    className="max-w-full w-full"
                    style={{ marginLeft: "5px" }}
                >
                    <CardBody>
                        <ShowMain
                            selectedMenu={selectedMenu}
                            userProp={userProp}
                            loadUserData={loadUserData}
                        />
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

function PasswdWindow({
    passwdAuthMenuClickedCount,
    updatePasswdState,
    userProp,
}: {
    passwdAuthMenuClickedCount: number;
    updatePasswdState: (s: any) => void;
    userProp: UserProperty;
}) {
    console.log("PasswdWindow, userProp:", userProp);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    useEffect(() => {
        if (
            passwdAuthMenuClickedCount == undefined ||
            passwdAuthMenuClickedCount == 0
        ) {
            return;
        }
        onOpen();
    }, [passwdAuthMenuClickedCount]);

    const piInit: PrivateInfoType = {
        email: "",
        pin: "",
        question1answer: "",
        question2answer: "",
        firstQuestionNo: "01",
        secondQuestionNo: "01",
        confirmedSecondary: true,
    };
    const currentPriInfoRef = useRef(piInit);
    const oldPriInfoRef = useRef(piInit);

    return (
        <>
            {/* <Button onPress={onOpen}>Open Modal</Button> */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={false}
                size="4xl"
                scrollBehavior={"inside"}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <div style={{ overflow: "scroll" }}>
                                    <PrivateInfoModal
                                        onModalClose={(
                                            passwdState:
                                                | "Yes"
                                                | "No"
                                                | "New"
                                                | undefined
                                        ) => {
                                            console.log(
                                                "passwdState from privateModal:",
                                                passwdState
                                            );
                                            updatePasswdState(passwdState);
                                            onClose();
                                        }}
                                        userProp={userProp}
                                        forTransaction={false}
                                        currentPriInfoRef={currentPriInfoRef}
                                        oldPriInfoRef={oldPriInfoRef}
                                        updateFillInOk={() => {}}
                                        privateinfoHidden={false}
                                        updatePrivateinfoHidden={function (
                                            hidden: boolean
                                        ): void {
                                            throw new Error(
                                                "Function not implemented."
                                            );
                                        }}
                                    ></PrivateInfoModal>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {/* <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button> */}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
