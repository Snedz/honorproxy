-- Allow visitors to reply to thank-you messages from families (light two-way connection)

ALTER TABLE visit_reports 
ADD COLUMN IF NOT EXISTS visitor_reply text;

ALTER TABLE visit_reports 
ADD COLUMN IF NOT EXISTS visitor_reply_sent_at timestamptz;

COMMENT ON COLUMN visit_reports.visitor_reply IS 'Optional reply from the visitor to the family thank-you message';
COMMENT ON COLUMN visit_reports.visitor_reply_sent_at IS 'When the visitor sent their reply';