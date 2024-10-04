"use server";

import React from "react";

import Error from "./error";

export default async function Home({}) {
    return (
        <>
            <Error chainCode={123456}></Error>
        </>
    );
}
