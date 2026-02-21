import prisma from "@/lib/db";
import { userFormSchema } from "@/schema/user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { NextResponse } from "next/server";


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ staffId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        const { staffId } = await params;

        // 1. Authorization & Role Check
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const client = await clerkClient();

        // 2. Fetch existing state
        const existedUserInDb = await prisma.staff.findUnique({ where: { id: staffId } });
        const existedUserInClerk = await client.users.getUser(staffId);

        if (!existedUserInDb && !existedUserInClerk) return new NextResponse("User not found", { status: 404 });

        // 3. Validation
        const formData = await request.formData();
        const rawData = Object.fromEntries(formData.entries());
        const validation = userFormSchema.safeParse(rawData);

        if (!validation.success) return NextResponse.json(
            { errors: validation.error.flatten().fieldErrors },
            { status: 400 }
        );

        const { email, firstName, lastName, username, title, bio, password, confirmPassword } = validation.data;

        if (password && password !== confirmPassword) return NextResponse.json(
            { errors: { confirmPassword: ["Passwords don't match"] } },
            { status: 400 }
        );

        // 4. Primary Email Update Logic
        const currentEmail = existedUserInClerk.primaryEmailAddress?.emailAddress;
        
        if (email && email !== currentEmail) {
            // CHECK: Is this email already taken by someone else?
            const usersWithEmail = await client.users.getUserList({ emailAddress: [email] });
            if (usersWithEmail.totalCount > 0) {
                return NextResponse.json(
                    { message: "Email is already in use by another account" },
                    { status: 400 }
                );
            }

            // Create new email and set as primary
            await client.emailAddresses.createEmailAddress({
                userId: staffId,
                emailAddress: email,
                verified: true,
                primary: true,
            });

            // Cleanup: Remove old secondary emails to keep it clean
            const oldEmails = existedUserInClerk.emailAddresses.filter(e => e.emailAddress !== email);
            for (const old of oldEmails) {
                try {
                    await client.emailAddresses.deleteEmailAddress(old.id);
                } catch (e) {
                    console.error("Failed to delete old email record:", old.id);
                }
            }
        }

        // 5. Update Profile Metadata & Identity
        const user = await client.users.updateUser(staffId, {
            firstName: firstName,
            lastName: lastName,
            username: username,
            publicMetadata: {
                title: title,
                bio: bio
            },
            ...(password ? { password } : {})
        });

        // 6. Database Sync
        try {
            const name = `${firstName} ${lastName}`;
            const updateStaff = await prisma.staff.update({
                where: { id: user.id },
                data: {
                    email: email,
                    name: name,
                    username: username,
                    title: title || "Staff",
                    bio: bio
                }
            });

            return NextResponse.json({ success: true, userId: updateStaff.id }, { status: 200 });
        } catch (dbError) {
            console.error("[DATABASE_PATCH_ERROR]", dbError);
            return new NextResponse("Clerk updated, but Database failed to sync.", { status: 500 });
        }

    } catch (error: unknown) {
        console.error("[USER_PATCH_GENERAL_ERROR]", error);

        // 1. Check if it is a specific Clerk API error
        if (isClerkAPIResponseError(error)) {
            return NextResponse.json(
                { 
                    message: error.errors[0]?.longMessage || error.errors[0]?.message, 
                    code: error.errors[0]?.code 
                },
                { status: 400 }
            );
        }

        // 2. Check if it is a standard JavaScript Error
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 500 });
        }

        // 3. Fallback for literal strings or unknown types
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ staffId: string }> }
) {
    try {
        const { userId, sessionClaims } = await auth();
        const { staffId } = await params;

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        if (sessionClaims?.metadata?.title !== "Admin") return new NextResponse("Forbidden", { status: 403 });

        const client = await clerkClient();

        // 1. Delete from Clerk (Identity Provider)
        try {
            await client.users.deleteUser(staffId);
        } catch (clerkError: unknown) { // Change any to unknown
            // Use the type guard to handle Clerk-specific errors
            if (isClerkAPIResponseError(clerkError)) {
                // If the user is already gone from Clerk, we don't need to throw an error
                if (clerkError.status !== 404) {
                    console.error("[DELETE_CLERK_ERROR]", clerkError);
                    return new NextResponse("Failed to delete user from Clerk", { status: 500 });
                }
            } else {
                // Handle non-Clerk errors (network, etc.)
                return new NextResponse("An unexpected error occurred", { status: 500 });
            }
        }

        // 2. Delete from Prisma (Local Record)
        await prisma.staff.delete({
            where: { id: staffId }
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: unknown) { // Change any to unknown here too
        console.error("[DELETE_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}