"use client";

import { userLogout } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { UserProperty } from "../storage/userPropertyStore";
import { exampleEmail } from "../lib/myTypes";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";
import { useEffect } from "react";

export function Logout({ userProp }: { userProp: UserProperty }) {
    const [resultMsg, dispatch] = useFormState(userLogout, undefined);
    console.log("userProp in logout:", userProp);
    //   setTimeout(() => {
    //     document.getElementById("id_button_logout")?.click();
    //   }, 2000);

    return (
        <div>
            <form action={dispatch}>
                <input
                    id="id_logout_byebye"
                    name="byebye"
                    style={{ display: "none" }}
                />

                <div id="id_rtn_message" style={{ display: "none" }}>
                    {resultMsg && <p>{resultMsg}</p>}
                </div>
                <Button
                    id="id_button_logout"
                    type="submit"
                    style={{
                        fontWeight: "bold",
                        color:
                            userProp.email == exampleEmail ||
                            userProp.email == ""
                                ? "Green"
                                : "FireBrick",
                        backgroundColor: "white",
                        borderStyle: "solid",
                        borderWidth: "2px",
                        marginLeft: "30px",
                    }}
                >
                    {userProp.email == exampleEmail || userProp.email == ""
                        ? "Login"
                        : "Logout"}
                </Button>
                <ModalMsg email={userProp.email}></ModalMsg>
            </form>
        </div>
    );
}

function ModalMsg({ email }: { email: string }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        if (email == exampleEmail) {
            onOpen();
        }
    }, [email]);
    return (
        <>
            {/* <Button onPress={onOpen}>Open Modal</Button> */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Please Login.
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    You are currently viewing a guest sample
                                    page. To access all features, please log in
                                    by clicking the "Login" button in the upper
                                    right corner.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
