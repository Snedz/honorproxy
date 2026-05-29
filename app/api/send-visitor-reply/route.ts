import { Resend } from 'resend'
import { render } from '@react-email/render'
import VisitorRepliedToThankYouEmail from '../../../emails/visitor-replied-to-thank-you'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      toEmail,
      familyName,
      deceasedName,
      cemeteryName,
      originalThankYou,
      visitorReply,
      visitorName,
    } = body

    if (!toEmail || !originalThankYou || !visitorReply || !deceasedName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const html = await render(
      VisitorRepliedToThankYouEmail({
        familyName,
        deceasedName,
        cemeteryName,
        originalThankYou,
        visitorReply,
        visitorName,
      })
    )

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'HonorProxy <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `The visitor replied to your thank you for ${deceasedName}`,
      html,
    })

    if (error) {
      console.error('Visitor reply email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Visitor reply send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
