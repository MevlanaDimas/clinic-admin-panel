import prisma from "@/lib/db";
import { getServerSideSitemap, ISitemapField } from 'next-sitemap';


export const revalidate = 3600;

export async function GET(request: Request) {
    const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://clinic-admin-panel.id';

    const newsItems = await prisma.news.findMany({
        select: {
            id: true,
            updatedAt: true
        }
    });

    const promoItems = await prisma.promo.findMany({
        select: {
            id: true,
            updatedAt: true
        }
    });

    const newsField: ISitemapField[] = newsItems.map((item) => ({
        loc: `${productionUrl}/news/${item.id}/view`,
        lastmod: item.updatedAt.toISOString(),
        changefreq: 'daily',
        priority: 0.7
    }));

    const promoField: ISitemapField[] = promoItems.map((item) => ({
        loc: `${productionUrl}/promo/${item.id}/view`,
        lastmod: item.updatedAt.toISOString(),
        changefreq: 'daily',
        priority: 0.7
    }));

    return getServerSideSitemap([...newsField, ...promoField])
}