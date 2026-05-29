'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PublicImpactStats from '@/components/PublicImpactStats'

// Note: Full dynamic OG images for individual keepsakes are handled in the /keepsake route.

interface PublicRemembrance {
  id: string
  visit_date: string
  reflection_text: string
  cemeteries: { name: string } | null
  grave_requests: {
    deceased_full_name: string
  } | null
}

export default function RemembrancesPage() {
  const [remembrances, setRemembrances] = useState<PublicRemembrance[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCemetery, setSelectedCemetery] = useState<string | null>(null)
  const [totalPublished, setTotalPublished] = useState(0)
  const PAGE_SIZE = 8

  // Note: we no longer create the Supabase client at render time.
  // It is created inside the async data-loading functions below so that
  // this page can be statically prerendered without requiring env vars at build time.

  // Derived list of cemeteries present in the loaded public remembrances (grows as more are loaded)
  const availableCemeteries = Array.from(
    new Set(
      remembrances
        .map((r) => r.cemeteries?.name)
        .filter((name): name is string => Boolean(name))
    )
  ).sort()

  // Live counts per cemetery (updates as more remembrances are loaded)
  const cemeteryCounts: Record<string, number> = {}
  remembrances.forEach((r) => {
    const name = r.cemeteries?.name
    if (name) {
      cemeteryCounts[name] = (cemeteryCounts[name] || 0) + 1
    }
  })
  const totalLoaded = remembrances.length

  const displayedRemembrances = selectedCemetery
    ? remembrances.filter((r) => r.cemeteries?.name === selectedCemetery)
    : remembrances

  async function loadTotalPublished() {
    const supabase = createClient()
    const { count } = await supabase
      .from('visit_reports')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    setTotalPublished(count || 0)
  }

  useEffect(() => {
    async function loadRecent() {
      const supabase = createClient()
      const { data } = await supabase
        .from('visit_reports')
        .select(`
          id,
          visit_date,
          reflection_text,
          visits!inner (
            grave_requests (
              deceased_full_name,
              cemeteries (name)
            )
          )
        `)
        .eq('is_public', true)
        .order('visit_date', { ascending: false })
        .limit(PAGE_SIZE)

      if (data) {
        const formatted = data.map((r: any) => ({
          id: r.id,
          visit_date: r.visit_date,
          reflection_text: r.reflection_text,
          cemeteries: r.visits?.grave_requests?.cemeteries || null,
          grave_requests: r.visits?.grave_requests ? { deceased_full_name: r.visits.grave_requests.deceased_full_name } : null,
        }))
        setRemembrances(formatted)
        setHasMore(data.length === PAGE_SIZE)
      }
      setLoading(false)
      loadTotalPublished()
    }

    loadRecent()
  }, [])

  async function loadMore() {
    setLoadingMore(true)
    const offset = remembrances.length

    const supabase = createClient()
    const { data } = await supabase
      .from('visit_reports')
      .select(`
        id,
        visit_date,
        reflection_text,
        visits!inner (
          grave_requests (
            deceased_full_name,
            cemeteries (name)
          )
        )
      `)
      .eq('is_public', true)
      .order('visit_date', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (data && data.length > 0) {
      const formatted = data.map((r: any) => ({
        id: r.id,
        visit_date: r.visit_date,
        reflection_text: r.reflection_text,
        cemeteries: r.visits?.grave_requests?.cemeteries || null,
        grave_requests: r.visits?.grave_requests ? { deceased_full_name: r.visits.grave_requests.deceased_full_name } : null,
      }))
      setRemembrances(prev => [...prev, ...formatted])
      setHasMore(data.length === PAGE_SIZE)
    } else {
      setHasMore(false)
    }
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center">
        <p className="text-[#5c656f]">Loading recent remembrances...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-4">
          QUIET ACTS OF REMEMBRANCE
        </div>
        <h1 className="text-5xl font-semibold tracking-[-2px] text-[#1c252f]">Recent Remembrances</h1>
        <p className="mt-4 text-xl text-[#3f4852] max-w-md mx-auto">
          Small, private visits made on behalf of families who could not be there.
        </p>
        {totalPublished > 0 && (
          <p className="mt-2 text-xs tracking-widest text-[#7a838e]">
            {totalPublished} remembrances shared with permission
          </p>
        )}
        <p className="mt-1 text-xs text-[#5c656f] max-w-prose mx-auto">
          These quiet visits are the living record of care — shared so that no one has to grieve alone in that particular way.
        </p>
      </div>

      <PublicImpactStats />

      {remembrances.length === 0 ? (
        <div className="honor-card p-12 text-center">
          <p className="text-[#5c656f]">No public remembrances yet. The first ones will appear here.</p>
        </div>
      ) : (
        <>
          {/* Simple elegant cemetery filter — chips derived from loaded remembrances */}
          {availableCemeteries.length > 1 && (
            <div className="mb-8">
              <div className="text-[10px] tracking-[2px] text-[#5c656f] mb-2.5">FILTER BY CEMETERY</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCemetery(null)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition ${
                    !selectedCemetery
                      ? 'border-[#1c252f] bg-[#1c252f] text-white'
                      : 'border-[#d8d2c6] hover:bg-[#f9f7f2] text-[#3f4852]'
                  }`}
                >
                  All ({totalLoaded})
                </button>
                {availableCemeteries.map((cemetery) => {
                  const isActive = selectedCemetery === cemetery
                  const count = cemeteryCounts[cemetery] || 0
                  return (
                    <button
                      key={cemetery}
                      onClick={() => setSelectedCemetery(cemetery)}
                      className={`px-4 py-1.5 text-sm rounded-full border transition ${
                        isActive
                          ? 'border-[#1c252f] bg-[#1c252f] text-white'
                          : 'border-[#d8d2c6] hover:bg-[#f9f7f2] text-[#3f4852]'
                      }`}
                    >
                      {cemetery} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {displayedRemembrances.length === 0 ? (
            <div className="honor-card p-8 text-center">
              <p className="text-[#5c656f]">
                No public remembrances from {selectedCemetery} have loaded yet.
              </p>
              {hasMore && (
                <p className="mt-2 text-sm text-[#7a838e]">Load more below to see additional visits.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {displayedRemembrances.map((r) => {
                const name = r.grave_requests?.deceased_full_name || 'A loved one'
                const cemetery = r.cemeteries?.name || 'a national cemetery'
                const date = new Date(r.visit_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })

                const shortReflection = r.reflection_text.length > 180 
                  ? r.reflection_text.substring(0, 180) + '…' 
                  : r.reflection_text

                return (
                  <a 
                    key={r.id} 
                    href={`/keepsake/${r.id}`}
                    className="honor-card p-7 block hover:border-[#c9b48a] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                      <div className="font-medium text-lg tracking-tight text-[#1c252f]">
                        A visit for {name}
                      </div>
                      <div className="text-sm text-[#5c656f]">
                        {date}
                      </div>
                    </div>
                    <div className="text-sm text-[#5c656f] mb-4">
                      at {cemetery}
                    </div>
                    <p className="honor-quote text-[15px] text-[#2a3138]">
                      “{shortReflection}”
                    </p>
                    <div className="mt-4 text-xs text-[#8a7754] tracking-widest">
                      VIEW THE FULL KEEPSAKE →
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-[#d8d2c6] px-6 py-2 text-sm hover:bg-[#f9f7f2] transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more remembrances'}
          </button>
        </div>
      )}

      <div className="mt-16 text-center text-sm text-[#5c656f]">
        These are shared with permission. Every visit was made with quiet respect.
      </div>

      <div className="mt-8 text-center">
        <a href="/about" className="text-sm text-[#5c656f] hover:text-[#1c252f] underline">
          Learn more about HonorProxy
        </a>
      </div>
    </div>
  )
}
