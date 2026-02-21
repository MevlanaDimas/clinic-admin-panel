import { StaffTitle } from "@/app/generated/prisma/enums";
import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const staff = await prisma.roleRequest.findMany({
            where: {
                status: "PENDING"
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.log("[STAFF_REQUEST_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId) return new Response("Unauthorized", { status: 401 });
    
        const existingRequest = await prisma.roleRequest.findFirst({
            where: {
                staffId: userId,
                status: "PENDING"
            }
        });
    
        if (existingRequest) return new NextResponse("Request already sent", { status: 400 });
    
        const body = await request.json();
        const { title } = body;

        if (!title || typeof title !== "string") return new NextResponse("Invalid title", { status: 400 });

        const isValidRole = Object.values(StaffTitle).includes(title as StaffTitle);
        if (!isValidRole) return new NextResponse("Invalid title", { status: 400 });
    
        const roleRequest = await prisma.roleRequest.create({
            data: {
                staffId: userId,
                requestedRole: title as StaffTitle,
                status: "PENDING"
            }
        });

        await pusherServer.trigger("private-admin-notifications", "role-update-request", {
            ...roleRequest,
            staffName: user?.fullName || "Staff Member"
        });
    
        return NextResponse.json(roleRequest);
    } catch (error) {
        console.log("[STAFF_REQUEST_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}