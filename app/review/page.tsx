'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Safe pure helper (no client instantiation at module or render time)
function getPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || ''
  return `${base}/storage/v1/object/public/visit-photos/${encodeURIComponent(path)}`
}

interface PendingReport {
  id: string
  visit_id: string
  visit_date: string
  reflection_text: string
  tribute_left: string | null
  photo_urls: string[] | null
  moderation_notes?: string | null
  rejected_at?: string | null
  grave_requests: {
    deceased_full_name: string
    requester_email: string | null
    cemeteries: { name: string } | null
    section: string | null
    grave_number: string | null
    plot_info: string | null
  } | null
}

export default function ReviewQueuePage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<PendingReport[]>([])
  const [rejectedReports, setRejectedReports] = useState<PendingReport[]>([])
  const [showRejected, setShowRejected] = useState(false)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  // Local moderator notes per report (captured for this review session)
  const [moderatorNotes, setModeratorNotes] = useState<Record<string, string>>({})

  // Client created only after mount inside effects/handlers. Safe for static prerender.

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await Promise.all([
          loadPendingReports(supabase),
          loadRejectedCount(supabase),
        ])
      }
      setLoading(false)
    }
    init()
  }, [])

  async function loadPendingReports(supabase?: ReturnType<typeof createClient>) {
    const client = supabase || createClient()
    const { data } = await client
      .from('visit_reports')
      .select(`
        id,
        visit_id,
        visit_date,
        reflection_text,
        tribute_left,
        photo_urls,
        grave_requests (
          deceased_full_name,
          requester_email,
          section,
          grave_number,
          plot_info,
          cemeteries (name)
        )
      `)
      .eq('is_approved', false)
      .is('rejected_at', null)
      .order('created_at', { ascending: true })

    if (data) {
      setReports(data as any)
    }
  }

  async function loadRejectedReports(supabase?: ReturnType<typeof createClient>) {
    const client = supabase || createClient()
    const { data } = await client
      .from('visit_reports')
      .select(`
        id,
        visit_id,
        visit_date,
        reflection_text,
        tribute_left,
        photo_urls,
        moderation_notes,
        rejected_at,
        grave_requests (
          deceased_full_name,
          requester_email,
          section,
          grave_number,
          plot_info,
          cemeteries (name)
        )
      `)
      .not('rejected_at', 'is', null)
      .order('rejected_at', { ascending: false })
      .limit(50)

    if (data) {
      setRejectedReports(data as any)
    }
  }

  async function loadRejectedCount(supabase?: ReturnType<typeof createClient>) {
    const client = supabase || createClient()
    const { count } = await client
      .from('visit_reports')
      .select('*', { count: 'exact', head: true })
      .not('rejected_at', 'is', null)

    setRejectedCount(count || 0)
  }

  function setNote(reportId: string, note: string) {
    setModeratorNotes(prev => ({ ...prev, [reportId]: note }))
  }

  async function approveReport(report: PendingReport) {
    setProcessingId(report.id)
    const client = createClient()

    try {
      const note = moderatorNotes[report.id] || ''

      // Mark approved + record moderator + optional free-text note for our records
      const { error: updateError } = await (client.from('visit_reports') as any)
        .update({
          is_approved: true,
          moderated_by: user?.id || null,
          moderated_at: new Date().toISOString(),
          moderation_notes: note || null,
        })
        .eq('id', report.id)

      if (updateError) throw updateError

      // Send the report email to the family
      if (report.grave_requests?.requester_email) {
        const photoUrls = (report.photo_urls || []).map((path: string) => getPublicUrl(path))

        await fetch('/api/send-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: report.grave_requests.requester_email,
            deceasedName: report.grave_requests.deceased_full_name,
            cemeteryName: report.grave_requests.cemeteries?.name,
            visitDate: report.visit_date,
            reflection: report.reflection_text,
            tributeLeft: report.tribute_left,
            photoUrls,
            keepsakeUrl: `/keepsake/${report.visit_id}`,
          }),
        })
      }

      const noteText = note ? ` Moderator note stored with the record: “${note}”` : ''
      setFeedback({ type: 'success', text: `Report approved and sent to the family.${noteText}` })
      // Clear the note for this item
      setModeratorNotes(prev => { const next = { ...prev }; delete next[report.id]; return next })
      await loadPendingReports()
    } catch (e: any) {
      setFeedback({ type: 'error', text: 'Error approving report: ' + e.message })
    } finally {
      setProcessingId(null)
    }
  }

  async function rejectReport(reportId: string) {
    const note = moderatorNotes[reportId] || ''
    const confirmMsg = note
      ? `Reject this report?\n\nModerator note will be stored with the record: “${note}”`
      : 'Are you sure you want to reject this report?'

    if (!confirm(confirmMsg)) return

    setProcessingId(reportId)

    try {
      const client = createClient()
      // Soft reject: keep the report for the record but mark it rejected so it no longer appears in the active queue.
      // This preserves moderator notes and creates a clean audit trail.
      const { error } = await (client.from('visit_reports') as any)
        .update({
          rejected_at: new Date().toISOString(),
          moderated_by: user?.id || null,
          moderated_at: new Date().toISOString(),
          moderation_notes: note || null,
        })
        .eq('id', reportId)

      if (error) throw error

      const noteText = note ? ` Moderator note stored with the record: “${note}”` : ''
      setFeedback({ type: 'success', text: `Report rejected.${noteText}` })
      setModeratorNotes(prev => { const next = { ...prev }; delete next[reportId]; return next })
      await Promise.all([loadPendingReports(), loadRejectedCount()])
    } catch (e: any) {
      setFeedback({ type: 'error', text: 'Error rejecting report: ' + e.message })
    } finally {
      setProcessingId(null)
    }
  }

  async function restoreReport(reportId: string) {
    if (!confirm('Restore this report to the active review queue?')) return

    setProcessingId(reportId)

    try {
      const client = createClient()
      const { error } = await (client.from('visit_reports') as any)
        .update({
          rejected_at: null,
          // Keep the previous moderated_by/at and notes for the historical record
        })
        .eq('id', reportId)

      if (error) throw error

      setFeedback({ type: 'success', text: 'Report restored to the pending queue.' })
      // Refresh both lists and count
      await Promise.all([
        loadPendingReports(),
        loadRejectedCount(),
        showRejected ? loadRejectedReports() : Promise.resolve(),
      ])
    } catch (e: any) {
      setFeedback({ type: 'error', text: 'Error restoring report: ' + e.message })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-16 text-[#5c656f]">Loading review queue...</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1c252f]">Sign in to review reports</h1>
        <div className="mt-6">
          <a href="/login" className="rounded-full bg-[#1c252f] px-6 py-2.5 text-sm text-white">Sign in</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">Review Queue</h1>
        <p className="text-[#5c656f] mt-1.5">Human review before any family receives a visit report. Quiet care at this step protects trust.</p>
        <p className="mt-1 text-sm text-[#5c656f] max-w-prose">
          You are the quiet gatekeeper. Every decision here protects the dignity of remembrance.
        </p>
        {rejectedCount > 0 && (
          <div className="mt-2 inline-block rounded-full border border-[#d8d2c6] bg-white px-3 py-0.5 text-xs text-[#5c656f]">
            {rejectedCount} rejected
          </div>
        )}
      </div>

      {/* Feedback banner — replaces crude alerts with calm, in-page messaging */}
      {feedback && (
        <div
          className={`mb-6 rounded-xl border px-5 py-4 text-sm flex items-start justify-between gap-4 ${
            feedback.type === 'success'
              ? 'border-[#c9b48a] bg-[#f9f7f2] text-[#2a3138]'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div>{feedback.text}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="honor-card p-12 text-center">
          <p className="text-[#5c656f]">No reports waiting for review. Good work.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reports.map((report) => {
            const currentNote = moderatorNotes[report.id] || ''
            const loc = report.grave_requests
            const graveLocation = [loc?.section, loc?.grave_number].filter(Boolean).join(', ')
            const fullLocation = graveLocation
              ? `${graveLocation}${loc?.plot_info ? ` (${loc.plot_info})` : ''}`
              : null

            return (
              <div key={report.id} className="honor-card p-7">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div>
                    <div className="font-semibold text-xl tracking-tight text-[#1c252f]">
                      {report.grave_requests?.deceased_full_name}
                    </div>
                    <div className="text-sm text-[#5c656f] mt-0.5">
                      {report.grave_requests?.cemeteries?.name} • {new Date(report.visit_date).toLocaleDateString()}
                    </div>
                    {fullLocation && (
                      <div className="text-xs text-[#8a7754] mt-1 tracking-tight">
                        Grave location: {fullLocation}
                      </div>
                    )}
                    <a
                      href={`/visit/keepsake/${report.visit_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-[#5c656f] underline hover:text-[#1c252f] tracking-tight"
                    >
                      View full keepsake draft →
                    </a>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveReport(report)}
                      disabled={processingId === report.id}
                      className="rounded-full bg-[#1c252f] px-5 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-black transition"
                    >
                      {processingId === report.id ? 'Processing...' : 'Approve & Send'}
                    </button>
                    <button
                      onClick={() => rejectReport(report.id)}
                      disabled={processingId === report.id}
                      className="rounded-full border border-[#d8d2c6] px-5 py-1.5 text-xs hover:bg-[#f9f7f2] disabled:opacity-50 transition"
                    >
                      {currentNote ? 'Reject (with note)' : 'Reject'}
                    </button>
                  </div>
                </div>

                <div className="border-l-3 border-[#d8d2c6] pl-4 mb-5">
                  <p className="honor-quote text-[15px] text-[#2a3138]">
                    “{report.reflection_text}”
                  </p>
                </div>

                {report.tribute_left && (
                  <div className="text-sm mb-4 text-[#3a434d]">
                    Tribute left: <span className="font-medium text-[#1c252f]">{report.tribute_left}</span>
                  </div>
                )}

                {/* Moderator notes — captured locally for this review session */}
                <div className="mb-5">
                  <label className="block text-[10px] tracking-[1.5px] text-[#5c656f] mb-1.5">
                    MODERATOR NOTES (OPTIONAL — FOR OUR RECORDS)
                  </label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setNote(report.id, e.target.value)}
                    placeholder="Any context, concerns, or observations before approving or rejecting…"
                    className="w-full min-h-[72px] rounded-xl border border-[#e2d9c9] bg-white px-4 py-3 text-sm text-[#2a3138] placeholder:text-[#8a8380] focus:outline-none focus:border-[#c9b48a]"
                    disabled={processingId === report.id}
                  />
                  <p className="text-[10px] text-[#8a8380] mt-1">Notes are stored with the record on both approve and reject. Rejected reports can be reviewed and restored from the audit section below.</p>
                </div>

                {report.photo_urls && report.photo_urls.length > 0 && (
                  <div>
                    <div className="text-[10px] tracking-[1.5px] text-[#5c656f] mb-2">PHOTOS FROM THE VISIT</div>
                    <div className="flex flex-wrap gap-3">
                      {report.photo_urls.map((path, idx) => {
                        const url = getPublicUrl(path)
                        return (
                          <a href={url} target="_blank" rel="noopener noreferrer" key={idx}>
                            <img 
                              src={url} 
                              alt="" 
                              className="w-24 h-24 object-cover honor-photo rounded border border-[#e2d9c9] hover:border-[#c9b48a] transition" 
                            />
                          </a>
                        )
                      })}
                    </div>
                    <div className="text-[10px] text-[#8a8380] mt-1.5">{report.photo_urls.length} photo{report.photo_urls.length > 1 ? 's' : ''} • click to open full size</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Rejected reports – minimal audit view */}
      <div className="mt-16 border-t border-[#d8d2c6] pt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[2px] text-[#5c656f]">AUDIT RECORD</div>
            <div className="font-medium text-[#1c252f]">Rejected reports</div>
          </div>
          <button
            onClick={async () => {
              const next = !showRejected
              setShowRejected(next)
              if (next && rejectedReports.length === 0) {
                await loadRejectedReports()
              }
            }}
            className="text-sm text-[#5c656f] underline hover:text-[#1c252f]"
          >
            {showRejected ? 'Hide rejected reports' : 'Show rejected reports'}
          </button>
        </div>

        {showRejected && (
          <>
            {rejectedReports.length === 0 ? (
              <div className="honor-card p-8 text-center text-[#5c656f]">
                No rejected reports yet.
              </div>
            ) : (
              <div className="space-y-6">
                {rejectedReports.map((report) => {
                  const loc = report.grave_requests
                  const graveLocation = [loc?.section, loc?.grave_number].filter(Boolean).join(', ')
                  const fullLocation = graveLocation
                    ? `${graveLocation}${loc?.plot_info ? ` (${loc.plot_info})` : ''}`
                    : null

                  return (
                    <div key={report.id} className="honor-card p-6 opacity-90">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <div className="font-medium text-[#1c252f]">
                            {report.grave_requests?.deceased_full_name}
                          </div>
                          <div className="text-sm text-[#5c656f]">
                            {report.grave_requests?.cemeteries?.name} • {new Date(report.visit_date).toLocaleDateString()}
                          </div>
                          {fullLocation && (
                            <div className="text-xs text-[#8a7754] mt-0.5">{fullLocation}</div>
                          )}
                          {report.rejected_at && (
                            <div className="text-xs text-[#8a7754] mt-1">
                              Rejected {new Date(report.rejected_at).toLocaleDateString()}
                            </div>
                          )}
                          <a
                            href={`/visit/keepsake/${report.visit_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-[#5c656f] underline hover:text-[#1c252f] tracking-tight"
                          >
                            View full keepsake →
                          </a>
                        </div>
                        <button
                          onClick={() => restoreReport(report.id)}
                          disabled={processingId === report.id}
                          className="rounded-full border border-[#d8d2c6] px-4 py-1 text-xs hover:bg-[#f9f7f2] disabled:opacity-50"
                        >
                          {processingId === report.id ? 'Restoring…' : 'Restore to queue'}
                        </button>
                      </div>

                      {report.moderation_notes && (
                        <div className="text-sm border-l-3 border-[#d8d2c6] pl-4 text-[#3a434d]">
                          <span className="font-medium text-[#5c656f]">Moderator note:</span> “{report.moderation_notes}”
                        </div>
                      )}

                      <div className="mt-3 text-xs text-[#8a7754]">
                        Reflection excerpt: {report.reflection_text.substring(0, 140)}{report.reflection_text.length > 140 ? '…' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10 text-xs text-[#5c656f] text-center max-w-md mx-auto">
        This is a deliberate human gate. Every approved report carries someone’s quiet presence to a family who could not be there.
      </div>
    </div>
  )
}
