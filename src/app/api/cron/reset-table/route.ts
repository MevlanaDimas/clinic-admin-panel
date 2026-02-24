import prisma from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        await prisma.queueTicket.deleteMany({});

        return NextResponse.json({ success: true, message: "Queue table reseted successfully" });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}