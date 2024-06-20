-- TODO this is a poor man's fixtures. it's a pain to have multiple supabases running locally, so for now we're
-- just supplementing what's in the seed.sql with the following.

-- TESTING BLOCK

-- INSERTFUNCTIONS

-- Create a function to fetch a lead's UUID by name
CREATE OR REPLACE FUNCTION lead_id(lead_name VARCHAR) RETURNS UUID AS $$
DECLARE
  lead_uuid UUID;
BEGIN
  SELECT id INTO lead_uuid FROM leads WHERE name = lead_name;
  RETURN lead_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a user's UUID by name
CREATE OR REPLACE FUNCTION user_id(user_name VARCHAR) RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM users WHERE name = user_name;
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a county's UUID by name and state
CREATE OR REPLACE FUNCTION county_id(county_name_state VARCHAR) RETURNS UUID AS $$
DECLARE
    county_uuid UUID;
    county_name VARCHAR;
    county_state VARCHAR;
BEGIN
    -- Split the input into county_name and county_state
    county_name := substring(county_name_state, 1, position(',' IN county_name_state) - 1);
    county_state := substring(county_name_state, position(',' IN county_name_state) + 2);

    SELECT id INTO county_uuid FROM counties WHERE name = county_name AND state = county_state;
    RETURN county_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a buyer_lead's UUID by lead name
CREATE OR REPLACE FUNCTION buyer_lead_id(lead_name VARCHAR) RETURNS UUID AS $$
DECLARE
  buyer_lead_uuid UUID;
BEGIN
    SELECT id INTO buyer_lead_uuid FROM buyer_leads WHERE lead_id = lead_id(lead_name);
    RETURN buyer_lead_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a subscription_level's UUID by level
CREATE OR REPLACE FUNCTION subscription_level_id(level_name VARCHAR) RETURNS UUID AS $$
DECLARE
  subscription_level_uuid UUID;
BEGIN
    SELECT id INTO subscription_level_uuid FROM subscription_levels WHERE level = level_name;
    RETURN subscription_level_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a transaction's UUID by buyer_lead id and type 'lead-assign'
CREATE OR REPLACE FUNCTION charge_transaction_id(buyer_lead_uuid UUID) RETURNS UUID AS $$
DECLARE
  transaction_uuid UUID;
BEGIN
    SELECT id INTO transaction_uuid FROM transactions WHERE buyer_leads_id = buyer_lead_uuid AND type = 'lead-assign';
    RETURN transaction_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a county_bids's bid_amount by user_id and county_id
CREATE OR REPLACE FUNCTION county_bid_amount(user_uuid UUID, county_uuid UUID) RETURNS NUMERIC AS $$
DECLARE
  bid_amount_value NUMERIC;
BEGIN
    SELECT bid_amount INTO bid_amount_value FROM county_bids WHERE user_id = user_uuid AND county_id = county_uuid;
    RETURN bid_amount_value;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fetch a buyer_leads's price by lead_name
CREATE OR REPLACE FUNCTION buyer_lead_price(lead_name VARCHAR) RETURNS NUMERIC AS $$
DECLARE
  buyer_lead_price_value NUMERIC;
BEGIN
    SELECT price INTO buyer_lead_price_value FROM buyer_leads WHERE lead_name = lead_name;
    RETURN buyer_lead_price_value * -1;
END;
$$ LANGUAGE plpgsql;

-- create a funciton to get the subscription_level id by name
CREATE OR REPLACE FUNCTION subscription_level_id(level_name VARCHAR) RETURNS UUID AS $$
DECLARE
  subscription_level_uuid UUID;
BEGIN
    SELECT id INTO subscription_level_uuid FROM subscription_levels WHERE level = level_name;
    RETURN subscription_level_uuid;
END;
$$ LANGUAGE plpgsql;

-- INSERT FUNCTIONS;





