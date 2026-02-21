module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://clinic-admin-panel.id',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: [
        '/server-sitemap.xml',
        '/api/:path*',
        '/user',
        '/sign-in',
        '/sign-up',
    ],
    robotsTxtOptions: {
        additionalSitemaps: [
            `${this.siteUrl}/server-sitemap.xml`
        ],
        policies: [
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
        ]
    }
}