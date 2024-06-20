-- Delete workflow_state column
ALTER TABLE buyer_leads DROP COLUMN workflow_state;


-- TODO NS7.2 roll back altering the table to change the status pending and time confirmed
-- Add status field
ALTER TABLE buyer_leads
ADD COLUMN status VARCHAR NOT NULL CHECK (status IN ('new', 'viewed', 'archived', 'pending', 'time-confirmed'));

-- Add price field
ALTER TABLE buyer_leads
ADD COLUMN price NUMERIC NOT NULL;
