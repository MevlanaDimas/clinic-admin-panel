import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Sign In",
    robots: {
        index: false,
        follow: false
    }
}

export default function Page() {
    return (
        <SignIn />
    )
}