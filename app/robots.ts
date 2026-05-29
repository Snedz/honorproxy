import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/review/',
          '/login',
          '/signup',
          '/my-requests/',
          '/visit/',
        ],
      },
    ],
    sitemap: 'https://honorproxy.com/sitemap.xml',
  }
}
