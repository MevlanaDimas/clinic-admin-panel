import { Prisma } from "@/app/generated/prisma/client";
import Header from "@/components/Header";
import NewsTable from "@/components/News";
import prisma from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News"
}

const NewsPage = async ({
  searchParams
}: {
  searchParams: Promise<{ query?: string; page?: string; limit?: string }>;
}) => {
  const { query, page, limit } = await searchParams;

  // 1. Unified Pagination Constants
  const isViewAll = limit === 'all';
  const itemsPerPage = isViewAll ? undefined : (Number(limit) || 10);
  const currentPage  = Number(page) || 1;
  const skip = isViewAll ? undefined : (currentPage - 1) * (itemsPerPage || 10);

  // Check if query is a valid date for publishedAt search
  const queryDate = query ? new Date(query) : undefined;
  const isValidDate = queryDate && !isNaN(queryDate.getTime());

  // 2. Comprehensive Search Filter
  // This correctly implements searching across title, content, summary, tags, publishedAt, and the related category name
  const where: Prisma.NewsWhereInput = query
  ? {
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { content: { contains: query, mode: 'insensitive' as const } },
      { summary: { contains: query, mode: 'insensitive' as const } },
      { category: {
        name: { contains: query, mode: 'insensitive' as const }
      }},
      { author: {
        name: { contains: query, mode: 'insensitive' as const }
      }},
      { tags: { has: query } },
      ...(isValidDate ? [{ publishedAt: { equals: queryDate } }] : [])
    ]
  } : {};

  // 3. Parallel Database Execution
  const [news, totalCount] = await Promise.all([
    prisma.news.findMany({
      where, // IMPORTANT: You were missing this line!
      include: {
        author: true,   // Fetches author Staff details [cite: 14]
        category: true, // Fetches category Name [cite: 13]
        images: true    // Fetches associated NewsImages [cite: 16]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: itemsPerPage,
      skip: skip
    }),
    prisma.news.count({ where })
  ]);

  const totalPages = isViewAll ? 1 : Math.ceil(totalCount / (itemsPerPage || 10));
  
  return (
    <div className="flex flex-col">
      <Header title="News" />
      <section className="px-5 py-5">
        <NewsTable 
          data={news}
          query={query}
          totalPages={totalPages}
          currentPage={currentPage} // Fixed typo: 'currentpage' -> 'currentPage'
          limit={limit || "10"}
          totalCount={totalCount}
        />
      </section>
    </div>
  );
}

export default NewsPage;