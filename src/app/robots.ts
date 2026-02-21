import { MetadataRoute } from "next";


export default function robots(): MetadataRoute.Robots {
    const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://clinic-admin-panel.id';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/:path*',
                    '/server-sitemap.xml',
                    '/user',
                    '/sign-in',
                    '/sign-up'
                ]
            }
        ],
        sitemap: `${productionUrl}/sitemap.xml`
    };
}