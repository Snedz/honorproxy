import { Resend } from 'resend'
import { render } from '@react-email/render'
import ThankYouReceivedEmail from '../../../emails/thank-you-received'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      toEmail,
      visitorName,
      deceasedName,
      cemeteryName,
      thankYouMessage,
      visitDate,
    } = body

    if (!toEmail || !thankYouMessage || !deceasedName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Lazily create Resend only when actually sending
    const resend = new Resend(process.env.RESEND_API_KEY)

    const html = await render(
      ThankYouReceivedEmail({
        visitorName,
        deceasedName,
        cemeteryName,
        thankYouMessage,
        visitDate: new Date(visitDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      })
    )

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'HonorProxy <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Thank you from the family of ${deceasedName}`,
      html,
    })

    if (error) {
      console.error('Thank you email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Thank you send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
