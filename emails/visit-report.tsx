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

interface VisitReportEmailProps {
  deceasedName: string;
  cemeteryName: string;
  visitDate: string;
  reflection: string;
  tributeLeft?: string;
  photoUrls: string[]; // Array of accessible URLs (signed or public)
  keepsakeUrl?: string;
  requesterName?: string;
}

export default function VisitReportEmail({
  deceasedName,
  cemeteryName,
  visitDate,
  reflection,
  tributeLeft,
  photoUrls = [],
  keepsakeUrl,
  requesterName,
}: VisitReportEmailProps) {
  const previewText = `A visit was made for ${deceasedName} at ${cemeteryName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f5f2eb] font-sans">
          <Container className="mx-auto max-w-[600px] px-5 py-10">
            {/* Quiet brand mark */}
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

            {/* Main message — reverent opening */}
            <Section className="mb-9">
              <Text style={{ 
                fontSize: '26px', 
                lineHeight: '1.25', 
                fontWeight: 600, 
                color: '#1c252f',
                margin: '0 0 14px'
              }}>
                A visit was made for {deceasedName}
              </Text>
              <Text style={{ 
                fontSize: '16px', 
                color: '#3f4852', 
                lineHeight: '1.55',
                margin: 0
              }}>
                Someone stood at their resting place today on your behalf, with care and quiet respect.
              </Text>
            </Section>

            {/* Visit facts — clean card */}
            <Section style={{ 
              background: '#fff', 
              borderRadius: '14px', 
              padding: '26px 24px', 
              marginBottom: '26px',
              border: '1px solid #d8d2c6'
            }}>
              <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#7a838e', marginBottom: '5px', letterSpacing: '1.5px' }}>
                    VISITED ON
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 500, color: '#1c252f' }}>
                    {visitDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#7a838e', marginBottom: '5px', letterSpacing: '1.5px' }}>
                    AT
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 500, color: '#1c252f' }}>
                    {cemeteryName}
                  </div>
                </div>
              </div>

              {tributeLeft && (
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #d8d2c6' }}>
                  <div style={{ fontSize: '10px', color: '#7a838e', marginBottom: '4px', letterSpacing: '1.5px' }}>
                    TRIBUTE LEFT
                  </div>
                  <div style={{ fontSize: '16px', color: '#2a3138' }}>
                    {tributeLeft}
                  </div>
                </div>
              )}
            </Section>

            {/* Reflection — letter-like */}
            <Section style={{ marginBottom: '30px' }}>
              <div style={{ 
                background: '#fff', 
                borderRadius: '14px', 
                padding: '26px 24px', 
                border: '1px solid #d8d2c6'
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#7a838e', 
                  marginBottom: '8px', 
                  letterSpacing: '1.5px' 
                }}>
                  THE VISITOR WROTE
                </div>
                <Text style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  color: '#2a3138',
                  fontStyle: 'italic',
                  margin: 0
                }}>
                  “{reflection}”
                </Text>
              </div>
            </Section>

            {/* Link to full keepsake (beautiful web version) */}
            {keepsakeUrl && (
              <Section style={{ marginBottom: '30px', textAlign: 'center' }}>
                <a 
                  href={`https://honorproxy.com${keepsakeUrl}`} 
                  style={{
                    display: 'inline-block',
                    background: '#1c252f',
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  View the full keepsake online
                </a>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#7a838e', 
                  marginTop: '10px',
                  letterSpacing: '0.5px'
                }}>
                  Photos, reflection, and a permanent record of the visit
                </div>
              </Section>
            )}

            {/* Photos — gallery treatment */}
            {photoUrls.length > 0 && (
              <Section style={{ marginBottom: '34px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#7a838e', 
                  marginBottom: '10px', 
                  letterSpacing: '1.5px' 
                }}>
                  PHOTOS FROM THE VISIT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {photoUrls.slice(0, 4).map((url, index) => (
                    <a key={index} href={url} style={{ display: 'block', textDecoration: 'none' }}>
                      <img
                        src={url}
                        alt={`Photo from the visit ${index + 1}`}
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          border: '1px solid #d8d2c6',
                          objectFit: 'cover',
                          aspectRatio: '4 / 3',
                          display: 'block'
                        }}
                      />
                    </a>
                  ))}
                </div>
                {photoUrls.length > 4 && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#7a838e', 
                    marginTop: '10px',
                    textAlign: 'center' 
                  }}>
                    +{photoUrls.length - 4} additional photos in this message
                  </div>
                )}
              </Section>
            )}

            {/* Closing — warm and grateful */}
            <Section style={{ 
              borderTop: '1px solid #d8d2c6', 
              paddingTop: '22px',
              fontSize: '13px',
              color: '#4a5563',
              lineHeight: '1.6'
            }}>
              This visit was made through HonorProxy — a small, private act of remembrance for those who cannot be there themselves.
              <br /><br />
              We are grateful you are keeping their memory alive.
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
