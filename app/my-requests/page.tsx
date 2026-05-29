'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface VisitReport {
  id: string
  visit_id: string
  visit_date: string
  reflection_text: string
  tribute_left: string | null
  photo_urls: string[]
  created_at: string
  signedPhotoUrls?: string[]   // client-generated temporary URLs
  publicPhotoUrls?: string[]   // added at load time for public bucket URLs
  // Thank-you / reply fields (populated on visit_reports table)
  thank_you_message?: string | null
  thank_you_sent_at?: string | null
  visitor_reply?: string | null
}

interface Request {
  id: string
  deceased_full_name: string
  status: string
  created_at: string
  section: string | null
  grave_number: string | null
  cemeteries: { name: string; slug: string } | null
  visit_reports?: VisitReport[]
}

export default function MyRequestsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadRequests(user.id)
      } else {
        setLoading(false)
      }
    })
  }, [supabase])

  async function loadRequests(userId: string) {
    const { data, error } = await supabase
      .from('grave_requests')
      .select(`
        id,
        deceased_full_name,
        status,
        created_at,
        section,
        grave_number,
        cemeteries (name, slug),
        visit_reports (
          id,
          visit_id,
          visit_date,
          reflection_text,
          tribute_left,
          photo_urls,
          created_at
        )
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) {
      setLoading(false)
      return
    }

    // Generate signed URLs for photos (since bucket is private)
    // Since the visit-photos bucket is public, we can use direct public URLs
    const requestsWithPhotos = data.map((req: any) => {
      if (req.visit_reports && req.visit_reports.length > 0) {
        const reportsWithPhotos = req.visit_reports.map((report: any) => {
          const publicUrls = (report.photo_urls || []).map((path: string) => {
            const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)
            return data.publicUrl
          })
          return { ...report, publicPhotoUrls: publicUrls }
        })
        return { ...req, visit_reports: reportsWithPhotos }
      }
      return req
    })

    setRequests(requestsWithPhotos as Request[])
    setLoading(false)
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-6 py-16 text-[#5c656f]">Loading your requests...</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#1c252f]">Please sign in</h1>
        <p className="mt-2 text-[#4a5563]">You need to be logged in to view your requests.</p>
        <a href="/login" className="mt-6 inline-block rounded-full bg-[#1c252f] px-6 py-2.5 text-white text-sm">Sign in</a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">My Requests</h1>
        <p className="text-sm text-[#5c656f] mt-1 mb-6 max-w-prose">
          These are the requests you have entrusted to HonorProxy. Each one represents a quiet promise that someone will stand at the grave on your behalf.
        </p>
        <a href="/request" className="text-sm rounded-full border border-[#d8d2c6] px-5 py-2 hover:bg-white">New request</a>
      </div>

      {requests.length === 0 ? (
        <div className="honor-card p-12 text-center">
          <p className="text-[#5c656f]">You haven’t submitted any requests yet.</p>
          <a href="/request" className="mt-6 inline-block rounded-full bg-[#1c252f] px-6 py-2.5 text-sm font-medium text-white">Make your first request</a>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const report = req.visit_reports?.[0]

            return (
              <div key={req.id} className="honor-card p-7">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-xl tracking-tight text-[#1c252f]">{req.deceased_full_name}</div>
                    <div className="text-[#5c656f] text-sm mt-0.5">
                      {req.cemeteries?.name || 'Unknown cemetery'}
                    </div>
                    {(req.section || req.grave_number) && (
                      <div className="mt-1 text-xs text-[#5c656f]">
                        {req.section && <>Section {req.section} </>}
                        {req.grave_number && <>Grave {req.grave_number}</>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-block text-xs px-3 py-1 rounded-full font-medium tracking-wider ${
                      req.status === 'open' ? 'bg-[#f5e8c7] text-[#8a6640]' :
                      req.status === 'claimed' ? 'bg-[#d4e0f0] text-[#3a5a7a]' :
                      req.status === 'fulfilled' ? 'bg-[#e9e4d9] text-[#3f4a3f]' :
                      'bg-[#e9e4d9] text-[#5c656f]'
                    }`}>
                      {req.status}
                    </div>
                    <div className="text-[10px] tracking-widest text-[#7a838e] mt-1">
                      REQUESTED {new Date(req.created_at).toLocaleDateString().toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Report Section — elevated keepsake for the family */}
                {report ? (
                  <div className="mt-7 border-t border-[#d8d2c6] pt-7">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-[#d8d2c6]" />
                      <div className="honor-label px-2 tracking-[1.5px]">A VISIT WAS MADE</div>
                      <div className="h-px flex-1 bg-[#d8d2c6]" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#5c656f] mb-1">
                      <div>
                        {new Date(report.visit_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <a 
                        href={`/visit/keepsake/${report.visit_id}`}
                        className="text-xs px-3 py-1 rounded-full border border-[#d8d2c6] hover:bg-[#f9f7f2] transition"
                      >
                        View full keepsake
                      </a>
                    </div>

                    {report.tribute_left && (
                      <div className="text-sm text-[#3a434d] mb-5">
                        Tribute left: <span className="font-medium">{report.tribute_left}</span>
                      </div>
                    )}

                    <div className="rounded-2xl bg-[#f9f7f2] border border-[#d8d2c6] p-6 mb-6">
                      <div className="honor-label mb-2">The visitor wrote</div>
                      <p className="honor-quote text-[15px] text-[#2a3138]">
                        “{report.reflection_text}”
                      </p>
                    </div>

                    {report.publicPhotoUrls && report.publicPhotoUrls.length > 0 && (
                      <div>
                        <div className="honor-label mb-3">Photos from the visit</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {report.publicPhotoUrls.map((url: string, index: number) => (
                            <a 
                              key={index} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block group"
                            >
                              <img 
                                src={url} 
                                alt={`Visit photo ${index + 1}`}
                                className="honor-photo w-full aspect-[4/3] object-cover group-hover:opacity-90"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Thank the visitor — correspondence feel */}
                    <div className="mt-8 pt-6 border-t border-[#d8d2c6]">
                      <div className="honor-label text-[#8a7754] mb-2">Thank the visitor</div>

                      {report.thank_you_message ? (
                        <div>
                          <div className="rounded-xl bg-[#f5e8c7] border border-[#d4b78a] p-4 text-sm text-[#3a434d] honor-quote">
                            “{report.thank_you_message}”
                            <div className="text-[10px] tracking-widest text-[#8a6640] mt-2 not-italic">
                              — YOU SENT THIS ON {report.thank_you_sent_at ? new Date(report.thank_you_sent_at).toLocaleDateString().toUpperCase() : 'RECENTLY'}
                            </div>
                          </div>

                          {report.visitor_reply && (
                            <div className="mt-4 pl-4 border-l-2 border-[#c9b48a] text-sm text-[#3a434d]">
                              <span className="honor-label text-[#8a7754]">Visitor replied</span>
                              <p className="mt-1 honor-quote">“{report.visitor_reply}”</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            placeholder="Thank you for visiting them…"
                            className="w-full rounded-full border border-[#d8d2c6] px-4 py-2.5 text-sm focus:border-[#8a7754]"
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const message = e.currentTarget.value.trim()

                                const { error } = await (supabase
                                  .from('visit_reports') as any)
                                  .update({
                                    thank_you_message: message,
                                    thank_you_sent_at: new Date().toISOString()
                                  })
                                  .eq('id', report.id)

                                if (error) {
                                  alert('Could not send thank you. Please try again.')
                                  return
                                }

                                try {
                                  const { data: visitData } = await supabase
                                    .from('visits')
                                    .select(`
                                      visitor_id,
                                      profiles!visits_visitor_id_fkey (email, full_name)
                                    `)
                                    .eq('grave_request_id', req.id)
                                    .eq('status', 'completed')
                                    .limit(1)
                                    .single()

                                  const visitorEmail = (visitData as any)?.profiles?.email // profiles join is complex; keep minimal cast here

                                  if (visitorEmail) {
                                    await fetch('/api/send-thank-you', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        toEmail: visitorEmail,
                                        deceasedName: req.deceased_full_name,
                                        cemeteryName: req.cemeteries?.name,
                                        thankYouMessage: message,
                                        visitDate: report.visit_date,
                                      }),
                                    })
                                  }
                                } catch (err) {
                                  console.log('Thank you email failed (non-blocking):', err)
                                }

                                loadRequests(user.id)
                              }
                            }}
                          />
                          <div className="text-[10px] tracking-widest text-[#7a838e] mt-1.5 ml-1">
                            PRESS ENTER TO SEND A PRIVATE THANK YOU
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] tracking-widest text-[#7a838e] mt-6 pt-4 border-t border-[#d8d2c6]">
                      DELIVERED {new Date(report.created_at).toLocaleDateString().toUpperCase()}
                    </div>
                  </div>
                ) : req.status === 'fulfilled' ? (
                  <div className="mt-4 text-sm text-[#5c656f]">A report was submitted but could not be loaded.</div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-[#7a838e] mt-8 text-center tracking-widest">
        EARLY VERSION • FULL EMAIL DELIVERY ACTIVE
      </p>
    </div>
  )
}
