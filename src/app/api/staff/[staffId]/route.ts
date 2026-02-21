import prisma from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ staffId: string }> }
) {
    try {
        const { userId } = await auth();
        const { staffId } = await params;

        if (!userId && userId !== staffId) return new NextResponse("Unauthorized", { status: 401 });

        const { bio } = await request.json();

        const oldStaff = await prisma.staff.findUnique({
            where: { id: userId }
        });

        const client = await clerkClient();

        await client.users.updateUser(userId, {
            publicMetadata: {
                bio
            }
        });

        try {
            await prisma.staff.update({
                where: { id: userId },
                data: {
                    bio
                }
            });
        } catch (dbError) {
            // Rollback Clerk update if DB fails
            await client.users.updateUser(userId, {
                publicMetadata: {
                    bio: oldStaff?.bio || ""
                }
            });
            throw dbError;
        }

        return NextResponse.json({ message: "Success" });
    } catch (error) {
        console.log("[STAFF_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}