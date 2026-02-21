import { Prisma } from "@/app/generated/prisma/client";
import Header from "@/components/Header"
import QueuePage from "@/components/Queue";
import prisma from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Queue"
}

const QueueHomePage = async ({
    searchParams
}: {
    searchParams: Promise<{ query?: string; page?: string; limit?: string }>;
}) => {
    const { query, page, limit } = await searchParams;

    // 1. Pagination & Limit Logic
    const isViewAll = limit === 'all';
    const itemsPerPage = isViewAll ? undefined : (Number(limit) || 10);
    const currentPage = Number(page) || 1;
    const skip = isViewAll ? undefined : (currentPage - 1) * (itemsPerPage || 10);

    // 2. Search Filter (matches tokenNumber)
    const where: Prisma.QueueTicketWhereInput = query && !isNaN(Number(query))
        ? { tokenNumber: Number(query) }
        : {};

    // 3. Parallel Queries for Data and Total Count
    const [queue, totalCount] = await Promise.all([
        prisma.queueTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: itemsPerPage,
            skip: skip,
        }),
        prisma.queueTicket.count({ where })
    ]);

    const totalPages = isViewAll ? 1 : Math.ceil(totalCount / (itemsPerPage || 10));

    return (
        <div>
            <Header title="Queue" />
            <section className="px-5 py-5">
                <QueuePage 
                    data={queue} 
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

export default QueueHomePage;