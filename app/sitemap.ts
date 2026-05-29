import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://honorproxy.com'

  // Core public pages
  const staticRoutes = [
    '',
    '/remembrances',
    '/about',
    '/vision',
    '/pilot',
    '/conduct',
    '/privacy',
  ]

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamically include public keepsakes.
  // We guard the Supabase client creation because some Next.js build steps
  // (especially sitemap generation on Vercel) can run without the env vars
  // fully injected. Falling back to static routes only is safe and prevents
  // hard build failures.
  let keepsakeEntries: MetadataRoute.Sitemap = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: publicReports } = await supabase
        .from('visit_reports')
        .select('id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      keepsakeEntries = (publicReports || []).map((report: { id: string; created_at: string }) => ({
        url: `${baseUrl}/keepsake/${report.id}`,
        lastModified: new Date(report.created_at),
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      }))
    } catch (err) {
      console.warn('[sitemap] Failed to load public keepsakes from Supabase at build time. Using static routes only.', err)
    }
  } else {
    console.warn('[sitemap] Supabase environment variables not present during build. Static sitemap only.')
  }

  return [...staticEntries, ...keepsakeEntries]
}
