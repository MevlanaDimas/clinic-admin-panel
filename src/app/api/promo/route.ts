import prisma from "@/lib/db";
import { bucket } from "@/lib/gcs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";


export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const formData = await request.formData();
        const headline = formData.get("headline") as string;
        const code = (formData.get("code") as string).toUpperCase();
        const description = formData.get("description") as string;
        const CTA = formData.get("CTA") as string;
        const category = formData.get("category") as string;
        const validUntilString = formData.get("validUntil") as string;

        if (!headline && !code && !description && !CTA && !validUntilString) return new NextResponse("Missing required fields", { status: 400 });

        const validUntil = new Date(validUntilString);
        const now = new Date();
        if (validUntil < now) return new NextResponse("Promo expiration must be in the future", { status: 400 });

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

        const imageData = await Promise.all(imageEntries.map(async (entry) => {
            // Use the actual name for GCS to avoid "blob" filenames
            const storagePath = `promos/${nanoid()}-${entry.name}`;
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
            const createPromo = await prisma.promo.create({
                data: {
                    code,
                    headline,
                    description,
                    category,
                    CTA,
                    validUntil,
                    image: { create: imageData.map(({ storagePath, ...img }) => img) }
                }
            });

            return NextResponse.json(createPromo);
        } catch (dbError) {
            // Rollback: Delete uploaded images if DB creation fails
            await Promise.allSettled(imageData.map(img => 
                bucket.file(img.storagePath).delete()
            ));
            throw dbError;
        }
    } catch (error) {
        console.log("[PROMO_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}