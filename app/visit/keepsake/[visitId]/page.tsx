'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { downloadKeepsakePdf } from '@/lib/generate-keepsake-pdf'

export default function KeepsakePage() {
  const params = useParams<{ visitId: string }>()
  const visitId = params.visitId

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadKeepsake() {
      if (!visitId) return

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setCurrentUser(currentUser)

      // Fetch the report (public reports are viewable by anyone)
      const { data, error } = await supabase
        .from('visit_reports')
        .select(`
          id,
          visit_date,
          reflection_text,
          tribute_left,
          photo_urls,
          created_at,
          thank_you_message,
          thank_you_sent_at,
          is_public,
          visits!inner (
            id,
            visitor_id,
            grave_request_id,
            grave_requests (
              requester_id,
              deceased_full_name,
              section,
              grave_number,
              plot_info,
              cemeteries (name)
            )
          )
        `)
        .eq('visit_id', visitId)
        .single()

      if (error || !data) {
        setError('Could not find this keepsake.')
        setLoading(false)
        return
      }

      const visitsData = (data as any).visits
      const isPublic = (data as any).is_public === true
      const isVisitor = currentUser && visitsData?.visitor_id === currentUser.id
      const isRequester = currentUser && visitsData?.grave_requests?.requester_id === currentUser.id

      if (!isPublic && !isVisitor && !isRequester) {
        setError('This keepsake is private.')
        setLoading(false)
        return
      }

      setReport(data)
      setLoading(false)
    }

    loadKeepsake()
  }, [visitId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center">
        <p className="text-[#5c656f]">Loading your keepsake...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#4a5563]">{error || 'Keepsake not found.'}</p>
          <a href="/visit" className="mt-4 inline-block text-sm text-[#5c656f] hover:text-[#1c252f]">Back to visits</a>
        </div>
      </div>
    )
  }

  const deceasedName = report.visits?.grave_requests?.deceased_full_name
  const cemeteryName = report.visits?.grave_requests?.cemeteries?.name

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!report) return

    const visitsData = (report as any).visits
    const graveReq = visitsData?.grave_requests

    const graveLocation = (graveReq?.section || graveReq?.grave_number)
      ? `${graveReq?.section ? 'Section ' + graveReq.section : ''}${graveReq?.grave_number ? ' • Grave ' + graveReq.grave_number : ''}`.trim()
      : undefined

    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `${window.location.origin}/keepsake/${visitId}`
    )}`

    await downloadKeepsakePdf({
      deceasedName: graveReq?.deceased_full_name || 'Unknown',
      cemeteryName: graveReq?.cemeteries?.name || 'Unknown cemetery',
      visitDate: new Date(report.visit_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      reflection: report.reflection_text,
      tributeLeft: report.tribute_left,
      photoUrls: (report.photo_urls || []).map((path: string) => {
        const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)
        return data.publicUrl
      }),
      qrUrl: qrDataUrl,
      graveLocation,
    })
  }

  const togglePublic = async (makePublic: boolean) => {
    if (!report || !currentUser) return

    const visitsData = (report as any).visits
    if (visitsData?.visitor_id !== currentUser.id) {
      alert("Only the visitor who created this keepsake can change its visibility.")
      return
    }

    const { error } = await (supabase.from('visit_reports') as any)
      .update({ is_public: makePublic })
      .eq('id', (report as any).id)

    if (error) {
      alert("Could not update visibility. Please try again.")
    } else {
      // Refresh the page data
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] py-12 px-6 print:py-8 print:px-0 print:bg-white">
      <div className="max-w-[700px] mx-auto">
        {/* Header (hidden when printing) */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <a href="/visit" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to visits</a>
          
          <div className="flex items-center gap-3">
            {/* Publish toggle + public link - only for the original visitor */}
            {currentUser && (report as any)?.visits?.visitor_id === currentUser.id && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[#5c656f]">Public:</span>
                <button
                  onClick={() => togglePublic(!(report as any).is_public)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    (report as any).is_public 
                      ? 'bg-[#4a5c4f] text-white' 
                      : 'border border-[#d8d2c6] hover:bg-[#f9f7f2]'
                  }`}
                >
                  {(report as any).is_public ? 'On' : 'Off'}
                </button>
                {(report as any).is_public && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/keepsake/${visitId}`
                      navigator.clipboard.writeText(url).then(() => alert('Public link copied'))
                    }}
                    className="text-xs underline text-[#5c656f] hover:text-[#1c252f]"
                  >
                    Copy public link
                  </button>
                )}
              </div>
            )}

            <button 
              onClick={handleDownloadPdf}
              className="rounded-full bg-[#1c252f] px-5 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
            >
              Download PDF
            </button>

            <button 
              onClick={() => setShowQR(!showQR)}
              className="rounded-full border border-[#d8d2c6] bg-white px-5 py-2 text-sm font-medium text-[#3a434d] hover:bg-[#f9f7f2] transition-colors"
            >
              QR Code
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="mb-8 print:hidden">
            <div className="honor-card p-6 text-center">
              <div className="honor-label mb-3">Share this keepsake</div>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(window.location.origin + '/keepsake/' + visitId)}`} 
                alt="QR Code for this keepsake"
                className="mx-auto mb-4 border border-[#d8d2c6] p-2 bg-white"
              />
              <p className="text-sm text-[#5c656f] max-w-xs mx-auto">
                Scan to open the full keepsake. Print this QR code and leave it respectfully at the grave.
              </p>
              <button 
                onClick={() => {
                  const url = window.location.origin + '/keepsake/' + visitId
                  navigator.clipboard.writeText(url)
                  alert('Link copied')
                }}
                className="mt-4 text-xs underline text-[#5c656f] hover:text-[#1c252f]"
              >
                Copy link instead
              </button>
            </div>
          </div>
        )}

        {/* Keepsake Content — now using the new reverent palette */}
        <div className="honor-card p-10 print:shadow-none print:border-none print:rounded-none print:p-0">
          <div className="text-center mb-10">
            <div className="inline-block rounded-full bg-[#1c252f] px-4 py-1 text-xs tracking-[2px] text-white mb-4">
              HONORPROXY
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">
              A Visit I Made
            </h1>
            <p className="text-[#5c656f] mt-2">A personal record of remembrance</p>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed">
            <div>
              <div className="honor-label mb-1">For</div>
              <div className="text-2xl font-medium text-[#1c252f]">{deceasedName}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="honor-label mb-1">At</div>
                <div className="font-medium text-[#2a3138]">{cemeteryName}</div>
              </div>
              <div>
                <div className="honor-label mb-1">On</div>
                <div className="font-medium text-[#2a3138]">
                  {new Date(report.visit_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {(report.visits?.grave_requests?.section || report.visits?.grave_requests?.grave_number) && (
              <div>
                <div className="honor-label mb-1">Grave location</div>
                <div className="font-medium text-[#2a3138]">
                  {report.visits?.grave_requests?.section && `Section ${report.visits.grave_requests.section}`}
                  {report.visits?.grave_requests?.grave_number && ` • Grave ${report.visits.grave_requests.grave_number}`}
                </div>
              </div>
            )}

            {report.tribute_left && (
              <div>
                <div className="honor-label mb-1">Tribute Left</div>
                <div className="font-medium text-[#2a3138]">{report.tribute_left}</div>
              </div>
            )}

            <div className="pt-4 border-t border-[#d8d2c6]">
              <div className="honor-label mb-2">What I wrote</div>
              <p className="honor-quote text-[15px]">
                “{report.reflection_text}”
              </p>
            </div>

            {report.thank_you_message && (
              <div className="pt-4 border-t border-[#d8d2c6] bg-[#f5f2eb] -mx-3 px-3 py-4 rounded-2xl">
                <div className="honor-label text-[#7a6e55] mb-2">Thank you from the family</div>
                <p className="honor-quote text-[#3a434d]">
                  “{report.thank_you_message}”
                </p>
              </div>
            )}

            {report.photo_urls && report.photo_urls.length > 0 && (
              <div>
                <div className="honor-label mb-3">Photos from the visit</div>
                <div className="grid grid-cols-2 gap-4">
                  {report.photo_urls.map((path: string, idx: number) => {
                    const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)
                    return (
                      <a key={idx} href={data.publicUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={data.publicUrl} 
                          alt={`Photo ${idx + 1}`} 
                          className="honor-photo w-full aspect-[4/3] object-cover" 
                        />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quiet share action — high emotional leverage for visitors */}
          <div className="mt-10 pt-6 border-t border-[#d8d2c6] print:hidden">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    const name = deceasedName
                    const cemetery = cemeteryName
                    const date = new Date(report.visit_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    const reflection = report.reflection_text
                    const graveLoc = (report.visits?.grave_requests?.section || report.visits?.grave_requests?.grave_number)
                      ? `${report.visits?.grave_requests?.section ? 'Section ' + report.visits.grave_requests.section : ''}${report.visits?.grave_requests?.grave_number ? ' Grave ' + report.visits.grave_requests.grave_number : ''}`.trim()
                      : ''

                    const shareText = `I stood at the grave of ${name} at ${cemetery}${graveLoc ? ' (' + graveLoc + ')' : ''} on ${date} through HonorProxy.\n\n"${reflection}"\n\nIf you have a loved one buried at a national cemetery and cannot visit, a stranger can stand there for you at honorproxy.com.\n\nSmall acts of remembrance matter.`

                    navigator.clipboard.writeText(shareText)
                      .then(() => alert('Note copied. You can paste it anywhere — X, a message to the family, or your own records.'))
                      .catch(() => alert('Could not copy automatically. Here is the text:\n\n' + shareText))
                  }}
                  className="rounded-full border border-[#d8d2c6] bg-white px-6 py-2 text-sm font-medium text-[#3a434d] hover:bg-[#f9f7f2] transition"
                >
                  Copy a quiet note about this visit
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/visit/keepsake/${visitId}`
                    navigator.clipboard.writeText(url)
                      .then(() => alert('Keepsake link copied. You can send this directly to the family.'))
                      .catch(() => alert('Could not copy link. The URL is:\n\n' + url))
                  }}
                  className="rounded-full border border-[#d8d2c6] bg-white px-6 py-2 text-sm font-medium text-[#3a434d] hover:bg-[#f9f7f2] transition"
                >
                  Copy keepsake link
                </button>
              </div>
              <p className="mt-2 text-[10px] tracking-widest text-[#7a838e]">SHARE THE BEAUTIFUL RECORD WITH THE FAMILY</p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[#7a838e]">
            This is your personal record. You may choose to share it publicly if it feels right.
          </p>

          <div className="mt-10 pt-8 border-t border-[#d8d2c6] text-center text-xs tracking-widest text-[#7a838e]">
            A personal record from HonorProxy — standing in for those who cannot be there.
          </div>

          {/* Print-only QR Code – appears automatically when printed or saved as PDF */}
          <div className="hidden print:block mt-8 pt-6 border-t border-[#d8d2c6] text-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent('https://honorproxy.com/keepsake/' + visitId)}`} 
              alt="QR Code"
              className="mx-auto mb-3"
              style={{ width: '110px', height: '110px' }}
            />
            <p className="text-[10px] text-[#555] tracking-wider">
              SCAN TO VIEW THE FULL KEEPSAKE ONLINE
            </p>
          </div>
        </div>

        {/* Print button at bottom (hidden in print) */}
        <div className="mt-8 text-center print:hidden">
          <button 
            onClick={handleDownloadPdf}
            className="rounded-full bg-[#1c252f] px-8 py-3 text-sm font-medium text-white hover:bg-black transition-colors"
          >
            Download PDF
          </button>
          <p className="mt-2 text-[10px] text-[#9ca3af]">
            Choose “Save as PDF” in the print dialog for best results.
          </p>
        </div>
      </div>
    </div>
  )
}
