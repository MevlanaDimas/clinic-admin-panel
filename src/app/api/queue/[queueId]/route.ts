import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ queueId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { queueId } = await params;
        if (!queueId) return new NextResponse("Invalid ID", { status: 400 });

        const existingTicket = await prisma.queueTicket.findUnique({ where: { id: queueId } });
        if (!existingTicket) return new NextResponse("Ticket not found", { status: 404 });

        const updatedData = await prisma.queueTicket.update({
            where: { id: queueId },
            data: {
                status: "DONE"
            }
        });

        // Notify frontend to update the list
        await pusherServer.trigger("clinic-queue", "update-queue", {
            id: updatedData.id,
            status: updatedData.status,
            token: updatedData.tokenNumber
        });

        return NextResponse.json(updatedData);
    } catch (error) {
        console.log("[QUEUE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500});
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ queueId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { queueId } = await params;
        if (!queueId) return new NextResponse("Invalid ID", { status: 400 });

        const existingTicket = await prisma.queueTicket.findUnique({ where: { id: queueId } });
        if (!existingTicket) return new NextResponse("Ticket not found", { status: 404 });

        const deleteTicket = await prisma.queueTicket.delete({ where: {
            id: queueId 
            }});

        await pusherServer.trigger("clinic-queue", "update-queue", {
            id: queueId,
            status: "DELETED"
        });

        return NextResponse.json(deleteTicket);
    } catch (error) {
        console.log("[QUEUE_DELETE]", error);
        return new NextResponse("Internal error", { status: 500});
    }
}