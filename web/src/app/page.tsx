"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const route = useRouter();
    route.push("/dashboard/assets");
    return <div></div>;
}
