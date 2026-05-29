'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface OpenRequest {
  id: string
  deceased_full_name: string
  relationship_to_deceased: string | null
  personal_message: string | null
  section: string | null
  grave_number: string | null
  plot_info: string | null
  status: string
  created_at: string
  cemeteries: { name: string; slug: string } | null
}

interface MyVisit {
  id: string
  status: string
  created_at: string
  grave_request_id: string
  grave_requests: {
    deceased_full_name: string
    section: string | null
    grave_number: string | null
    plot_info: string | null
    cemeteries: { name: string; slug: string } | null
  } | null
}

// Local types for joined query results (Supabase joins are hard to type perfectly even with generated types)
type GraveRequestWithCemetery = {
  deceased_full_name: string
  requester_email?: string | null
  cemeteries?: { name: string } | null
}

export default function VisitPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<OpenRequest[]>([])
  const [myVisits, setMyVisits] = useState<MyVisit[]>([])
  const [pastReports, setPastReports] = useState<Record<string, any>>({}) // visitId -> report
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [submittingReportFor, setSubmittingReportFor] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [justCompletedVisitId, setJustCompletedVisitId] = useState<string | null>(null)
  const [justCompletedReport, setJustCompletedReport] = useState<any>(null)

  const [reportForm, setReportForm] = useState({
    visitDate: '',
    reflection: '',
    tribute: '',
    photos: [] as File[]
  })

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await Promise.all([
          loadOpenRequests(),
          loadMyVisits(user.id)
        ])
      }
      setLoading(false)
    }
    init()
  }, [])

  async function loadOpenRequests() {
    const { data, error } = await supabase
      .from('grave_requests')
      .select(`
        id,
        deceased_full_name,
        relationship_to_deceased,
        personal_message,
        section,
        grave_number,
        status,
        created_at,
        cemeteries (name, slug)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (!error && data) setRequests(data as OpenRequest[])
  }

  async function loadMyVisits(userId: string) {
    const { data, error } = await supabase
      .from('visits')
      .select(`
        id,
        status,
        created_at,
        grave_request_id,
        grave_requests (
          deceased_full_name,
          section,
          grave_number,
          plot_info,
          cemeteries (name, slug)
        )
      `)
      .eq('visitor_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) {
      setMyVisits([])
      return
    }

    setMyVisits(data as MyVisit[])

    // Load reports for completed visits
    const completedVisitIds = data
      .filter((v: any) => v.status === 'completed')
      .map((v: any) => v.id)

    if (completedVisitIds.length > 0) {
      const { data: reportsData } = await supabase
        .from('visit_reports')
        .select(`
          id,
          visit_id,
          visit_date,
          reflection_text,
          tribute_left,
          photo_urls,
          created_at,
          thank_you_message,
          thank_you_sent_at,
          grave_requests (
            deceased_full_name,
            requester_email,
            cemeteries (name)
          )
        `)
        .in('visit_id', completedVisitIds)

      if (reportsData) {
        const reportsMap: Record<string, any> = {}
        reportsData.forEach((report: any) => {
          reportsMap[report.visit_id] = report
        })
        setPastReports(reportsMap)
      }
    }
  }

  async function handleClaim(requestId: string) {
    if (!user) return
    setJustCompletedVisitId(null)
    setClaimingId(requestId)
    setMessage(null)

    const { error: updateError } = await (supabase
      .from('grave_requests') as any)
      .update({
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('status', 'open')

    if (updateError) {
      setMessage("Failed to claim: " + updateError.message)
      setClaimingId(null)
      return
    }

    const { error: visitError } = await (supabase.from('visits') as any)
      .insert({
        grave_request_id: requestId,
        visitor_id: user.id,
        status: 'planned'
      })

    if (visitError) {
      setMessage("Claimed, but failed to create visit record: " + visitError.message)
    } else {
      setMessage("Request claimed successfully! You can now prepare for the visit.")
    }

    await Promise.all([loadOpenRequests(), loadMyVisits(user.id)])
    setClaimingId(null)
  }

  function startReport(visitId: string) {
    setJustCompletedVisitId(null)
    setSubmittingReportFor(visitId)
    setReportForm({
      visitDate: new Date().toISOString().split('T')[0],
      reflection: '',
      tribute: '',
      photos: []
    })
    setMessage(null)
  }

  function cancelReport() {
    setSubmittingReportFor(null)
    setReportForm({ visitDate: '', reflection: '', tribute: '', photos: [] })
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setReportForm(prev => ({
        ...prev,
        photos: Array.from(e.target.files!)
      }))
    }
  }

  async function submitReport(visitId: string, graveRequestId: string) {
    if (!user) return
    setMessage(null)

    try {
      // 1. Upload photos
      const photoPaths: string[] = []

      for (const file of reportForm.photos) {
        const filePath = `${user.id}/${visitId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('visit-photos')
          .upload(filePath, file)

        if (uploadError) {
          throw new Error("Photo upload failed: " + uploadError.message)
        }
        photoPaths.push(filePath)
      }

      // 2. Insert report
      const { error: reportError } = await (supabase.from('visit_reports') as any)
        .insert({
          visit_id: visitId,
          grave_request_id: graveRequestId,
          visit_date: reportForm.visitDate,
          reflection_text: reportForm.reflection,
          tribute_left: reportForm.tribute || null,
          photo_urls: photoPaths,
          is_approved: false
        })

      if (reportError) throw reportError

      // 3. Update visit status
      await (supabase.from('visits') as any)
        .update({ status: 'completed' })
        .eq('id', visitId)

      // 4. Update request status to fulfilled
      await (supabase.from('grave_requests') as any)
        .update({ status: 'fulfilled' })
        .eq('id', graveRequestId)

      // 5. Fire off email to the family (non-blocking for MVP)
      try {
        // We now store requester_email directly on the request row for reliability
        const { data: reqData } = await supabase
          .from('grave_requests')
          .select(`
            requester_email,
            deceased_full_name,
            cemeteries (name)
          `)
          .eq('id', graveRequestId)
          .single()

        const typedReq = reqData as GraveRequestWithCemetery | null
        const toEmail = typedReq?.requester_email

        if (toEmail) {
          const emailRes = await fetch('/api/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail,
              deceasedName: typedReq?.deceased_full_name,
              cemeteryName: typedReq?.cemeteries?.name,
              visitDate: reportForm.visitDate,
              reflection: reportForm.reflection,
              tributeLeft: reportForm.tribute,
              photoUrls: photoPaths,
              keepsakeUrl: `/keepsake/${visitId}`,
            }),
          })

          if (!emailRes.ok) {
            console.error('Email send failed:', await emailRes.text())
          } else {
            console.log('Email sent successfully to', toEmail)
          }
        } else {
          console.warn('No requester email found for request', graveRequestId)
        }
      } catch (e) {
        console.log('Email notification failed (non-blocking):', e)
      }

      // Show a rich success state instead of a simple message
      setMessage(null)
      setSubmittingReportFor(null)
      setReportForm({ visitDate: '', reflection: '', tribute: '', photos: [] })

      // Store which visit we just completed for a nice success UI + share feature
      setJustCompletedVisitId(visitId)

      // Fetch the report we just created for sharing
      const { data: newReport } = await supabase
        .from('visit_reports')
        .select(`
          reflection_text,
          visit_date,
          tribute_left,
          grave_requests (
            deceased_full_name,
            cemeteries (name)
          )
        `)
        .eq('visit_id', visitId)
        .single()

      setJustCompletedReport(newReport)

      // Helpful console message for debugging
      console.log('%c[HonorProxy] Report submitted. Check Network tab for /api/send-report call and console for email status.', 'color:#666')

      await loadMyVisits(user.id)
    } catch (err: any) {
      setMessage("Error submitting report: " + err.message)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-[#5c656f]">Loading...</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1c252f]">Sign in to offer visits</h1>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/login" className="rounded-full border border-[#d8d2c6] px-6 py-2.5 text-sm hover:bg-white">Sign in</a>
          <a href="/signup" className="rounded-full bg-[#1c252f] px-6 py-2.5 text-sm text-white">Create account</a>
        </div>
      </div>
    )
  }

  const visitsNeedingReports = myVisits.filter(v => v.status !== 'completed')

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-9">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">Offer to visit</h1>
          <p className="text-[#5c656f] mt-1.5">Claim open requests and deliver a respectful report with photos and reflection.</p>
        </div>
        <a href="/my-requests" className="text-sm text-[#5c656f] hover:text-[#1c252f]">My Requests →</a>
      </div>

      {/* Gentle first-time guidance for brand new visitors */}
      {myVisits.length === 0 && !justCompletedVisitId && requests.length > 0 && (
        <div className="mb-8 rounded-2xl border border-[#d8d2c6] bg-[#f9f7f2] p-6 text-[#3f4a3f]">
          <p className="text-[15px] leading-relaxed">
            Welcome. If a request speaks to you, claim it. When you have visited the grave, return here to share a quiet reflection and photographs.
          </p>
          <p className="mt-2 text-xs tracking-widest text-[#6b7582]">EVERY VISIT MATTERS.</p>
        </div>
      )}

      {/* Success state after submitting a report — calm, reverent keepsake moment */}
      {justCompletedVisitId && (
        <div className="mb-8 rounded-3xl border border-[#d4c9ad] bg-[#f0ede4] p-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e9e4d9]">
            <span className="text-2xl text-[#4a5c4f]">✓</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tighter text-[#2f3a2f]">Thank you for standing in.</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#3f4a3f]">
            Your report, photos, and reflection have been submitted for review.
            Once approved, they will be delivered privately to the family.
            You stood at their grave when they could not. That act of remembrance matters deeply.
          </p>
          <p className="mt-3 text-xs text-[#5c656f]">
            You can view and manage your keepsake in the meantime.
          </p>
          <p className="mt-2 text-xs tracking-widest text-[#6b7582]">
            THE FAMILY MAY SEND YOU A THANK YOU IN THE DAYS AHEAD.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setJustCompletedVisitId(null)
                setJustCompletedReport(null)
              }}
              className="rounded-full border border-[#d4c9ad] bg-white px-6 py-2 text-sm font-medium text-[#3f4a3f] hover:bg-white"
            >
              Close
            </button>
            <a
              href="#past-visits"
              className="rounded-full bg-[#1c252f] px-6 py-2 text-sm font-medium text-white"
            >
              View your past visits
            </a>
            {justCompletedVisitId && (
              <a
                href={`/visit/keepsake/${justCompletedVisitId}`}
                className="rounded-full border border-[#d4c9ad] bg-white px-6 py-2 text-sm font-medium text-[#3f4a3f] hover:bg-[#f9f7f2]"
              >
                View keepsake
              </a>
            )}
          </div>

          {/* Share message */}
          {justCompletedReport && (
            <div className="mt-8 border-t border-[#d4c9ad] pt-6">
              <div className="text-sm text-[#3f4a3f] mb-3">Help others discover this quiet service.</div>
              <button
                onClick={() => {
                  const name = justCompletedReport.grave_requests?.deceased_full_name
                  const cemetery = justCompletedReport.grave_requests?.cemeteries?.name
                  const reflection = justCompletedReport.reflection_text
                  const date = new Date(justCompletedReport.visit_date).toLocaleDateString()

                  const shareText = `Today I visited ${name} at ${cemetery} through HonorProxy on behalf of their family.\n\nHere's what I wrote:\n\n"${reflection}"\n\nIf you have someone buried there who you can't visit, you can request a visit at honorproxy.com.\n\nSmall acts of remembrance matter.`

                  navigator.clipboard.writeText(shareText)
                    .then(() => alert('Message copied. You can paste it on X, Instagram, or Facebook.'))
                    .catch(() => alert('Could not copy. Here is the text:\n\n' + shareText))
                }}
                className="rounded-full border border-[#d4c9ad] bg-white px-6 py-2 text-sm font-medium text-[#3f4a3f] hover:bg-[#f9f7f2]"
              >
                Copy shareable message
              </button>
              <p className="text-[10px] tracking-widest text-[#6b7582] mt-2">FOR X, FACEBOOK, OR INSTAGRAM</p>
            </div>
          )}
        </div>
      )}

      {message && !justCompletedVisitId && (
        <div className="mb-8 rounded-2xl border border-[#d8d2c6] bg-[#f9f7f2] p-7">
          <div className="font-medium text-[#1c252f] tracking-tight mb-2">
            Request claimed successfully.
          </div>
          <p className="text-[#3f4a3f] text-[15px] leading-relaxed">
            Thank you. You have taken this remembrance on. When you are ready to visit, you can return here to prepare your report.
          </p>
          <p className="mt-3 text-xs tracking-widest text-[#6b7582]">
            THE FAMILY WILL RECEIVE YOUR WORDS AND PHOTOS AFTER HUMAN REVIEW.
          </p>
        </div>
      )}

      {/* Your claimed visits — show gentle empty state when none are pending */}
      {visitsNeedingReports.length === 0 && myVisits.length > 0 && (
        <div className="mb-12">
          <div className="mb-4">
            <div className="honor-label">Ready to fulfill</div>
            <h2 className="text-2xl font-semibold tracking-tight">Your claimed visits</h2>
          </div>
          <div className="honor-card p-8 text-center text-[#5c656f]">
            You have no visits awaiting a report right now. When you claim a request, it will appear here.
          </div>
        </div>
      )}

      {/* Visits needing reports — elevated submission experience */}
      {visitsNeedingReports.length > 0 && (
        <div className="mb-12">
          <div className="mb-4">
            <div className="honor-label">Ready to fulfill</div>
            <h2 className="text-2xl font-semibold tracking-tight">Your claimed visits</h2>
            <p className="text-sm text-[#5c656f] mt-1 max-w-prose">
              These are the requests you have taken on. Prepare with care and return when you are ready.
            </p>
          </div>

          <div className="space-y-4">
            {visitsNeedingReports.map((visit) => {
              const isSubmitting = submittingReportFor === visit.id

              return (
                <div key={visit.id} className="honor-card p-6">
                  <div className="font-semibold text-xl tracking-tight text-[#1c252f]">
                    {visit.grave_requests?.deceased_full_name}
                  </div>
                  <div className="text-sm text-[#5c656f] mt-0.5">
                    {visit.grave_requests?.cemeteries?.name}
                  </div>

                  {(visit.grave_requests?.section || visit.grave_requests?.grave_number) && (
                    <div className="mt-1.5 text-xs text-[#3a434d]">
                      {visit.grave_requests?.section && <>Section {visit.grave_requests.section} </>}
                      {visit.grave_requests?.grave_number && <>• Grave {visit.grave_requests.grave_number}</>}
                    </div>
                  )}

                  {!isSubmitting ? (
                    <>
                      <div className="mt-3 text-xs">
                        <a
                          href={
                            visit.grave_requests?.cemeteries?.slug === 'arlington'
                              ? 'https://ancexplorer.army.mil/publicwmv/index.html#/arlington-national/'
                              : 'https://gravelocator.cem.va.gov/'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-[#d8d2c6] bg-white px-3 py-1 text-[#3a434d] hover:bg-[#f9f7f2] transition"
                        >
                          Open official grave locator ↗
                        </a>
                        <span className="ml-2 text-[#7a838e]">Use Section + Grave above</span>
                      </div>

                      <button
                        onClick={() => startReport(visit.id)}
                        className="mt-5 rounded-full bg-[#1c252f] px-6 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
                      >
                        Submit Visit Report
                      </button>
                    </>
                  ) : (
                    <div className="mt-6 space-y-5 border-t border-[#d8d2c6] pt-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block honor-label mb-1.5">Date of visit</label>
                          <input
                            type="date"
                            value={reportForm.visitDate}
                            onChange={(e) => setReportForm({ ...reportForm, visitDate: e.target.value })}
                            className="w-full rounded-xl border px-4 py-2.5"
                          />
                        </div>
                        <div>
                          <label className="block honor-label mb-1.5">Tribute left (optional)</label>
                          <input
                            type="text"
                            value={reportForm.tribute}
                            onChange={(e) => setReportForm({ ...reportForm, tribute: e.target.value })}
                            className="w-full rounded-xl border px-4 py-2.5"
                            placeholder="Small flag, white rose, etc."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block honor-label mb-1.5">Your reflection — what you felt, saw, or said</label>
                        <textarea
                          value={reportForm.reflection}
                          onChange={(e) => setReportForm({ ...reportForm, reflection: e.target.value })}
                          rows={6}
                          className="w-full rounded-xl border px-4 py-3 honor-quote"
                          placeholder="I stood quietly at the grave for several minutes. The light was soft through the trees..."
                          required
                        />
                        <p className="text-xs text-[#7a838e] mt-1.5">A few heartfelt sentences are enough. Keep it personal and true.</p>
                      </div>

                      <div>
                        <label className="block honor-label mb-1.5">Photos from the visit (recommended)</label>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1c252f] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
                        />
                        {reportForm.photos.length > 0 && (
                          <div className="text-xs text-[#5c656f] mt-1.5">{reportForm.photos.length} photo(s) selected</div>
                        )}
                      </div>

                      <p className="text-xs text-[#7a838e] mb-2">
                        Your report will be reviewed by a human before it is delivered, to ensure it carries the quiet respect this remembrance deserves.
                      </p>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => submitReport(visit.id, visit.grave_request_id)}
                          className="rounded-full bg-[#1c252f] px-7 py-2.5 text-sm font-medium text-white"
                        >
                          Deliver Report to Family
                        </button>
                        <button
                          onClick={cancelReport}
                          className="rounded-full border border-[#d8d2c6] px-7 py-2.5 text-sm hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Open Requests to Claim — elevated, respectful presentation */}
      <div className="mt-10">
        <div className="honor-label mb-2">Available now</div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Open requests to claim</h2>
        <p className="text-sm text-[#5c656f] -mt-2 mb-4 max-w-prose">
          These are requests from families waiting for someone to stand in their place with quiet respect.
        </p>

        {requests.length === 0 ? (
          <div className="honor-card p-10 text-center text-[#5c656f]">
            No open requests at the moment. Please check back soon.<br />
            The families who need this most are counting on quiet acts of care like yours.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="honor-card p-6">
                <div className="flex flex-col md:flex-row gap-5 md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-xl tracking-tight text-[#1c252f]">{req.deceased_full_name}</div>
                    {req.relationship_to_deceased && <div className="text-sm text-[#5c656f] mt-0.5">{req.relationship_to_deceased}</div>}

                    <div className="mt-1.5 text-sm text-[#5c656f]">{req.cemeteries?.name}</div>

                    {(req.section || req.grave_number || req.plot_info) && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f8f6f1] border border-[#e2d9c9] px-3 py-0.5 text-xs font-medium text-[#3a434d]">
                        {req.section && <span>Section {req.section}</span>}
                        {req.grave_number && <span>Grave {req.grave_number}</span>}
                        {req.plot_info && <span>{req.plot_info}</span>}
                      </div>
                    )}

                    {req.personal_message && (
                      <div className="mt-4 border-l-2 border-[#d8d2c6] pl-4 text-[#3a434d] honor-quote text-[15px]">
                        “{req.personal_message}”
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleClaim(req.id)}
                    disabled={claimingId === req.id}
                    className="mt-2 md:mt-0 shrink-0 rounded-full bg-[#1c252f] px-7 py-2.5 text-sm font-medium text-white disabled:opacity-60 hover:bg-black transition-colors"
                  >
                    {claimingId === req.id ? "Claiming..." : "Claim this request"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Past Visits — elevated keepsake cards with correspondence feel */}
      <div id="past-visits" className="mt-14">
        <div className="mb-4">
          <div className="honor-label">Your record of service</div>
          <h2 className="text-2xl font-semibold tracking-tight">Past visits</h2>
          <p className="text-sm text-[#5c656f] mt-1 max-w-prose">
            Each of these visits carries a quiet promise kept. Thank you for the care you have shown.
          </p>
        </div>

        {myVisits.filter(v => v.status === 'completed').length === 0 ? (
          <div className="honor-card p-9 text-center text-[#5c656f]">
            You haven’t completed any visits yet.
          </div>
        ) : (
          <div className="space-y-6">
            {myVisits
              .filter((v) => v.status === 'completed')
              .map((visit) => {
                const report = pastReports[visit.id]

                return (
                  <div key={visit.id} className="honor-card p-7">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div>
                        <div className="font-semibold text-xl tracking-tight text-[#1c252f]">
                          {visit.grave_requests?.deceased_full_name}
                        </div>
                        <div className="text-sm text-[#5c656f]">
                          {visit.grave_requests?.cemeteries?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start">
                        <div className="text-xs px-3 py-1 rounded-full bg-[#e9e4d9] text-[#3f4a3f] font-medium">
                          Fulfilled
                        </div>
                        <a 
                          href={`/visit/keepsake/${visit.id}`}
                          className="text-xs px-3 py-1 rounded-full border border-[#d8d2c6] hover:bg-[#f9f7f2] transition"
                        >
                          Keepsake
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            const url = `${window.location.origin}/visit/keepsake/${visit.id}`
                            navigator.clipboard.writeText(url)
                              .then(() => alert('Keepsake link copied'))
                              .catch(() => alert('Link: ' + url))
                          }}
                          className="text-xs px-3 py-1 rounded-full border border-[#d8d2c6] hover:bg-[#f9f7f2] transition"
                        >
                          Copy link
                        </button>
                      </div>
                    </div>

                    {report ? (
                      <>
                        <div className="text-sm text-[#5c656f] mb-1">
                          Visited {new Date(report.visit_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        {report.tribute_left && (
                          <div className="text-sm mb-4 text-[#3a434d]">
                            Tribute left: <span className="font-medium">{report.tribute_left}</span>
                          </div>
                        )}

                        <div className="border-l-2 border-[#d8d2c6] pl-4 mb-5">
                          <p className="honor-quote text-[15px]">“{report.reflection_text}”</p>
                        </div>

                        {report.photo_urls && report.photo_urls.length > 0 && (
                          <div className="mt-5">
                            <div className="honor-label mb-2.5">Photos from the visit</div>
                            <div className="flex flex-wrap gap-3">
                              {report.photo_urls.map((path: string, idx: number) => {
                                const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)
                                return (
                                  <a key={idx} href={data.publicUrl} target="_blank" rel="noopener noreferrer">
                                    <img 
                                      src={data.publicUrl} 
                                      alt={`Photo ${idx + 1}`} 
                                      className="w-24 h-24 object-cover honor-photo" 
                                    />
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Thank you correspondence — bidirectional, warm */}
                        {report.thank_you_message && (
                          <div className="mt-7 pt-6 border-t border-[#d8d2c6]">
                            <div className="honor-label text-[#8a7754] mb-2">Thank you from the family</div>
                            <p className="honor-quote text-[15px] text-[#2a3138] mb-4">
                              “{report.thank_you_message}”
                            </p>

                            {report.visitor_reply ? (
                              <div className="pl-4 border-l-2 border-[#c9b48a]">
                                <div className="honor-label text-[#8a7754] mb-1">Your reply</div>
                                <p className="text-[#3a434d]">{report.visitor_reply}</p>
                              </div>
                            ) : (
                              <div className="pt-3 border-t border-[#d8d2c6]">
                                <input
                                  type="text"
                                  placeholder="Reply to their thank you (optional)…"
                                  className="w-full rounded-full border border-[#d8d2c6] bg-white px-4 py-2.5 text-sm focus:border-[#8a7754]"
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                      const reply = e.currentTarget.value.trim()
                                      const { error } = await (supabase.from('visit_reports') as any)
                                        .update({
                                          visitor_reply: reply,
                                          visitor_reply_sent_at: new Date().toISOString()
                                        })
                                        .eq('id', report.id)

                                      if (!error) {
                                        loadMyVisits(user.id)
                                        try {
                                          const familyEmail = report.grave_requests?.requester_email
                                          if (familyEmail) {
                                            await fetch('/api/send-visitor-reply', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                toEmail: familyEmail,
                                                deceasedName: report.grave_requests?.deceased_full_name,
                                                cemeteryName: report.grave_requests?.cemeteries?.name,
                                                originalThankYou: report.thank_you_message,
                                                visitorReply: reply,
                                              }),
                                            })
                                          }
                                        } catch (err) {
                                          console.log('Reply email failed (non-blocking):', err)
                                        }
                                      } else {
                                        alert('Could not save reply.')
                                      }
                                    }
                                  }}
                                />
                                <div className="text-[10px] tracking-widest text-[#8a7754] mt-1.5 ml-1">
                                  PRESS ENTER TO REPLY
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-[#5c656f] italic">Report details not available.</div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <div className="mt-12 text-xs tracking-widest text-[#7a838e]">
        All visits must be conducted with the utmost respect. Photos and messages will be delivered privately to the family.
      </div>
    </div>
  )
}
