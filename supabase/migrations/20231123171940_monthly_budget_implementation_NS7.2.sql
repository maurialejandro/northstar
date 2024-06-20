ALTER TABLE users DROP COLUMN current_balance;
ALTER TABLE users ADD COLUMN current_balance integer NOT NULL DEFAULT 0;

ALTER TABLE users ADD COLUMN monthly_budget integer NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN charge_date timestamp;

ALTER TABLE transactions DROP COLUMN type;
ALTER TABLE transactions ADD COLUMN type VARCHAR CHECK (type IN ('bronze', 'silver', 'gold', 'subscription-credits' , 'add-credits', 'return', 'promotion', 'admin', 'lead-assign', 'lead-charge'));

CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the transaction type is not "bronze" or "silver" and charge_date is not greater than NOW()
    IF NEW.type NOT IN ('bronze', 'silver', 'gold', 'lead-charge') THEN
        -- if NEW.type is "add-credits" transform NEW.amount to its negative value
        IF NEW.type = 'add-credits' THEN
            NEW.amount = NEW.amount * -1;
        END IF;

        -- Update the user's current_balance
        UPDATE users
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.user_id;

        -- Set the balance on NEW.balance
        UPDATE transactions
        SET balance = (SELECT current_balance FROM users WHERE id = NEW.user_id)
        WHERE id = NEW.id;

    ELSE

        UPDATE transactions
        SET balance = (SELECT current_balance FROM users WHERE id = NEW.user_id)
        WHERE id = NEW.id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- add a boolean column to the table buyer_leads with the name of buyer_confirmed
ALTER TABLE buyer_leads ADD COLUMN buyer_confirmed boolean NOT NULL DEFAULT false;

-- add a string enum column to the table transactions with the name of credit_card_charged with the values of 'pending', 'success', 'failed', 'not-applicable'
ALTER TABLE transactions ADD COLUMN credit_card_charged VARCHAR CHECK (credit_card_charged IN ('pending', 'success', 'failed', 'not-applicable'));

-- add a subcription_lavel column type uuid
ALTER TABLE transactions ADD COLUMN subscription_level uuid;
-- add contraint transactions_subscription_level_fkey foreign key (subscription_level) references subscription_levels (id)
ALTER TABLE transactions ADD CONSTRAINT transactions_subscription_level_fkey FOREIGN KEY (subscription_level) REFERENCES subscription_levels (id);

-- add column refers_to_transaction type varchar
ALTER TABLE transactions ADD COLUMN refers_to_transaction VARCHAR;

-- constraint transactions_refers_to_transaction_id_fkey foreign key (refers_to_transaction_id) references transactions (id),
-- remove the above contraint
ALTER TABLE transactions DROP CONSTRAINT transactions_refers_to_transaction_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_refers_to_transaction_fkey FOREIGN KEY (refers_to_transaction) REFERENCES transactions (id);

create view distinct_states as
    select distinct state from counties;