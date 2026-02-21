import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ newsId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        const today = new Date();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const staff = await prisma.staff.findUnique({
            where: { id: userId }
        });

        if (!staff) return new NextResponse("Unauthorized", { status: 401 });

        const role = sessionClaims?.metadata?.title;

        if (role !== "Doctor") return new NextResponse("Forbidden: Doctors only", { status: 403 });

        const { status } = await request.json();

        const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
        if (status && !validStatuses.includes(status)) {
            return new NextResponse("Invalid status value", { status: 400 });
        }

        const { newsId } = await params;
        if (!newsId) return new NextResponse("Invalid ID", { status: 400 });

        const existingNews = await prisma.news.findUnique({ where: { id: newsId } });
        if (!existingNews) return new NextResponse("News item not found", { status: 404 });

        const updateNewsStatus = await prisma.news.update({
            where: { id: newsId },
            data: {
                status: status || "DRAFT",
                reviewerId: staff?.id,
                publishedAt: status === "PUBLISHED" ? today : null
            }
        });

        return NextResponse.json(updateNewsStatus);
    } catch (error) {
        console.log("[NEWS_STATUS_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}