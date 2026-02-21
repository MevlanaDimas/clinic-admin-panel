import prisma from "@/lib/db";
import { bucket } from "@/lib/gcs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Audience, EvidenceLevel } from "@/app/generated/prisma/enums";


export async function POST(request: Request) {
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

        // Extract tags from formData
        const tags = formData.getAll("tags[]").map(tag => tag as string);
        
        // Extract sourceLinks from formData
        const sourceLinks = formData.getAll("sourceLinks[]").map(link => link as string).filter(link => link.trim());

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") +
            "-" +
            nanoid(5);

        // Collect files and their corresponding names using the index from the key
        const imageEntries: { file: File; name: string }[] = [];
        formData.forEach((value, key) => {
            if (key.startsWith("images") && value instanceof File) {
                const index = key.match(/\d+/)?.[0];
                // Explicitly pull the imageName sent from the frontend field
                const customName = formData.get(`images[${index}].imageName`) as string;
                imageEntries.push({ 
                    file: value, 
                    name: customName || value.name 
                });
            }
        });

        // Upload images first, keeping track of paths for potential rollback
        const uploadedImages = await Promise.all(imageEntries.map(async (entry) => {
            // Use the actual name for GCS to avoid "blob" filenames
            const storagePath = `news/${nanoid()}-${entry.name}`;
            const blob = bucket.file(storagePath);
            await blob.save(Buffer.from(await entry.file.arrayBuffer()), {
                contentType: entry.file.type
            });

            return {
                imageUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
                imageName: entry.name,
                storagePath // Keep this for rollback
            };
        }));

        try {
            const news = await prisma.news.create({
                data: {
                    title,
                    slug,
                    content,
                    summary,
                    authorId,
                    categoryId: parseInt(categoryId),
                    tags,
                    sourceLinks,
                    targetAudience: (targetAudience as Audience) || "GENERAL_PUBLIC",
                    evidenceLevel: (evidenceLevel as EvidenceLevel) || null,
                    images: {
                        create: uploadedImages.map(({ storagePath, ...img }) => img)
                    }
                }
            });

            return NextResponse.json(news);
        } catch (dbError) {
            // Rollback: Delete uploaded images if DB creation fails
            await Promise.allSettled(uploadedImages.map(img => 
                bucket.file(img.storagePath).delete()
            ));
            throw dbError;
        }
    } catch (error) {
        console.log("[NEWS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}