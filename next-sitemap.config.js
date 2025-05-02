// next-sitemap.config.js
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sjhrc.in',
  generateRobotsTxt: true,
  exclude: ['/server-sitemap.xml', '/dashboard/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sjhrc.in'}/sitemap.xml`,
    ],
  },
};
