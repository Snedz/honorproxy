'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { downloadKeepsakePdf } from '@/lib/generate-keepsake-pdf'

export default function KeepsakeViewer() {
  const params = useParams<{ visitId: string }>()
  const visitId = params.visitId

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadPublicKeepsake() {
      if (!visitId) return

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
          visits!inner (
            id,
            grave_request_id,
            grave_requests (
              deceased_full_name,
              section,
              grave_number,
              plot_info,
              cemeteries (name)
            )
          )
        `)
        .eq('visit_id', visitId)
        .eq('is_public', true)
        .single()

      if (error || !data) {
        setError('This keepsake is not available publicly or does not exist.')
        setLoading(false)
        return
      }

      setReport(data)
      setLoading(false)
    }

    loadPublicKeepsake()
  }, [visitId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center">
        <p className="text-[#5c656f]">Loading keepsake...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-[#4a5563]">{error || 'Keepsake not found.'}</p>
          <a href="/" className="mt-6 inline-block text-sm text-[#5c656f] hover:text-[#1c252f]">Return to HonorProxy</a>
        </div>
      </div>
    )
  }

  const deceasedName = report.visits?.grave_requests?.deceased_full_name
  const cemeteryName = report.visits?.grave_requests?.cemeteries?.name

  return (
    <div className="min-h-screen bg-[#f8f6f1] py-12 px-6 print:py-8 print:px-0 print:bg-white">
      <div className="max-w-[700px] mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">HonorProxy</a>
          <div className="flex items-center gap-3">
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

        {showQR && (
          <div className="mb-8 print:hidden">
            <div className="honor-card p-6 text-center">
              <div className="honor-label mb-3">Share this remembrance</div>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(window.location.origin + '/keepsake/' + visitId)}`} 
                alt="QR Code"
                className="mx-auto mb-4 border border-[#d8d2c6] p-2 bg-white"
              />
              <p className="text-sm text-[#5c656f] max-w-xs mx-auto">
                Print or share this code to let others view the full keepsake.
              </p>
            </div>
          </div>
        )}

        <div className="honor-card p-10 print:shadow-none print:border-none print:rounded-none print:p-0">
          <div className="text-center mb-10">
            <div className="inline-block rounded-full bg-[#1c252f] px-4 py-1 text-xs tracking-[2px] text-white mb-4">
              HONORPROXY
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">
              A Visit Made in Remembrance
            </h1>
            <p className="text-[#5c656f] mt-2">A personal record left at the grave</p>
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
              <div className="honor-label mb-2">What the visitor wrote</div>
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

            <p className="mt-4 text-center text-xs text-[#7a838e]">
              This remembrance is shared with permission.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-[#d8d2c6] text-center text-xs tracking-widest text-[#7a838e]">
            A quiet act of remembrance through HonorProxy
          </div>

          {/* Print-only QR Code */}
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

        <div className="mt-8 text-center print:hidden">
          <button 
            onClick={handleDownloadPdf}
            className="rounded-full bg-[#1c252f] px-8 py-3 text-sm font-medium text-white hover:bg-black transition-colors"
          >
            Download PDF
          </button>
          <p className="mt-3 text-[11px] text-[#7a838e] tracking-widest">
            This record was left with care at the grave.
          </p>
          <p className="mt-1 text-[10px] text-[#9ca3af]">
            Choose “Save as PDF” in the print dialog for best results.
          </p>
        </div>
      </div>
    </div>
  )
}