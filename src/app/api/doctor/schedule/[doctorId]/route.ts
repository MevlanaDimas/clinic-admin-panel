import prisma from "@/lib/db";
import { doctorScheduleSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ doctorId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        // Check authentication and Admin role
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const { doctorId } = await params;
        if (!doctorId) return new NextResponse("Invalid ID", { status: 400 });
        
        const body = await request.json();
        // Validate with Zod schema
        const { schedules } = doctorScheduleSchema.parse(body);

        // Transaction: Replace existing schedules with the new set
        const newSchedules = await prisma.$transaction(async (tx) => {
            await tx.doctorPracticeSchedule.deleteMany({
                where: { doctorId: doctorId }
            });

            await tx.doctorPracticeSchedule.createMany({
                data: schedules.map((s) => ({
                    doctorId: doctorId,
                    day: s.day,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isAvailable: s.isAvailable ?? true
                }))
            });

            return tx.doctorPracticeSchedule.findMany({
                where: { doctorId: doctorId }
            });
        });

        return NextResponse.json(newSchedules);
    } catch (error) {
        console.log("[SCHEDULE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ doctorId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const { doctorId } = await params;
        if (!doctorId) return new NextResponse("Invalid ID", { status: 400 });

        // Wipe all schedule entries for the specific doctor
        const deleteSchedule = await prisma.doctorPracticeSchedule.deleteMany({
            where: { doctorId: doctorId }
        });

        return NextResponse.json(deleteSchedule);
    } catch (error) {
        console.log("[SCHEDULE_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}