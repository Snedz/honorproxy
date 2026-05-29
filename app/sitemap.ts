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

  // Dynamically include public keepsakes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: publicReports } = await supabase
    .from('visit_reports')
    .select('id, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const keepsakeEntries = (publicReports || []).map((report: { id: string; created_at: string }) => ({
    url: `${baseUrl}/keepsake/${report.id}`,
    lastModified: new Date(report.created_at),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...keepsakeEntries]
}
