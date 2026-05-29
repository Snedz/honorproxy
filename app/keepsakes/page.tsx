'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Pure helper for public Storage URLs (no client needed, safe during prerender)
function getPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || ''
  return `${base}/storage/v1/object/public/visit-photos/${encodeURIComponent(path)}`
}

interface CompletedVisit {
  id: string
  created_at: string
  grave_requests: {
    deceased_full_name: string
    cemeteries: { name: string } | null
  } | null
}

interface Report {
  id: string
  visit_id: string
  visit_date: string
  reflection_text: string
  tribute_left: string | null
  photo_urls: string[] | null
  thank_you_message: string | null
}

export default function MyKeepsakesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [visits, setVisits] = useState<CompletedVisit[]>([])
  const [reports, setReports] = useState<Record<string, Report>>({})
  const [loading, setLoading] = useState(true)

  // No top-level createClient() — it is only called inside effects/handlers after mount.
  // This allows the page to be statically prerendered without env vars at build time.

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await loadKeepsakes(user.id, supabase)
      }
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadKeepsakes(userId: string, supabase?: ReturnType<typeof createClient>) {
    const client = supabase || createClient()

    // Load completed visits
    const { data: visitsData } = await client
      .from('visits')
      .select(`
        id,
        created_at,
        grave_requests (
          deceased_full_name,
          cemeteries (name)
        )
      `)
      .eq('visitor_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (!visitsData) {
      setVisits([])
      return
    }

    setVisits(visitsData as CompletedVisit[])

    // Load reports for these visits
    const visitIds = visitsData.map((v: any) => v.id)
    if (visitIds.length > 0) {
      const { data: reportsData } = await client
        .from('visit_reports')
        .select(`
          id,
          visit_id,
          visit_date,
          reflection_text,
          tribute_left,
          photo_urls,
          thank_you_message
        `)
        .in('visit_id', visitIds)

      if (reportsData) {
        const reportsMap: Record<string, Report> = {}
        reportsData.forEach((r: any) => {
          reportsMap[r.visit_id] = r
        })
        setReports(reportsMap)
      }
    }
  }

  function copyLink(visitId: string) {
    const url = `${window.location.origin}/visit/keepsake/${visitId}`
    navigator.clipboard.writeText(url)
      .then(() => alert('Keepsake link copied.'))
      .catch(() => alert('Link: ' + url))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-[#5c656f]">
        Loading your keepsakes...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1c252f]">Sign in to view your keepsakes</h1>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/login" className="rounded-full border border-[#d8d2c6] px-6 py-2.5 text-sm hover:bg-white">Sign in</a>
          <a href="/signup" className="rounded-full bg-[#1c252f] px-6 py-2.5 text-sm text-white">Create account</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-9">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">My Keepsakes</h1>
          <p className="text-[#5c656f] mt-1.5">Your personal record of remembrance.</p>
          <p className="text-sm text-[#5c656f] mt-1 mb-6 max-w-prose">
            These are the quiet acts of remembrance you have carried out on behalf of families. Each one is a promise kept.
          </p>
        </div>
        <a href="/visit" className="text-sm text-[#5c656f] hover:text-[#1c252f]">Offer another visit →</a>
      </div>

      {visits.length === 0 ? (
        <div className="honor-card p-12 text-center">
          <p className="text-[#5c656f] mb-6">You haven’t completed any visits yet.</p>
          <a href="/visit" className="rounded-full bg-[#1c252f] px-8 py-3 text-sm font-medium text-white">
            Browse open requests
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {visits.map((visit) => {
            const report = reports[visit.id]

            return (
              <div key={visit.id} className="honor-card p-7">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-2xl tracking-tight text-[#1c252f]">
                      {visit.grave_requests?.deceased_full_name}
                    </div>
                    <div className="text-sm text-[#5c656f] mt-0.5">
                      {visit.grave_requests?.cemeteries?.name}
                    </div>
                  </div>
                  <div className="flex gap-2 self-start">
                    <a
                      href={`/visit/keepsake/${visit.id}`}
                      className="rounded-full bg-[#1c252f] px-5 py-1.5 text-xs font-medium text-white hover:bg-black transition"
                    >
                      Open keepsake
                    </a>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/keepsake/${visit.id}`
                        navigator.clipboard.writeText(url).then(() => alert('Link copied'))
                      }}
                      className="rounded-full border border-[#d8d2c6] px-5 py-1.5 text-xs hover:bg-[#f9f7f2] transition"
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                {report && (
                  <>
                    <div className="text-sm text-[#5c656f] mb-3">
                      Visited {new Date(report.visit_date).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}
                    </div>

                    {report.tribute_left && (
                      <div className="text-sm mb-4">
                        Tribute left: <span className="font-medium">{report.tribute_left}</span>
                      </div>
                    )}

                    <div className="border-l-3 border-[#d8d2c6] pl-4 mb-5">
                      <p className="honor-quote text-[15px] text-[#2a3138]">
                        “{report.reflection_text.length > 220 
                          ? report.reflection_text.substring(0, 220) + '…' 
                          : report.reflection_text}”
                      </p>
                    </div>

                    {report.photo_urls && report.photo_urls.length > 0 && (
                      <div className="flex gap-3">
                        {report.photo_urls.slice(0, 3).map((path, idx) => {
                          const publicUrl = getPublicUrl(path)
                          return (
                            <a key={idx} href={`/visit/keepsake/${visit.id}`} className="block">
                              <img 
                                src={publicUrl} 
                                alt="" 
                                className="w-20 h-20 object-cover honor-photo rounded-lg" 
                              />
                            </a>
                          )
                        })}
                        {report.photo_urls.length > 3 && (
                          <div className="w-20 h-20 flex items-center justify-center text-xs text-[#5c656f] border border-[#d8d2c6] rounded-lg">
                            +{report.photo_urls.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {report.thank_you_message && (
                      <div className="mt-5 pt-4 border-t border-[#d8d2c6] text-sm">
                        <span className="honor-label text-[#8a7754]">Thank you received</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-12 text-center text-xs tracking-widest text-[#7a838e]">
        Every visit you make becomes part of something larger than any of us.
      </div>
    </div>
  )
}