DO $$
    BEGIN

        BEGIN -- SUBSCRIBE USERS
            BEGIN -- INSERTTRANSACTIONS


                -- Insert subscriptions
                INSERT INTO transactions (id, user_id, amount, type, refers_to_transaction_id, created, charge_date, stripe_transaction_id, credit_card_charged, subscription_level)
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000501', user_id('Zequi Buyer'), -1000, 'gold', null, NOW(), NOW(), 'testId001', 'success', subscription_level_id('gold')),
                    ('123e4567-e89a-12d3-b456-226600000503', user_id('John Buyer'), -1000, 'gold', null, NOW() + INTERVAL '1 min', NOW(), 'testID002', 'success', subscription_level_id('gold'));
            END;

            BEGIN
                -- Insert subscription credits
                INSERT INTO transactions (id, user_id, amount, type, refers_to_transaction_id, refers_to_transaction, created, charge_date)
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000502', user_id('Zequi Buyer'), 2000, 'subscription-credits', '123e4567-e89a-12d3-b456-226600000501', '123e4567-e89a-12d3-b456-226600000501', NOW() + INTERVAL '2 min', NOW()),
                    ('123e4567-e89a-12d3-b456-226600000504', user_id('John Buyer'), 2000, 'subscription-credits', '123e4567-e89a-12d3-b456-226600000503', '123e4567-e89a-12d3-b456-226600000503', NOW() + INTERVAL '3 min', NOW());
            END; -- INSERTTRANSACTIONS

            BEGIN -- INSERTSUBSCRIPTIONS
                -- Insert subscriptions
                INSERT INTO subscriptions (id, type, subscription_level_id, user_id, start_date, end_date)
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000701', 'gold', subscription_level_id('gold'), user_id('Zequi Buyer'), NOW(), NOW() + INTERVAL '1 month'),
                    ('123e4567-e89a-12d3-b456-226600000702', 'gold', subscription_level_id('gold'), user_id('John Buyer'), NOW(), NOW() + INTERVAL '1 month 3 days');
            END; -- INSERTSUBSCRIPTIONS

        END; -- SUBSCRIBE USERS

        BEGIN -- INSERT COUNTY BIDS
            -- Insert county bids
            INSERT INTO county_bids (user_id, county_id, bid_amount, deleted, id, created)
            VALUES
                (user_id('Zequi Buyer'), county_id('El Paso, TX'), 100, null, '123e4567-e89a-12d3-b456-226600000801', NOW()),
                (user_id('Zequi Buyer'), county_id('El Paso, CO'), 100, null, '123e4567-e89a-12d3-b456-226600000802', NOW()),
                (user_id('Zequi Buyer'), county_id('Fresno, CA'), 100, null, '123e4567-e89a-12d3-b456-226600000803', NOW()),
                (user_id('John Buyer'), county_id('Fresno, CA'), 100, null, '123e4567-e89a-12d3-b456-226600000804', NOW()),
                (user_id('John Buyer'), county_id('Broward, FL'), 100, null, '123e4567-e89a-12d3-b456-226600000805', NOW()),
                (user_id('John Buyer'), county_id('Miami-Dade, FL'), 100, null, '123e4567-e89a-12d3-b456-226600000806', NOW()),
                (user_id('John Buyer'), county_id('El Paso, TX'), 100, null, '123e4567-e89a-12d3-b456-226600000807', NOW()),
                (user_id('John Buyer'), county_id('El Paso, CO'), 100, null, '123e4567-e89a-12d3-b456-226600000808', NOW());
        END; -- INSERT COUNTY BIDS

        BEGIN -- INSERT LEADS
            INSERT INTO leads (id, name, county_id, phone, email, address, city, state, zip_code, county )
            VALUES
                -- County: El Paso, TX
                ('123e4567-e89a-12d3-b456-226600000301', 'Sample Lead01', county_id('El Paso, TX'), '5854908306', 'sprogonic@yahoo.com', '727 Boughton hill road', 'Honeoye falls', 'TX', '80909', 'El Paso'),
                ('123e4567-e89a-12d3-b456-226600000302', 'Sample Lead02', county_id('El Paso, TX'), '4845983487', 'jonslaybaugh2@gmail.com', '140 Mulberry Street', 'Pottstown', 'TX', '80909', 'El Paso'),
                -- County: El Paso, CO
                ('123e4567-e89a-12d3-b456-226600000303', 'Sample Lead03', county_id('El Paso, CO'), '5305705144', 'passionaomi2@yahoo.com', '3208 Godman Ave', 'Chico', 'CO', '80909', 'El Paso'),
                ('123e4567-e89a-12d3-b456-226600000328', 'Sample Lead27', county_id('El Paso, CO'), '5305705143', 'passionaomi@yahoo.com', '322 Godman Ave', 'Chico', 'CO', '80909', 'El Paso'),
                ('123e4567-e89a-12d3-b456-226600000304', 'Sample Lead04', county_id('El Paso, CO'), '3239009970', 'westwinginc37@gmail.com', '3091 Sourdough Trail', 'South Lake Tahoe', 'CO', '80909', 'El Paso'),
                -- County: Fresno, CA
                ('123e4567-e89a-12d3-b456-226600000305', 'Sample Lead05', county_id('Fresno, CA'), '4242024193', 'aphylly@aol.com', '198 s. Kona Ave', 'Fresno', 'CA', '93727', 'Fresno'),
                ('123e4567-e89a-12d3-b456-226600000306', 'Sample Lead06', county_id('Fresno, CA'), '5599353535', 'drmichaelmurphy@gmail.com', '36304 HWY 33', 'Coalinga', 'CA', '93210', 'Fresno'),
                ('123e4567-e89a-12d3-b456-226600000307', 'Sample Lead07', county_id('Fresno, CA'), '2096781609', 'pyeates1@yahoo.com', '34684 George Smith Rd', 'Squaw Valley', 'CA', '93675', 'Fresno'),
                -- County: Miami-Dade, FL
                ('123e4567-e89a-12d3-b456-226600000308', 'Sample Lead08', county_id('Miami-Dade, FL'), '9704021619', 'mochroi51@gmail.com', '1526 W 16th St', 'Loveland', 'FL', '33169', 'Miami-Dade'),
                ('123e4567-e89a-12d3-b456-226600000309', 'Sample Lead09', county_id('Miami-Dade, FL'), '7867815347', 'jristilp@icloud.com', '20458 NW Ninth Ave', 'Miami Gardens', 'FL', '33169', 'Miami-Dade'),
                ('123e4567-e89a-12d3-b456-226600000310', 'Sample Lead10', county_id('Miami-Dade, FL'), '3058156792', 'alexaiturrieta@gmail.com', '18542 SW 89th CT', 'Cutler Bay', 'FL', '33157', 'Miami-Dade'),
                -- County: Broward, FL
                ('123e4567-e89a-12d3-b456-226600000311', 'Sample Lead11', county_id('Broward, FL'), '9136459799', 'fuzyfoot@aol.com', '14685 Granite St Platte City MO 64079', 'Platte City', 'FL', '33441', 'Broward'),
                ('123e4567-e89a-12d3-b456-226600000312', 'Sample Lead12', county_id('Broward, FL'), '7192299758', 'johnnygAgu45@gmail.com', '2510 LAMBERT AVE', 'PUEBLO', 'FL', '33441', 'Broward'),
                ('123e4567-e89a-12d3-b456-226600000313', 'Sample Lead13', county_id('Broward, FL'), '9704132506', 'johnDoe@gmail.com', '1541 John st', 'Loveland', 'FL', '33157', 'Broward'),
                ('123e4567-e89a-12d3-b456-226600000314', 'Sample Lead14', county_id('El Paso, CO'), '7194334050', 'jmorri13@uccs.edu', '2646 E Yampa St.', 'Colorado Springs', 'CO', '80909', 'EL PASO');
        END; -- INSERT LEADS

        BEGIN -- INSERT BUYER LEADS
            -- 8. Create buyer_leads
            INSERT INTO buyer_leads (id, lead_id, user_id, status, price, deleted, sent_date, buyer_confirmed)
            VALUES
                -- Zequi Buyer Leads El Paso, TX
                ('123e4567-e89a-12d3-b456-226600000400', lead_id('Sample Lead01'), user_id('John Buyer'), 'new', county_bid_amount(user_id('John Buyer'), county_id('El Paso, TX')), NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', false), -- sent_date = deployment date + 9 days
                ('123e4567-e89a-12d3-b456-226600000401', lead_id('Sample Lead01'), user_id('Zequi Buyer'), 'new', county_bid_amount(user_id('Zequi Buyer'), county_id('El Paso, TX')), null, NOW() - INTERVAL '2 days', true), -- sent_date = deployment date + 9 days
                ('123e4567-e89a-12d3-b456-226600000402', lead_id('Sample Lead02'), user_id('Zequi Buyer'), 'viewed', county_bid_amount(user_id('Zequi Buyer'), county_id('El Paso, TX')), null, NOW() - INTERVAL '3 days', true), -- sent_date = deployment date + 4 days
                -- Zequi Buyer Leads El Paso, CO
                ('123e4567-e89a-12d3-b456-226600000403', lead_id('Sample Lead03'), user_id('Zequi Buyer'), 'new', county_bid_amount(user_id('Zequi Buyer'), county_id('El Paso, CO')), null, NOW() - INTERVAL '4 days', true), -- sent_date = deployment date + 10 days
                ('123e4567-e89a-12d3-b456-226600000404', lead_id('Sample Lead04'), user_id('Zequi Buyer'), 'viewed', county_bid_amount(user_id('Zequi Buyer'), county_id('El Paso, CO')), null, NOW() - INTERVAL '5 days', true), -- sent_date = deployment date + 3 days
                -- Zequi Buyer Leads Fresno, CA
                ('123e4567-e89a-12d3-b456-226600000405', lead_id('Sample Lead05'), user_id('Zequi Buyer'), 'new', county_bid_amount(user_id('Zequi Buyer'), county_id('Fresno, CA')), null, NOW() - INTERVAL '6 days', true), -- sent_date = deployment date + 12 days

                -- John Buyer Leads El Paso, CO
                ('123e4567-e89a-12d3-b456-226600000427', lead_id('Sample Lead27'), user_id('John Buyer'), 'new', county_bid_amount(user_id('John Buyer'), county_id('El Paso, CO')), null, NOW() - INTERVAL '4 days', true),
                -- John Buyer Leads Fresno, CA
                ('123e4567-e89a-12d3-b456-226600000406', lead_id('Sample Lead06'), user_id('John Buyer'), 'viewed', county_bid_amount(user_id('John Buyer'), county_id('Fresno, CA')), null, NOW() - INTERVAL '7 days', true), -- sent_date = deployment date + 5 days
                ('123e4567-e89a-12d3-b456-226600000407', lead_id('Sample Lead07'), user_id('John Buyer'), 'new', county_bid_amount(user_id('John Buyer'), county_id('Fresno, CA')), null, NOW() - INTERVAL '9 days', true), -- sent_date = deployment date + 8 days
                -- John Buyer Leads Broward, FL
                ('123e4567-e89a-12d3-b456-226600000408', lead_id('Sample Lead08'), user_id('John Buyer'), 'viewed', county_bid_amount(user_id('John Buyer'), county_id('Broward, FL')), null, NOW() - INTERVAL '10 days', true), -- sent_date = deployment date + 6 days
                ('123e4567-e89a-12d3-b456-226600000409', lead_id('Sample Lead09'), user_id('John Buyer'), 'new', county_bid_amount(user_id('John Buyer'), county_id('Broward, FL')), null, NOW() - INTERVAL '11 days', true), -- sent_date = deployment date + 11 days
                ('123e4567-e89a-12d3-b456-226600000410', lead_id('Sample Lead10'), user_id('John Buyer'), 'archived', county_bid_amount(user_id('John Buyer'), county_id('Broward, FL')), null, NOW() - INTERVAL '12 days', true), -- sent_date = deployment date + 7 days
                -- John Buyer Leads Miami-Dade, FL
                ('123e4567-e89a-12d3-b456-226600000411', lead_id('Sample Lead11'), user_id('John Buyer'), 'new', county_bid_amount(user_id('John Buyer'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '13 days', true), -- sent_date = deployment date + 14 days
                ('123e4567-e89a-12d3-b456-226600000412', lead_id('Sample Lead12'), user_id('John Buyer'), 'archived', county_bid_amount(user_id('John Buyer'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '14 days', true), -- sent_date = deployment date + 2 days
                ('123e4567-e89a-12d3-b456-226600000413', lead_id('Sample Lead13'), user_id('John Buyer'), 'viewed', county_bid_amount(user_id('John Buyer'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '15 days', true), -- sent_date = deployment date + 13 days
                ('123e4567-e89a-12d3-b456-226600000414', lead_id('Sample Lead14'), user_id('John Buyer'), 'viewed', county_bid_amount(user_id('John Buyer'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '16 days', true);
        END; -- INSERT BUYER LEADS

        BEGIN -- CHARGE FOR BUYER LEADS
            -- After 72 hours a transaction is created for each buyer_lead
            -- created = buyer_lead.sent_date + 3 days
            INSERT INTO transactions (id, user_id, buyer_leads_id, amount, type, refers_to_transaction_id, created, charge_date, stripe_transaction_id, credit_card_charged)
            VALUES
                -- John transactions for ALL of the buyer leads
                ('123e4567-e89a-12d3-b456-226600000505', user_id('Zequi Buyer'), buyer_lead_id('Sample Lead01'), buyer_lead_price('Sample Lead01'), 'lead-assign', null, NOW() + INTERVAL '4 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000506', user_id('Zequi Buyer'), buyer_lead_id('Sample Lead02'), buyer_lead_price('Sample Lead02'), 'lead-assign', null, NOW() + INTERVAL '5 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000507', user_id('Zequi Buyer'), buyer_lead_id('Sample Lead03'), buyer_lead_price('Sample Lead03'), 'lead-assign', null, NOW() + INTERVAL '6 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000508', user_id('Zequi Buyer'), buyer_lead_id('Sample Lead04'), buyer_lead_price('Sample Lead04'), 'lead-assign', null, NOW() + INTERVAL '7 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                -- Zequi transactions for ALL of the buyer leads
                ('123e4567-e89a-12d3-b456-226600000509', user_id('John Buyer'), buyer_lead_id('Sample Lead08'), buyer_lead_price('Sample Lead08'), 'lead-assign', null, NOW() + INTERVAL '8 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000510', user_id('John Buyer'), buyer_lead_id('Sample Lead09'), buyer_lead_price('Sample Lead09'), 'lead-assign', null, NOW() + INTERVAL '9 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000511', user_id('John Buyer'), buyer_lead_id('Sample Lead10'), buyer_lead_price('Sample Lead10'), 'lead-assign', null, NOW() + INTERVAL '10 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000512', user_id('John Buyer'), buyer_lead_id('Sample Lead11'), buyer_lead_price('Sample Lead11'), 'lead-assign', null, NOW() + INTERVAL '11 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000513', user_id('John Buyer'), buyer_lead_id('Sample Lead12'), buyer_lead_price('Sample Lead12'), 'lead-assign', null, NOW() + INTERVAL '12 min', NOW(), null, 'not-applicable'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000514', user_id('John Buyer'), buyer_lead_id('Sample Lead13'), buyer_lead_price('Sample Lead13'), 'lead-charge', null, NOW() + INTERVAL '13 min', NOW(), 'testID003', 'success'), -- created = buyer_lead.sent_date + 3 days
                ('123e4567-e89a-12d3-b456-226600000515', user_id('John Buyer'), buyer_lead_id('Sample Lead14'), buyer_lead_price('Sample Lead14'), 'lead-charge', null, NOW() + INTERVAL '14 min', NOW(), 'testID004', 'success'); -- created = buyer_lead.sent_date + 3 days
        END; -- CHARGE FOR BUYER LEADS

        BEGIN -- INSERT DISPUTES
            -- 9. Create disputes
            INSERT INTO disputes (id, buyer_lead_id, status, dispute_reason, dispute_date)
            VALUES
                -- John Disputes: Pending: 123e4567-e89b-12d3-a456-426655440003, Approved: 123e4567-e89b-12d3-a456-426655440006 and Rejected: 123e4567-e89b-12d3-a456-426655440007
                ('123e4567-e89a-12d3-b456-226600000601', buyer_lead_id('Sample Lead04'), 'Approved', 'The price is too high', NOW() + INTERVAL '8 day 3 hours'), -- dispute_date = buyer_lead.sent_date + 5 days
                ('123e4567-e89a-12d3-b456-226600000602', buyer_lead_id('Sample Lead01'), 'Pending', 'The price is too high', NOW() + INTERVAL '5 day 3 hours'), -- dispute_date = buyer_lead.sent_date + 5 days
                ('123e4567-e89a-12d3-b456-226600000603', buyer_lead_id('Sample Lead05'), 'Rejected', 'The price is too high', NOW() + INTERVAL '9 day 3 hours'), -- dispute_date = buyer_lead.sent_date + 5 days
                -- Zequi Disputes: Pending: 123e4567-e89b-12d3-a456-426655440010, Approved: 123e4567-e89b-12d3-a456-426655440012 and Rejected: 123e4567-e89b-12d3-a456-426655440015
                ('123e4567-e89a-12d3-b456-226600000604', buyer_lead_id('Sample Lead06'), 'Pending', 'The price is too high', NOW() + INTERVAL '10 day 3 hours'), -- dispute_date = buyer_lead.sent_date + 5 days
                ('123e4567-e89a-12d3-b456-226600000605', buyer_lead_id('Sample Lead11'), 'Approved', 'The price is too high', NOW() + INTERVAL '12 day 3 hours'), -- dispute_date = buyer_lead.sent_date + 5 days
                ('123e4567-e89a-12d3-b456-226600000606', buyer_lead_id('Sample Lead08'), 'Rejected', 'The price is too high', NOW() + INTERVAL '15 day 3 hours'); -- dispute_date = buyer_lead.sent_date + 5 days
        END; -- INSERT DISPUTES

        BEGIN -- INSERTDISPUTETRANSACTIONS
            INSERT INTO transactions (id, user_id, buyer_leads_id, dispute_id, amount, type, refers_to_transaction_id, refers_to_transaction, created, charge_date)
            VALUES
                -- John return
                ('123e4567-e89a-12d3-b456-226600000516', user_id('Zequi Buyer'), buyer_lead_id('Sample Lead04'), '123e4567-e89a-12d3-b456-226600000601', 100, 'return', charge_transaction_id(buyer_lead_id('Sample Lead04')), charge_transaction_id(buyer_lead_id('Sample Lead04')), NOW() + INTERVAL '15 min', NOW()), -- created = dispute_date
                -- Zequi return
                ('123e4567-e89a-12d3-b456-226600000517', user_id('John Buyer'), buyer_lead_id('Sample Lead11'), '123e4567-e89a-12d3-b456-226600000605', 100, 'return', charge_transaction_id(buyer_lead_id('Sample Lead11')), charge_transaction_id(buyer_lead_id('Sample Lead11')), NOW() + INTERVAL '16 min', NOW()); -- created = dispute_date
        END; -- INSERTDISPUTETRANSACTIONS

END $$;

--  for testing we are going to
--  0. determine sign_up_date
--  1. create 3 auth users
--  2. create 3 users role buyer
--  3. create 2 county_bids for each buyer
--  4. subscribe 1 buyers to gold (create respective transactions)
--  5. subscribe 1 buyers to silver (create respective transactions)
--  6. create 1 buyer_leads for each buyer (create respective transactions)

--  0. determine sign_up_date
DO $$ -- TESTING BLOCK
    DECLARE
    sign_up_date timestamp := NOW();
    BEGIN -- SIGNUPINSERTUSERS
        BEGIN -- INSERTAUTHUSERS
            -- 1. create 3 auth users
            INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
                    confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new,
                    email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
                    is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token,
                    phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until,
                    reauthentication_token, reauthentication_sent_at, is_sso_user)
            -- testauth01@gmail.com / foobah1234 (buyer)
            VALUES
                ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000104', 'authenticated', 'authenticated',
                'testauth01@gmail.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', sign_up_date,
                NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                sign_up_date, sign_up_date, NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
                -- testauth02@gmail.com / foobah1234 (buyer)
                ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000105', 'authenticated', 'authenticated',
                'testauth02@gmail.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', sign_up_date,
                NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                sign_up_date, sign_up_date, NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
                -- testauth03@gmail.com / foobah1234 (buyer)
                ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000106', 'authenticated', 'authenticated',
                'testauth03@gmail.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', sign_up_date,
                NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                sign_up_date, sign_up_date, NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false);
        END; -- INSERTAUTHUSERS


        BEGIN
            -- TODO REMOVE THIS CODE AFTER REMOVING THE TRIGGER TO CREATE NEW USERS ON AUTH SIGNUP
            DELETE FROM users
            WHERE auth IN (
                '123e4567-e89a-12d3-b456-226600000104',
                '123e4567-e89a-12d3-b456-226600000105',
                '123e4567-e89a-12d3-b456-226600000106'
            );
            -- TODO END OF CODE TO REMOVE
        END;


        BEGIN -- INSERTUSERS all buyers
            INSERT INTO users (auth, id, role, email, name, stripe_customer_id, stripe_payment_method_id, monthly_budget, phone, current_balance)
            VALUES
                ('123e4567-e89a-12d3-b456-226600000104', '123e4567-e89a-12d3-b456-226600000204', 'buyer', 'testauth01@gmail.com', 'Test Buyer01', null, null, 1500, 9704132206, 0),
                ('123e4567-e89a-12d3-b456-226600000105', '123e4567-e89a-12d3-b456-226600000205', 'buyer', 'testauth02@gmail.com', 'Test Buyer02', null, null, 1500, 5611234567, 0),
                ('123e4567-e89a-12d3-b456-226600000106', '123e4567-e89a-12d3-b456-226600000206', 'buyer', 'testauth03@gmail.com', 'Test Buyer03', null, null, 1500, 5611234567, 0);
        END; -- INSERTUSERS

        BEGIN -- INSERT COUNTY BIDS
        -- 3. Create 2 county_bids for each test buyer
            INSERT INTO county_bids (user_id, county_id, bid_amount, deleted, id, created)
                VALUES
                    -- County bids for Test Buyer01
                    (user_id('Test Buyer01'), county_id('Miami-Dade, FL'), 100, null, '123e4567-e89a-12d3-b456-226600000808', NOW()), -- El Paso, TX
                    (user_id('Test Buyer01'), county_id('El Paso, CO'), 100, null, '123e4567-e89a-12d3-b456-226600000809', NOW()), -- El Paso, CO

                    -- County bids for Test Buyer02
                    (user_id('Test Buyer02'), county_id('Fresno, CA'), 100, null, '123e4567-e89a-12d3-b456-226600000810', NOW()), -- Fresno, CA
                    (user_id('Test Buyer02'), county_id('Broward, FL'), 100, null, '123e4567-e89a-12d3-b456-226600000811', NOW()), -- Broward, FL

                    -- County bids for Test Buyer03
                    (user_id('Test Buyer03'), county_id('Miami-Dade, FL'), 100, null, '123e4567-e89a-12d3-b456-226600000812', NOW()), -- Miami-Dade, FL
                    (user_id('Test Buyer03'), county_id('El Paso, CO'), 100, null, '123e4567-e89a-12d3-b456-226600000813', NOW()); -- St. Lucie, FL
        END; -- INSERT COUNTY BIDS

        BEGIN -- SUBSCRIBE USERS
            --  4. subscribe 1 buyers to gold (create respective transactions)
            --  5. subscribe 1 buyers to silver (create respective transactions)
            BEGIN -- INSERTTRANSACTIONS
                INSERT INTO transactions (id, user_id, amount, type, refers_to_transaction_id, created, charge_date, stripe_transaction_id, credit_card_charged, subscription_level) -- created = NOW()
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000519', user_id('Test Buyer02'), -500, 'silver', null, NOW() + INTERVAL '17 min', NOW(), 'testID001', 'success', subscription_level_id('silver'));
            END;

            BEGIN
                INSERT INTO transactions (id, user_id, amount, type, refers_to_transaction_id, refers_to_transaction, created, charge_date) -- created = NOW()
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000521', user_id('Test Buyer02'), 800, 'subscription-credits', '123e4567-e89a-12d3-b456-226600000519', '123e4567-e89a-12d3-b456-226600000519', NOW() + INTERVAL '18 min', NOW());
                    --  TODO make a trigger for the subscriptions credits transactions to be created.
            END; -- INSERTTRANSACTIONS

            BEGIN -- INSERT SUBSCRIPTIONS
                INSERT INTO subscriptions (id, type, subscription_level_id, user_id, start_date, end_date) -- created = NOW()
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000703', 'silver', subscription_level_id('silver'),  user_id('Test Buyer02'), NOW(), NOW() + INTERVAL '1 month');
            END; -- INSERT SUBSCRIPTIONS
        END; -- SUBSCRIBE USERS
END $$; -- TESTING BLOCK


INSERT INTO leads (id, name, county_id, phone, email, address, city, state, zip_code, county, created)
VALUES
    ('123e4567-e89a-12d3-b456-226600000315', 'Sample Lead15', county_id('Miami-Dade, FL'), '9704132243', 'mike@gmail.com', '1541 Mike st', 'Loveland', 'CO', '33157', 'EL PASO', NOW()),
    ('123e4567-e89a-12d3-b456-226600000316', 'Sample Lead16', county_id('Miami-Dade, FL'), '6103317913', 'anuragmittal@comcast.net', '137 Rebel Hill Rd.', 'Conshohocken', 'TX', '80909', 'EL PASO', NOW()),
    ('123e4567-e89a-12d3-b456-226600000317', 'Sample Lead17', county_id('Miami-Dade, FL'), '3059420937', '1awesomedesign1@gmail.com', '6339 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000318', 'Sample Lead18', county_id('Miami-Dade, FL'), '7543674981', 'bjkensel@hotmail.com', '1428 SE 4th Ave 4th Ave', 'Deerfield Beach', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000319', 'Sample Lead19', county_id('Miami-Dade, FL'), '9704132234', 'JaneDoe1@gmail.com', '1551 Jane st', 'Loveland', 'FL', '33157', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000320', 'Sample Lead20', county_id('Miami-Dade, FL'), '9704132233', 'JaneDoe@gmail.com', '1541 Jane st', 'Loveland', 'FL', '33157', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000321', 'Sample Lead21', county_id('Miami-Dade, FL'), '3059420938', '1awesomedesign2@gmail.com', '633 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000322', 'Sample Lead22', county_id('Miami-Dade, FL'), '3059420939', '1awesomedesign3@gmail.com', '639 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000323', 'Sample Lead23', county_id('Miami-Dade, FL'), '3059420932', '1awesomedesign4@gmail.com', '649 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000324', 'Sample Lead24', county_id('Miami-Dade, FL'), '3059420933', '1awesomedesign5@gmail.com', '339 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000325', 'Sample Lead25', county_id('Miami-Dade, FL'), '3059420934', '1awesomedesign6@gmail.com', '6539 s. Ficus lane', 'Lake Worth', 'FL', '33441', 'MIAMI-DADE', NOW()),
    ('123e4567-e89a-12d3-b456-226600000326', 'Sample Lead26', county_id('Miami-Dade, FL'), '9704132206', 'jimnelson547@gmail.com', 'Wesley Dryland st', 'Loveland', 'FL', '33157', 'MIAMI-DADE', NOW()),
    -- 0328 already in seeder.
    ('123e4567-e89a-12d3-b456-226600000329', 'Bob Geldof', county_id('El Paso, TX'), '2408008000', 'bob@geldof.com', '726 Boughton hill road', 'Honeoye falls', 'TX', '80909', 'El Paso', NOW());



INSERT INTO buyer_leads (id, lead_id, user_id, status, price, deleted, sent_date, buyer_confirmed)
VALUES
    ('123e4567-e89a-12d3-b456-226600000416', lead_id('Sample Lead15'), user_id('Test Buyer02'), 'new', county_bid_amount(user_id('Test Buyer02'), county_id('Broward, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000417', lead_id('Sample Lead16'), user_id('Test Buyer02'), 'viewed', county_bid_amount(user_id('Test Buyer02'), county_id('Broward, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000418', lead_id('Sample Lead17'), user_id('Test Buyer02'), 'archived', county_bid_amount(user_id('Test Buyer02'), county_id('Broward, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000419', lead_id('Sample Lead18'), user_id('Test Buyer02'), 'new', county_bid_amount(user_id('Test Buyer02'), county_id('Broward, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000420', lead_id('Sample Lead19'), user_id('Test Buyer02'), 'new', county_bid_amount(user_id('Test Buyer02'), county_id('Broward, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000421', lead_id('Sample Lead20'), user_id('Test Buyer01'), 'new', county_bid_amount(user_id('Test Buyer01'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000422', lead_id('Sample Lead21'), user_id('Test Buyer01'), 'new', county_bid_amount(user_id('Test Buyer01'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000423', lead_id('Sample Lead22'), user_id('Test Buyer01'), 'new', county_bid_amount(user_id('Test Buyer01'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '1 day', true),
    ('123e4567-e89a-12d3-b456-226600000424', lead_id('Sample Lead23'), user_id('Test Buyer01'), 'new', county_bid_amount(user_id('Test Buyer01'), county_id('Miami-Dade, FL')), null, NOW() - INTERVAL '1 day', true);

-- After 72 hours a transaction is created for each buyer_lead
-- created = buyer_lead.sent_date + 3 days
INSERT INTO transactions (id, user_id, buyer_leads_id, amount, type, refers_to_transaction_id, created, charge_date, stripe_transaction_id, credit_card_charged)
VALUES
    ('123e4567-e89a-12d3-b456-226600000522', user_id('Test Buyer02'), buyer_lead_id('Sample Lead18'), buyer_lead_price('Sample Lead18'), 'lead-assign', null, NOW() + INTERVAL '19 min', NOW(), null, 'not-applicable'),
    ('123e4567-e89a-12d3-b456-226600000523', user_id('Test Buyer01'), buyer_lead_id('Sample Lead20'), buyer_lead_price('Sample Lead20'), 'lead-charge', null, NOW() + INTERVAL '20 min', NOW() + INTERVAL '3 days', null, 'pending'),
    ('123e4567-e89a-12d3-b456-226600000524', user_id('Test Buyer01'), buyer_lead_id('Sample Lead21'), buyer_lead_price('Sample Lead21'), 'lead-charge', null, NOW() + INTERVAL '21 min', NOW() + INTERVAL '3 days', null, 'pending');


-- 9. Create disputes
INSERT INTO disputes (id, buyer_lead_id, status, dispute_reason, dispute_date)
VALUES
    ('123e4567-e89a-12d3-b456-226600000607', buyer_lead_id('Sample Lead18'), 'Pending', 'The price is too high', NOW()), -- dispute_date = buyer_lead.sent_date + 5 days
    ('123e4567-e89a-12d3-b456-226600000608', buyer_lead_id('Sample Lead21'), 'Pending', 'The price is too high', NOW());

-- TODO NS7.2 insert buyer_leads, transactions for those, disputes
