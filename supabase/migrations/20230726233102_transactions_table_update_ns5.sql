-- Add new columns
ALTER TABLE transactions ADD COLUMN user_id uuid REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN buyer_leads_id uuid REFERENCES buyer_leads(id);
ALTER TABLE transactions ADD COLUMN stripe_transaction_id VARCHAR;
ALTER TABLE transactions ADD COLUMN dispute_id uuid REFERENCES disputes(id);
ALTER TABLE transactions ADD COLUMN type VARCHAR CHECK (type IN ('bronze', 'silver', 'gold', 'subscription-credits' , 'add-credits', 'return', 'promotion', 'admin', 'lead-assign'));
ALTER TABLE transactions ADD COLUMN balance INTEGER;
ALTER TABLE transactions ADD COLUMN refers_to_transaction_id VARCHAR REFERENCES transactions(id);

-- Remove existing column
ALTER TABLE transactions DROP COLUMN status;
ALTER TABLE transactions DROP COLUMN customer_id;

-- Change column data type
ALTER TABLE transactions ALTER COLUMN amount TYPE INTEGER;

