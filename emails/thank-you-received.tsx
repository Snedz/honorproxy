import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface ThankYouReceivedEmailProps {
  visitorName?: string;
  deceasedName: string;
  cemeteryName: string;
  thankYouMessage: string;
  visitDate: string;
}

export default function ThankYouReceivedEmail({
  visitorName,
  deceasedName,
  cemeteryName,
  thankYouMessage,
  visitDate,
}: ThankYouReceivedEmailProps) {
  const previewText = `Thank you from the family of ${deceasedName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f5f2eb] font-sans">
          <Container className="mx-auto max-w-[600px] px-5 py-10">
            {/* Quiet mark */}
            <Section className="mb-8 text-center">
              <div style={{ 
                display: 'inline-block', 
                fontSize: '10px',
                letterSpacing: '3px',
                color: '#5c656f',
                fontWeight: 500
              }}>
                HONORPROXY
              </div>
              <div style={{ height: 1, background: '#d8d2c6', marginTop: 12 }} />
            </Section>

            <Section className="mb-9">
              <Text style={{ 
                fontSize: '24px', 
                lineHeight: '1.3', 
                fontWeight: 600, 
                color: '#1c252f',
                margin: '0 0 14px'
              }}>
                The family sent you a thank you
              </Text>
              <Text style={{ 
                fontSize: '16px', 
                color: '#3f4852', 
                lineHeight: '1.55'
              }}>
                Your visit to {deceasedName} at {cemeteryName} was received with gratitude.
              </Text>
            </Section>

            {/* The thank you message — stationery feel */}
            <Section style={{ 
              background: '#fff', 
              borderRadius: '14px', 
              padding: '26px 24px', 
              marginBottom: '28px',
              border: '1px solid #d8d2c6'
            }}>
              <div style={{ 
                fontSize: '10px', 
                color: '#7a838e', 
                marginBottom: '8px', 
                letterSpacing: '1.5px' 
              }}>
                THEY WROTE
              </div>
              <Text style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#2a3138',
                fontStyle: 'italic',
                margin: 0
              }}>
                “{thankYouMessage}”
              </Text>
            </Section>

            <Section style={{ 
              borderTop: '1px solid #d8d2c6', 
              paddingTop: '22px',
              fontSize: '13px',
              color: '#4a5563',
              lineHeight: '1.6'
            }}>
              Your act of remembrance was received with gratitude.
              <br /><br />
              Thank you for standing in for someone who could not be there.
            </Section>

            <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '10px', color: '#7a838e', letterSpacing: '1px' }}>
              HONORPROXY
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
