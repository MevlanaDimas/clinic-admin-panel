import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        const { decision } = await request.json();
        const { requestId } = await params;

        if (!userId && sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const roleRequest = await prisma.roleRequest.findUnique({ where: { id: requestId }});
        if (!roleRequest) return new NextResponse("Not Found", { status: 404 });

        let updatedTitleRequest;

        if (decision === "ACCEPTED") {
            const staff = await prisma.staff.findUnique({ where: { id: roleRequest.staffId } });
            const client = await clerkClient();

            // 1. Update External Auth Provider (Clerk)
            await client.users.updateUser(roleRequest.staffId, {
                publicMetadata: {
                    title: roleRequest.requestedRole
                }
            });

            try {
                // 2. Update Database Atomically
                const [_, requestUpdate] = await prisma.$transaction([
                    prisma.staff.update({
                        where: { id: roleRequest.staffId },
                        data: { title: roleRequest.requestedRole }
                    }),
                    prisma.roleRequest.update({
                        where: { id: requestId },
                        data: { status: decision }
                    })
                ]);
                updatedTitleRequest = requestUpdate;
            } catch (dbError) {
                // Rollback Clerk if DB fails
                await client.users.updateUser(roleRequest.staffId, {
                    publicMetadata: {
                        title: staff?.title || "Staff"
                    }
                });
                throw dbError;
            }
        } else {
            updatedTitleRequest = await prisma.roleRequest.update({
                where: { id: requestId },
                data: { status: decision }
            });
        }

        await pusherServer.trigger("private-admin-notifications", "request-resolved", {
            id: requestId
        });

        await pusherServer.trigger(`private-user-${roleRequest.staffId}`, "request-status-updated", {
            status: decision,
            title: roleRequest.requestedRole
        });

        return NextResponse.json(updatedTitleRequest);
    } catch (error) {
        console.log("[STAFF_REQUEST_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}