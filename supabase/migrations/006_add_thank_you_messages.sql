-- Add support for families to thank visitors

-- Option A (simplest for MVP): Add a thank_you_message column to visit_reports
ALTER TABLE visit_reports 
ADD COLUMN IF NOT EXISTS thank_you_message text;

-- We'll also track when it was sent
ALTER TABLE visit_reports 
ADD COLUMN IF NOT EXISTS thank_you_sent_at timestamptz;

COMMENT ON COLUMN visit_reports.thank_you_message IS 'Optional thank you message from the family to the visitor';
COMMENT ON COLUMN visit_reports.thank_you_sent_at IS 'When the family sent their thank you';