import { Prisma } from "@/app/generated/prisma/client";
import Header from "@/components/Header";
import PromoTable from "@/components/Promo";
import prisma from "@/lib/db";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Promo Management"
};

const PromoPage = async ({
  searchParams
}: {
  searchParams: Promise<{ query?: string; page?: string; limit?: string }>;
}) => {
  const { query, page, limit } = await searchParams;

  // 1. Pagination & Limit Logic
  const isViewAll = limit === "all";
  const itemsPerPage = isViewAll ? undefined : (Number(limit) || 10);
  const currentPage = Number(page) || 1;
  const skip = isViewAll ? undefined : (currentPage - 1) * (itemsPerPage || 10);

  // Check if query is a valid date for validUntil search
  const queryDate = query ? new Date(query) : undefined;
  const isValidDate = queryDate && !isNaN(queryDate.getTime());

  // 2. Search Filter Logic
  const where: Prisma.PromoWhereInput = query
    ? {
        OR: [
          { code: { contains: query, mode: 'insensitive' as const } },
          { headline: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { category: { contains: query, mode: 'insensitive' as const } },
          { CTA: { contains: query, mode: 'insensitive' as const } },
          ...(isValidDate ? [{ validUntil: { equals: queryDate } }] : [])
        ]
      }
    : {};

  // 3. Database Queries (Parallel)
  const [promo, totalCount] = await Promise.all([
    prisma.promo.findMany({
      where,
      include: { image: true },
      orderBy: { createdAt: 'desc' },
      take: itemsPerPage,
      skip: skip,
    }),
    prisma.promo.count({ where })
  ]);

  const totalPages = isViewAll ? 1 : Math.ceil(totalCount / (itemsPerPage || 10));

  return (
    <div>
      <Header title="Promo" />
      <section className="px-5 py-5">
        <PromoTable 
            data={promo} 
            query={query} 
            totalPages={totalPages} 
            currentPage={currentPage}
            limit={limit || "10"}
            totalCount={totalCount}
        />
      </section>
    </div>
  );
}

export default PromoPage;