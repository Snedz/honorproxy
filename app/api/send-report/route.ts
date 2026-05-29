import { Resend } from 'resend'
import { render } from '@react-email/render'
import VisitReportEmail from '../../../emails/visit-report'
import { NextResponse } from 'next/server'

// Helper to build Supabase public Storage URLs without instantiating a client.
// This avoids top-level module evaluation that fails during `next build`
// when environment variables are not yet present in the build context.
function getSupabasePublicUrl(bucket: string, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || ''
  // Supabase public URL pattern: {project}/storage/v1/object/public/{bucket}/{path}
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      toEmail,
      deceasedName,
      cemeteryName,
      visitDate,
      reflection,
      tributeLeft,
      photoUrls = [],
      keepsakeUrl,
    } = body

    if (!toEmail || !deceasedName || !reflection) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Lazily create Resend only when actually sending (safe if key missing at build time)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Use public URLs (recommended for email compatibility)
    // Make sure the 'visit-photos' bucket is set to Public in Supabase Storage
    let emailPhotoUrls: string[] = []
    if (photoUrls && photoUrls.length > 0) {
      emailPhotoUrls = photoUrls.map((path: string) => getSupabasePublicUrl('visit-photos', path))
    }

    // Render the beautiful React Email template
    const html = await render(
      VisitReportEmail({
        deceasedName,
        cemeteryName,
        visitDate,
        reflection,
        tributeLeft,
        photoUrls: emailPhotoUrls,
        keepsakeUrl,
      })
    )

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'HonorProxy <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `A visit was made for ${deceasedName}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
