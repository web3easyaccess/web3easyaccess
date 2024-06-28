"use client";
import React from "react";

import { Key } from "react";

import { Accordion, AccordionItem, Avatar, Link } from "@nextui-org/react";

import Assets from "./assets";
import Transactions from "./transactions";
import NewTransactions from "./newtransaction";
import PrivateInfo from "./privateinfo";
import { useRouter } from "next/navigation";

import { Menu } from "../lib/menu";

export default function OpMenu({ selectedMenu }: { selectedMenu: Menu }) {
  console.log("selectedMenu ::::", selectedMenu);
  const route = useRouter();
  const defaultContent = "";

  const handlePress = (e: any) => {
    const clickedElement = e.target; // Access the clicked element
    const elementId = clickedElement.id; // Get the element's ID
    const elementClass = clickedElement.className; // Get the element's class
    const elementTextContent = clickedElement.textContent; // Get the element's text content
    // console.log(`Clicked element ID: ${elementId}`);
    // console.log(`Clicked element class: ${elementClass}`);
    console.log(`Clicked element text content: ${elementTextContent}`);
    if (elementTextContent.indexOf("Assets") >= 0) {
      console.log("assets...");
      route.push("/dashboard/assets");
    } else if (elementTextContent.indexOf("Transactions") >= 0) {
      route.push("/dashboard/transactions");
    } else if (elementTextContent.indexOf("Send ETH") >= 0) {
      route.push("/dashboard/newtransaction");
    } else if (elementTextContent.indexOf("Private Info") >= 0) {
      route.push("/dashboard/privateinfo");
    }
  };

  const myColor = (menu: Menu) => {
    if (selectedMenu == menu) {
      return "danger";
    } else {
      return undefined;
    }
  };
  const myMenuText = (menu: Menu) => {
    let menuText = "QQQ";
    if (menu == Menu.Asset) {
      menuText = "Assets";
    } else if (menu == Menu.Transactions) {
      menuText = "Transactions";
    } else if (menu == Menu.SendETH) {
      menuText = "Send ETH";
    } else if (menu == Menu.PrivateSetting) {
      menuText = "Private Info";
    }
    return menuText;
  };

  return (
    <div className="max-w-[200px]">
      <Accordion selectionMode="single">
        <AccordionItem
          key="1"
          indicator={() => (selectedMenu == Menu.Asset ? "=>" : "|")}
          onPress={(event) => handlePress(event)}
          startContent={
            <div className="flex ">
              <Avatar
                radius="sm"
                name={myMenuText(Menu.Asset).substring(0, 1)}
                style={{ fontSize: "22px" }}
                size="sm"
                color={myColor(Menu.Asset)}
              />
              <p style={{ marginLeft: "10px", fontSize: "18px" }}>
                {myMenuText(Menu.Asset)}
              </p>
            </div>
          }
          // subtitle="4 unread messages"
          title=""
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="2"
          indicator={() => (selectedMenu == Menu.Transactions ? "=>" : "|")}
          onPress={(event) => handlePress(event)}
          startContent={
            <div className="flex ">
              <Avatar
                radius="sm"
                name={myMenuText(Menu.Transactions).substring(0, 1)}
                style={{ fontSize: "22px" }}
                size="sm"
                color={myColor(Menu.Transactions)}
              />
              <p style={{ marginLeft: "10px", fontSize: "18px" }}>
                {myMenuText(Menu.Transactions)}
              </p>
            </div>
          }
          // subtitle="4 unread messages"
          title=""
        >
          {defaultContent}
        </AccordionItem>

        <AccordionItem
          key="3"
          indicator={() => (selectedMenu == Menu.SendETH ? "=>" : "|")}
          onPress={(event) => handlePress(event)}
          startContent={
            <div className="flex ">
              <Avatar
                radius="sm"
                name={myMenuText(Menu.SendETH).substring(0, 1)}
                style={{ fontSize: "22px" }}
                size="sm"
                color={myColor(Menu.SendETH)}
              />
              <p style={{ marginLeft: "10px", fontSize: "18px" }}>
                {myMenuText(Menu.SendETH)}
              </p>
            </div>
          }
          // subtitle="4 unread messages"
          title=""
        >
          {defaultContent}
        </AccordionItem>

        <AccordionItem
          key="4"
          indicator={() => (selectedMenu == Menu.PrivateSetting ? "=>" : "|")}
          onPress={(event) => handlePress(event)}
          startContent={
            <div className="flex ">
              <Avatar
                radius="sm"
                name={myMenuText(Menu.PrivateSetting).substring(0, 1)}
                style={{ fontSize: "22px" }}
                size="sm"
                color={myColor(Menu.PrivateSetting)}
              />
              <p style={{ marginLeft: "10px", fontSize: "18px" }}>
                {myMenuText(Menu.PrivateSetting)}
              </p>
            </div>
          }
          // subtitle="4 unread messages"
          title=""
        >
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function ShowMain({
  selectedMenu,
  txList,
  assets,
  acctAddr,
  chainId,
  verifyingContract,
  email,
  chainObj,
  selectedQuestionIds,
}: {
  selectedMenu: Menu;
}) {
  console.log("selectedMenu11111111100:", selectedMenu, "acctAddr:", acctAddr);

  if (selectedMenu == Menu.Asset) {
    console.log("selectedMenu11111111111:", selectedMenu);
    return <Assets assets={assets} chainObj={chainObj} />;
  } else if (selectedMenu == Menu.Transactions) {
    console.log("selectedMenu11111111122:", selectedMenu);
    return (
      <Transactions txList={txList} acctAddr={acctAddr} chainObj={chainObj} />
    );
  } else if (selectedMenu == Menu.SendETH) {
    console.log("selectedMenu11111111133:", selectedMenu);
    return (
      <NewTransactions
        acctAddr={acctAddr}
        chainId={chainId}
        verifyingContract={verifyingContract}
        email={email}
        chainObj={chainObj}
      />
    );
  } else if (selectedMenu == Menu.PrivateSetting) {
    console.log("selectedMenu11111111144:", selectedMenu);
    return (
      <PrivateInfo
        chainId={chainId}
        verifyingContract={verifyingContract}
        email={email}
        chainObj={chainObj}
        forSigning={false}
        acctAddr={acctAddr}
        selectedQuestionIds={selectedQuestionIds}
      />
    );
  }
  console.log("selectedMenu11111111133:", selectedMenu);
}
