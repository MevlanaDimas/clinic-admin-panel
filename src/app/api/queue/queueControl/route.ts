import { CounterNumber } from "@/app/generated/prisma/enums";
import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { counterNum } = await request.json();

        if (!counterNum) return new NextResponse("Counter number required", { status: 400 });

        const counterEnumMap: Record<number, CounterNumber> = {
            1: CounterNumber.ONE,
            2: CounterNumber.TWO
        };

        const updated = await prisma.$transaction(async (tx) => {
            const nextTicket = await tx.queueTicket.findFirst({
                where: { status: "WAITING" },
                orderBy: { tokenNumber: "asc" }
            });

            if (!nextTicket) return null;

            return tx.queueTicket.update({
                where: { id: nextTicket.id },
                data: {
                    status: "CALLING",
                    counterNumber: counterEnumMap[Number(counterNum)]
                }
            });
        });

        if (!updated) {
            return NextResponse.json(
                { error: "No patients waiting" },
                { status: 404 }
            );
        }

        await pusherServer.trigger("clinic-queue", "new-call", {
            token: updated.tokenNumber,
            counter: counterNum
        });

        return NextResponse.json({
            success: true,
            ticket: updated
        });
    } catch (error) {
        console.log("[QUEUE_POST]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}