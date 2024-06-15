"use client";
import React from "react";

import { Key } from "react";

import { Accordion, AccordionItem, Avatar, Link } from "@nextui-org/react";

import Assets from "./assets";
import Transactions from "./transactions";
import NewTransactions from "./newtransaction";

export default function OpMenu({ selectedMenu }) {
  console.log("selectedMenu ::::", selectedMenu);

  const defaultContent = "";

  const handlePress = (e: any) => {
    // const clickedElement = e.target; // Access the clicked element
    // const elementId = clickedElement.id; // Get the element's ID
    // const elementClass = clickedElement.className; // Get the element's class
    // const elementTextContent = clickedElement.textContent; // Get the element's text content
    // // console.log(`Clicked element ID: ${elementId}`);
    // // console.log(`Clicked element class: ${elementClass}`);
    // console.log(`Clicked element text content: ${elementTextContent}`);
    // if (elementTextContent.indexOf("Assets") >= 0) {
    //   setSelectedMenu("assets");
    // } else if (elementTextContent.indexOf("Transactions") >= 0) {
    //   setSelectedMenu("transactions");
    // }
  };

  return (
    <div className="max-w-[200px]">
      <Accordion selectionMode="single">
        <AccordionItem
          key="1"
          indicator="-"
          onPress={(event) => handlePress(event)}
          // aria-label="Chung Miller"
          startContent={<Link href="/dashboard/assets">assets</Link>}
          // subtitle="4 unread messages"
          title="Assets"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="2"
          indicator="-"
          onPress={(event) => handlePress(event)}
          // aria-label="Janelle Lenard"
          startContent={
            // <Avatar
            //   isBordered
            //   color="success"
            //   radius="lg"
            //   src="/headshot/4.png"
            // />
            <Link href="/dashboard/transactions">transactions</Link>
          }
          // subtitle="3 incompleted steps"
          title="Transactions"
        >
          {defaultContent}
        </AccordionItem>

        <AccordionItem
          key="3"
          indicator="-"
          onPress={(event) => handlePress(event)}
          startContent={
            <Link href="/dashboard/newtransaction">new transaction</Link>
          }
          title="NewTransactions"
        >
          {defaultContent}
        </AccordionItem>

        <AccordionItem
          key="4"
          indicator="-"
          onPress={(event) => handlePress(event)}
          // aria-label="Zoey Lang"
          startContent={
            // <Avatar
            //   isBordered
            //   color="warning"
            //   radius="lg"
            //   src="/headshot/5.png"
            // />
            <Link href="/dashboard/chgpasswd">chg passwordd</Link>
          }
          //   subtitle={
          //     <p className="flex">
          //       2 issues to<span className="text-primary ml-1">fix now</span>
          //     </p>
          //   }
          title="ChgPassword"
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
  currentNet,
}) {
  console.log("selectedMenu11111111100:", selectedMenu);
  const mn = selectedMenu.toLowerCase();
  if (mn.indexOf("assets") >= 0) {
    console.log("selectedMenu11111111111:", selectedMenu);
    return <Assets assets={assets} />;
  } else if (mn.indexOf("trans") >= 0 && mn.indexOf("new") < 0) {
    console.log("selectedMenu11111111122:", selectedMenu);
    return <Transactions txList={txList} acctAddr={acctAddr} />;
  } else if (mn.indexOf("trans") >= 0 && mn.indexOf("new") >= 0) {
    console.log("selectedMenu11111111123:", selectedMenu);
    return (
      <NewTransactions
        acctAddr={acctAddr}
        chainId={chainId}
        verifyingContract={verifyingContract}
        email={email}
        currentNet={currentNet}
      />
    );
  }
  console.log("selectedMenu11111111133:", selectedMenu);
}
