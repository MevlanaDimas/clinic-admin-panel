import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // 1. Get the search query (Laravel: $request->query('search'))
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        // 2. Fetch data with filters, sorting, and limits
        const categories = await prisma.category.findMany({
            where: search ? {
                name: {
                    contains: search,
                    mode: "insensitive" // Laravel: LIKE %search%
                }
            } : undefined, // If no search, return all (subject to limit)
            orderBy: {
                name: "asc" // Laravel: orderBy('name', 'ASC')
            },
            take: 20 // Laravel: limit(20)
        });

        // 3. Map the data structure (Laravel: ->map(...))
        const formattedCategories = categories.map((category) => ({
            label: category.name,
            value: category.id
        }));

        return NextResponse.json(formattedCategories);

    } catch (error) {
        console.log("[CATEGORY_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) return new NextResponse("Name is required", { status: 400 });

        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            }
        });

        if (existingCategory) return new NextResponse("Category already exists", { status: 409 });

        const newCategory = await prisma.category.create({
            data: {
                name
            }
        });

        return NextResponse.json({
            label: newCategory.name,
            value: newCategory.id
        });
    } catch (error) {
        // Handle race condition where category was created between findFirst and create
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") return new NextResponse("Category already exits", { status: 409 });
        }
        
        console.log("[CATEGORY_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}