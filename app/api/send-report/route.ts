import { Resend } from 'resend'
import { render } from '@react-email/render'
import VisitReportEmail from '../../../emails/visit-report'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    // Use public URLs (recommended for email compatibility)
    // Make sure the 'visit-photos' bucket is set to Public in Supabase Storage
    let emailPhotoUrls: string[] = []
    if (photoUrls && photoUrls.length > 0) {
      emailPhotoUrls = photoUrls.map((path: string) => {
        const { data } = supabase.storage
          .from('visit-photos')
          .getPublicUrl(path)
        return data.publicUrl
      })
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
