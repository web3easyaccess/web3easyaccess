"use client";

import React from "react";

import Navbar from "../navbar/navbar";

export default function Home({ chainCode }) {
  return (
    <>
      <Navbar chainCode={chainCode}></Navbar>
      <div style={{ display: "flex" }}>
        error ! current chainCode is {chainCode}
      </div>
    </>
  );
}
