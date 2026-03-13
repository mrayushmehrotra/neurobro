/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://neurobro.vercel.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    outDir: './public',
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
}
