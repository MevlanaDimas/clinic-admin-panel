import prisma from "@/lib/db";
import { userFormSchema } from "@/schema/user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


interface ClerkError {
    errors: Array<{
        message: string;
        code: string;
    }>;
}

function isClerkError(error: unknown): error is ClerkError {
    return (
        typeof error === "object" &&
        error !== null &&
        "errors" in error &&
        Array.isArray((error as ClerkError).errors)
    );
}

export async function POST(request: Request) {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const formData = await request.formData();
        
        const rawData = Object.fromEntries(formData.entries());
        const validation = userFormSchema.safeParse(rawData);

        if (!validation.success) return NextResponse.json(
            { errors: validation.error.flatten().fieldErrors },
            { status: 400 }
        );

        const { email, firstName, lastName, username, title, bio, password, confirmPassword } = validation.data;

        const name = `${firstName} ${lastName}`;

        if (password !== confirmPassword) return NextResponse.json(
            { errors: { confirmPassword: ["Passwords don't match"] } },
            { status: 400 }
        );

        const client = await clerkClient();

        const existingUser = await prisma.staff.findFirst({
            where: {
                OR: [
                    { 
                        email: {
                            equals: email,
                            mode: "insensitive"
                        }
                    },
                    {
                        username: {
                            equals: username,
                            mode: "insensitive"
                        }
                    }
                ]
            }
        });

        if (existingUser) return NextResponse.json(
            {
                errors: {
                    username: ["Username already exists"],
                    email: ["Email already exists"]
                }
            },
            {
                status: 400 
            }
        );

        const clerUserList = await client.users.getUserList({
            emailAddress: [email],
            username: username ? [username] : undefined
        });

        if (clerUserList.data.length > 0) return NextResponse.json(
            { error: "User already exists in Clerk Authentication" },
            { status: 400 }
        );

        const user = await client.users.createUser({
            emailAddress: [email],
            firstName: firstName,
            lastName: lastName,
            username: username,
            publicMetadata: {
                title: title,
                bio: bio
            },
            password: password
        });

        try {
            const createStaff = await prisma.staff.create({
                data: {
                    id: user.id,
                    email: email,
                    name: name,
                    username: username,
                    title: title || "Staff",
                    bio: bio 
                }
            });

            return NextResponse.json(
                {
                    success: true,
                    userId: createStaff.id
                },
                { status: 201 }
            );
        } catch (dbError) {
            console.log("[USER_POST]", dbError);
            await client.users.deleteUser(user.id);
            throw new Error("Database failed, Clerk account rolled back");
        }
    } catch (error: unknown) {
        if (isClerkError(error)) {
            const clerkError = error.errors[0];
            return NextResponse.json(
                {
                    message: clerkError.message || "Something went wrong",
                    code: clerkError.code || "UNKNOWN_ERROR"
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) return new NextResponse(error.message, { status: 500 });

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}