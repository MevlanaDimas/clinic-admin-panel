import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const { sessionClaims } = await auth();

        // Security Check: Only allow users with "Admin" title to access private admin channels
        if (sessionClaims?.metadata?.title !== "Admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await request.text();
        const params = new URLSearchParams(body);
        const socketId = params.get("socket_id") as string;
        const channelName = params.get("channel_name") as string;

        if (!socketId || !channelName) {
            return new NextResponse("Missing socket_id or channel_name", { status: 400 });
        }

        // Generate the authentication signature for Pusher
        const authResponse = pusherServer.authorizeChannel(socketId, channelName);

        return NextResponse.json(authResponse);
    } catch (error) {
        console.log("[PUSHER_AUTH]", error);
        return new NextResponse("Error", { status: 500 });
    }
}