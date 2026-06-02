import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface VisitorRepliedToThankYouEmailProps {
  familyName?: string;
  deceasedName: string;
  cemeteryName: string;
  originalThankYou: string;
  visitorReply: string;
  visitorName?: string;
}

export default function VisitorRepliedToThankYouEmail({
  familyName,
  deceasedName,
  cemeteryName,
  originalThankYou,
  visitorReply,
  visitorName,
}: VisitorRepliedToThankYouEmailProps) {
  const previewText = `The visitor replied to your thank you for ${deceasedName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f8f7f4] font-sans">
          <Container className="mx-auto max-w-[620px] px-5 py-8">
            <Section className="mb-6 text-center">
              <div style={{ 
                display: 'inline-block', 
                background: '#111', 
                color: '#fff', 
                padding: '6px 14px', 
                borderRadius: '9999px',
                fontSize: '11px',
                letterSpacing: '1.5px',
                fontWeight: 500
              }}>
                HONORPROXY
              </div>
            </Section>

            <Section className="mb-8">
              <Text style={{ 
                fontSize: '24px', 
                lineHeight: '1.2', 
                fontWeight: 600, 
                color: '#222',
                margin: '0 0 12px'
              }}>
                The visitor replied to your thank you
              </Text>
              <Text style={{ 
                fontSize: '16px', 
                color: '#555', 
                lineHeight: '1.5'
              }}>
                For your loved one, {deceasedName}, at {cemeteryName}.
              </Text>
            </Section>

            <Section style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '24px',
              border: '1px solid #eee'
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#888', 
                marginBottom: '8px', 
                letterSpacing: '0.5px' 
              }}>
                YOUR THANK YOU
              </div>
              <Text style={{ 
                fontSize: '15px', 
                color: '#333',
                fontStyle: 'italic',
                margin: 0
              }}>
                “{originalThankYou}”
              </Text>
            </Section>

            <Section style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '28px',
              border: '1px solid #eee'
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#888', 
                marginBottom: '8px', 
                letterSpacing: '0.5px' 
              }}>
                THEIR REPLY
              </div>
              <Text style={{ 
                fontSize: '15px', 
                color: '#222',
                fontStyle: 'italic',
                margin: 0
              }}>
                “{visitorReply}”
              </Text>
            </Section>

            <Section style={{ 
              borderTop: '1px solid #ddd', 
              paddingTop: '20px',
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              Small exchanges like this are what make remembrance feel alive.
              <br /><br />
              Thank you for taking the time to reach out.
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
