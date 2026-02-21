import { Audience, EvidenceLevel } from "@/app/generated/prisma/enums";
import prisma from "@/lib/db";
import { bucket } from "@/lib/gcs";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ newsId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const authorId = formData.get("author") as string;
        const categoryId = formData.get("categoryId") as string;
        const summary = formData.get("summary") as string;
        const targetAudience = formData.get("targetAudience") as string;
        const evidenceLevel = formData.get("evidenceLevel") as string | null;

        if (!title || !content || !authorId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // // Extract tags from formData
        const tags = formData.getAll("tags[]").map(tag => tag as string);
        
        // // Extract sourceLinks from formData
        const sourceLinks = formData.getAll("sourceLinks[]").map(link => link as string).filter(link => link.trim());

        const { newsId } = await params;
        if (!newsId) return new NextResponse("Invalid ID", { status: 400 });
        
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") +
            "-" +
            nanoid(5);
        
        const existingImageIds = formData.getAll("existing_images[]").map(id => Number(id));
        
        const imagesToDelete = await prisma.newsImages.findMany({
            where: {
                newsId: newsId,
                id: { notIn: existingImageIds }
            }
        });

        await prisma.newsImages.deleteMany({
            where: {
                newsId: newsId,
                id: { notIn: existingImageIds }
            }
        });

        for (const img of imagesToDelete) {
            const storagePath = img.imageUrl.split(`${bucket.name}/`)[1];
            if (storagePath) {
                await bucket.file(storagePath).delete().catch(e => console.error("GCS Delete Error:", e));
            }
        }

        const newImageEntries: { file: File; name: string }[] = [];
        formData.forEach((value, key) => {
            if (key.startsWith("images") && value instanceof File) {
                const index = key.match(/\d+/)?.[0];
                const customName = formData.get(`images[${index}].imageName`) as string;
                newImageEntries.push({
                    file: value,
                    name: customName || value.name
                });
            }
        });

        const newImageData = await Promise.all(newImageEntries.map(async (entry) => {
            const storagePath = `news/${nanoid()}-${entry.name}`;
            const blob = bucket.file(storagePath);
            await blob.save(Buffer.from(await entry.file.arrayBuffer()), {
                contentType: entry.file.type
            });

            return {
                imageUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
                imageName: entry.name,
                storagePath // Keep for rollback
            };
        }));
        
        try {
            const updateNews = await prisma.news.update({
                where: { id: newsId },
                data: {
                    title: title,
                    slug: slug,
                    content: content,
                    summary: summary,
                    authorId: authorId,
                    categoryId: parseInt(categoryId),
                    tags: tags,
                    sourceLinks: sourceLinks,
                    targetAudience: (targetAudience as Audience) || "GENERAL_PUBLIC",
                    evidenceLevel: (evidenceLevel as EvidenceLevel) || null,
                    images: {
                        create: newImageData.map(({ storagePath, ...img }) => img)
                    }
                }
            });

            return NextResponse.json(updateNews);
        } catch (dbError) {
            // Rollback: Delete newly uploaded images if DB update fails
            await Promise.allSettled(newImageData.map(img => 
                bucket.file(img.storagePath).delete()
            ));
            throw dbError;
        }
    } catch (error) {
        console.log("[NEWS_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ newsId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { newsId } = await params;
        if (!newsId) return new NextResponse("Invalid ID", { status: 400 });

        const news = await prisma.news.findUnique({
            where: { id: newsId },
            include: { images: true }
        });

        if (!news) return new NextResponse("Not Found", { status: 404 });

        const deleteNews = await prisma.news.delete({
            where: { id: newsId }
        });

        for (const img of news.images) {
            const storagePath = img.imageUrl.split(`${bucket.name}/`)[1];
            if (storagePath) {
                await bucket.file(storagePath).delete().catch(e => console.error("GCS Delete Error:", e));
            }
        }

        return NextResponse.json(deleteNews);
    } catch (error) {
        console.log("[NEWS_DELETE]", error);
        return new NextResponse("Internal error", {
            status: 500
        });
    }
}