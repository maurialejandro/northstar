ALTER TABLE disputes RENAME COLUMN user_lead_id TO buyer_lead_id;

ALTER TABLE disputes
    DROP CONSTRAINT disputes_user_lead_id_fkey,
    ADD CONSTRAINT disputes_buyer_lead_id FOREIGN KEY (buyer_lead_id) REFERENCES buyer_leads(id);

ALTER TABLE buyer_leads
    ALTER COLUMN sent_date TYPE timestamp without time zone USING sent_date::timestamp with time zone;