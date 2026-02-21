import prisma from "@/lib/db";
import { bucket } from "@/lib/gcs";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ promoId: string }> }
) {
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

        const { promoId } = await params;
        const id = parseInt(promoId);
        if (isNaN(id)) return new NextResponse("Invalid ID", { status: 400 });

        // Sync existing images 
        const existingImageIds = formData.getAll("existing_images[]").map(id => Number(id));
        
        const imagesToDelete = await prisma.promoImages.findMany({
            where: {
                promoId: id,
                id: { notIn: existingImageIds }
            }
        });

        await prisma.promoImages.deleteMany({
            where: {
                promoId: id,
                id: { notIn: existingImageIds }
            }
        });

        for (const img of imagesToDelete) {
            const storagePath = img.imageUrl.split(`${bucket.name}/`)[1];
            if (storagePath) {
                await bucket.file(storagePath).delete().catch(e => console.error("GCS Delete Error:", e));
            }
        }

        // Process new images with correct names
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
            const storagePath = `promos/${nanoid()}-${entry.name}`;
            const blob = bucket.file(storagePath);
            await blob.save(Buffer.from(await entry.file.arrayBuffer()), { contentType: entry.file.type });

            return {
                imageUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
                imageName: entry.name,
                storagePath // Keep for rollback
            };
        }));

        try {
            const updatePromo = await prisma.promo.update({
                where: { id },
                data: {
                    code: code,
                    headline: headline,
                    description: description,
                    CTA: CTA,
                    category: category,
                    validUntil: validUntil,
                    image: { create: newImageData.map(({ storagePath, ...img }) => img) }
                }
            });

            return NextResponse.json(updatePromo);
        } catch (dbError) {
            // Rollback: Delete newly uploaded images if DB update fails
            await Promise.allSettled(newImageData.map(img => 
                bucket.file(img.storagePath).delete()
            ));
            throw dbError;
        }
    } catch (error) {
        console.log("[PROMO_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ promoId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { promoId } = await params;
        const id = parseInt(promoId);
        if (isNaN(id)) return new NextResponse("Invalid ID", { status: 400 });

        const promo = await prisma.promo.findUnique({
            where: { id },
            include: { image: true }
        });

        if (!promo) return new NextResponse("Not Found", { status: 404 });

        const deletePromo = await prisma.promo.delete({ where: { id } });

        for (const img of promo.image) {
            const storagePath = img.imageUrl.split(`${bucket.name}/`)[1];
            if (storagePath) {
                await bucket.file(storagePath).delete().catch(e => console.error("GCS Delete Error:", e));
            }
        }

        return NextResponse.json(deletePromo);
    } catch (error) {
        console.log("[PROMO_DELETE]", error);
        return new NextResponse("Internal error", { status: 500});
    }
}
