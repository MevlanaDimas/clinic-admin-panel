import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";


export async function POST() {
    try {
        const newTicket = await prisma.$transaction(async (tx) => {
            const lastTicket = await tx.queueTicket.findFirst({
                orderBy: { tokenNumber: 'desc' }
            });

            const nextNumber = lastTicket ? lastTicket.tokenNumber + 1 : 1;

            return tx.queueTicket.create({
                data: {
                    tokenNumber: nextNumber,
                    status: "WAITING"
                }
            });
        });

        await pusherServer.trigger("clinic-queue", "new-queue", {
            message: "refresh"
        });

        return NextResponse.json(newTicket);
    } catch (error) {
        console.log("[PROMO_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}