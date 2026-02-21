import { Prisma, StaffTitle } from "@/app/generated/prisma/client";
import Header from "@/components/Header";
import UserTable from "@/components/User";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "User Management"
};

const UserPage = async ({
    searchParams
}: {
    searchParams: Promise<{ 
        query?: string; page?: string; limit?: string;
        reqQuery?: string; reqPage?: string; reqLimit?: string;
    }>;
}) => {
    const user = await currentUser();
    const params = await searchParams;

    // Admin authorization check
    if (user?.publicMetadata?.title !== 'Admin') return null;

    // --- Table 1: User List Logic ---
    const userLimit = params.limit === 'all' ? undefined : (Number(params.limit) || 10);
    const userPage = Number(params.page) || 1;
    const userSkip = params.limit === 'all' ? undefined : (userPage - 1) * (userLimit || 10);

    // Map query to StaffTitle enum for User Table
    const matchedTitles = Object.values(StaffTitle).filter(t => 
        t.toLowerCase().includes((params.query || "").toLowerCase())
    ) as StaffTitle[];

    const userWhere: Prisma.StaffWhereInput = params.query ? {
        OR: [
            { name: { contains: params.query, mode: 'insensitive' as const } },
            { email: { contains: params.query, mode: 'insensitive' as const } },
            { username: { contains: params.query, mode: 'insensitive' as const } },
            { title: { in: matchedTitles } }
        ]
    } : {};

    // --- Table 2: Role Requests Logic ---
    const reqLimit = params.reqLimit === 'all' ? undefined : (Number(params.reqLimit) || 10);
    const reqPage = Number(params.reqPage) || 1;
    const reqSkip = params.reqLimit === 'all' ? undefined : (reqPage - 1) * (reqLimit || 10);

    // Map reqQuery to StaffTitle enum for Approvals Table
    const matchedReqRoles = Object.values(StaffTitle).filter(t => 
        t.toLowerCase().includes((params.reqQuery || "").toLowerCase())
    ) as StaffTitle[];

    const reqWhere: Prisma.RoleRequestWhereInput = {
        status: "PENDING",
        ...(params.reqQuery ? {
            OR: [
                {
                    staff: {
                        name: { contains: params.reqQuery, mode: 'insensitive' as const }
                    }
                },
                {
                    // Enable searching by the requestedRole enum column
                    requestedRole: { in: matchedReqRoles }
                }
            ]
        } : {})
    };

    // Execute all queries in parallel for maximum performance
    const [staff, totalStaff, roleRequests, totalRequests] = await Promise.all([
        prisma.staff.findMany({ 
            where: userWhere, 
            take: userLimit, 
            skip: userSkip, 
            orderBy: { name: 'asc' } 
        }),
        prisma.staff.count({ where: userWhere }),
        prisma.roleRequest.findMany({ 
            where: reqWhere, 
            include: { staff: true }, 
            take: reqLimit, 
            skip: reqSkip, 
            orderBy: { createdAt: "desc" } 
        }),
        prisma.roleRequest.count({ where: reqWhere })
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header title="User Management" />
            <section className="px-5 py-5">
                <UserTable
                    key={JSON.stringify(params)}
                    data={staff} 
                    totalCount={totalStaff}
                    requestData={roleRequests} 
                    totalRequestCount={totalRequests}
                    searchParams={params}
                />
            </section>
        </div>
    );
}

export default UserPage;