import { Prisma } from "@/app/generated/prisma/client";
import DoctorTable from "@/components/Doctor";
import Header from "@/components/Header";
import prisma from "@/lib/db";
import { Metadata } from "next";



export const metadata: Metadata = {
    title: "Doctor Management"
}

const DoctorPage = async ({
    searchParams
}: {
    searchParams: Promise<{
        query?: string;
        page?: string;
        limit?: string;
    }>;
}) => {
    const { query, page, limit } = await searchParams;

    const isViewAll = limit === "all";
    const itemsPerPage = isViewAll ? undefined : (Number(limit) || 10);
    const currentPage = Number(page) || 1;
    const skip = isViewAll ? undefined : (currentPage - 1) * (itemsPerPage || 10);

    let where: Prisma.StaffWhereInput = {
        title: "Doctor"
    };

    if (query) {
        where = {
            AND: [
                where,
                {
                    OR: [
                        {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                        {
                            schedule: {
                                some: {
                                    OR: [
                                        {
                                            day: {
                                                contains: query,
                                                mode: 'insensitive',
                                            },
                                        },
                                        {
                                            startTime: {
                                                contains: query,
                                                mode: 'insensitive',
                                            },
                                        },
                                        {
                                            endTime: {
                                                contains: query,
                                                mode: 'insensitive',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

    const [doctors, totalCount] = await Promise.all([
        prisma.staff.findMany({
            where,
            include: { schedule: true },
            orderBy: { name: "asc" },
            take: itemsPerPage,
            skip: skip
        }),
        prisma.staff.count({ where })
    ]);

    const totalPages = isViewAll ? 1 : Math.ceil(totalCount / (itemsPerPage || 10));

    return (
        <div className="flex flex-col">
            <Header title="Doctor Schedule" />
            <section className="px-5 py-5">
                <DoctorTable
                    data={doctors}
                    query={query}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    limit={limit || "10"}
                    totalCount={totalCount}
                />
            </section>
        </div>
    )
}

export default DoctorPage;