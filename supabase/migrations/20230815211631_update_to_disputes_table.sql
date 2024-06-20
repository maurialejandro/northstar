-- Delete workflow_state column
ALTER TABLE disputes DROP COLUMN workflow_state;

-- Add dispute_message field
ALTER TABLE disputes
ADD COLUMN dispute_message VARCHAR;

-- Add status field with a default value of 'pending'
ALTER TABLE disputes
ADD COLUMN status VARCHAR DEFAULT 'Pending' NOT NULL;

-- Alter the table to modify the user_lead_id column
ALTER TABLE disputes
ALTER COLUMN user_lead_id SET NOT NULL;  -- Set the column as NOT NULL

-- Add a UNIQUE constraint on the user_lead_id column
ALTER TABLE disputes
ADD CONSTRAINT unique_user_lead_id UNIQUE (user_lead_id);

-- Create ENUM type
CREATE TYPE dispute_status AS ENUM ('Pending', 'Approved', 'Rejected');

-- Add a new column with the ENUM type and update values
ALTER TABLE disputes ADD COLUMN new_status dispute_status;

UPDATE disputes
SET new_status =
    CASE
        WHEN status = 'Pending' THEN 'Pending'::dispute_status
        WHEN status = 'Approved' THEN 'Approved'::dispute_status
        WHEN status = 'Rejected' THEN 'Rejected'::dispute_status
    END;

-- Drop the old column
ALTER TABLE disputes DROP COLUMN status;

-- Rename the new column to the original column name
ALTER TABLE disputes RENAME COLUMN new_status TO status;

CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the transaction type is not "bronze" or "silver"
    IF NEW.type NOT IN ('bronze', 'silver', 'gold') THEN
        -- Update the user's current_balance
        UPDATE users
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the user's balance on transaction
CREATE TRIGGER update_user_balance_trigger
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_balance_on_transaction();

-- Set the default value for the status column to 'Pending'
ALTER TABLE disputes
ALTER COLUMN status SET DEFAULT 'Pending'::public.dispute_status;