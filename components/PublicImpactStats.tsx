'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PublicImpactStats() {
  const [stats, setStats] = useState<{ visits: number; cemeteries: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      // Count public visits
      const { count: totalVisits } = await supabase
        .from('visit_reports')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)

      // Count distinct cemeteries with public visits
      const { data: cemeteriesData } = await supabase
        .from('visit_reports')
        .select(`
          visits!inner (
            grave_requests!inner (
              cemeteries!inner (name)
            )
          )
        `)
        .eq('is_public', true)

      const uniqueCemeteries = new Set(
        (cemeteriesData || [])
          .map((r: any) => r.visits?.grave_requests?.cemeteries?.name)
          .filter(Boolean)
      )

      const visits = totalVisits || 0
      const cemeteries = uniqueCemeteries.size

      if (visits > 0) {
        setStats({ visits, cemeteries })
      }
    }

    fetchStats()
  }, [])

  if (!stats) {
    return null
  }

  return (
    <div className="text-center py-8 border-y border-[#d8d2c6] bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-center gap-x-12 gap-y-4 text-sm">
          <div>
            <span className="font-semibold text-[#1c252f] text-lg">{stats.visits}</span>
            <span className="ml-2 text-[#5c656f]">quiet visits made</span>
          </div>
          <div>
            <span className="font-semibold text-[#1c252f] text-lg">{stats.cemeteries}</span>
            <span className="ml-2 text-[#5c656f]">cemeteries touched with care</span>
          </div>
        </div>
        <p className="mt-2 text-xs tracking-widest text-[#7a838e]">
          {stats.visits} shared publicly with permission
        </p>
        <p className="mt-3 text-xs tracking-widest text-[#7a838e]">
          ON BEHALF OF FAMILIES WHO COULD NOT BE THERE
        </p>
      </div>
    </div>
  )
}
