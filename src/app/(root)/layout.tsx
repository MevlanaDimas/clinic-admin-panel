import prisma from "@/lib/db";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StaffTitle } from "../generated/prisma/enums";
import { PageLayout } from "@/components/PageLayout";

export default async function AppSidebarLayout({
    children
}: { children: React.ReactNode }) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const staff = await prisma.staff.findUnique({
        where: {
            id: userId
        }
    });

    if (!staff) {
        const user = await currentUser();
        if (!user) redirect("/sign-in");

        const client = await clerkClient();

        if (!user?.publicMetadata?.title && !user?.publicMetadata?.bio) {
            await client.users.updateUser(user.id, {
                publicMetadata: {
                    title: "Staff",
                    bio: ""
                }
            })
        }

        await prisma.staff.create({
            data: {
                id: user.id,
                email: user.emailAddresses[0].emailAddress,
                username: user.username || user.firstName?.toLowerCase() || user.id,
                name: `${user.firstName} ${user.lastName}`,
                title: (user.publicMetadata.title as StaffTitle) || StaffTitle.Staff,
                bio: user.publicMetadata.bio as string,
            }
        });
    }

    return (
        <PageLayout>
            {children}
        </PageLayout>
    )
}