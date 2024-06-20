-- 0. Determine deployment date
-- 1. Create counties
-- 2. Create subscription_levels
-- 3. Create label_colors
-- 4. Create users
-- 5. Create subscriptions
-- 6. Create county_bids
-- 7. Create leads
-- 8. Create buyer_leads
-- 9. Create disputes
-- 10. Create transactions

-- Table Name	Table Number
-- auth.users	1
-- users	2
-- leads	3
-- buyer_leads	4
-- transactions	5
-- disputes	6
-- subscriptions	7
-- county_bids	8
-- subscription_levels	9
-- label_colors	10
-- counties	11
-- lead_labels	12

DO $$

BEGIN
-- DEPLOYMENT DATA
        BEGIN -- INSERT COUNTIES
            -- 1. Create counties (created = NOW()) <= use the above variable
            INSERT INTO counties (id, name, state, population)
            VALUES
                ('123e4567-e89a-12d3-b456-226600001101', 'El Paso', 'TX', 868763),
                ('123e4567-e89a-12d3-b456-226600001102', 'El Paso', 'CO', 740567),
                ('123e4567-e89a-12d3-b456-226600001103', 'Clark', 'NV', 2266715),
                ('123e4567-e89a-12d3-b456-226600001104', 'St. Lucie', 'FL', 328297),
                ('123e4567-e89a-12d3-b456-226600001105', 'Fresno', 'CA', 1015190),
                ('123e4567-e89a-12d3-b456-226600001106', 'Broward', 'FL', 1947026),
                ('123e4567-e89a-12d3-b456-226600001107', 'Miami-Dade', 'FL', 2673837);
        END; -- INSERTCOUNTIES

        BEGIN -- INSERTSUBSCRIPTIONLEVELS
            -- 2. Create subscription_levels (created = deployment date)
            INSERT INTO subscription_levels (id, level, charge, credit)
            VALUES
                ('123e4567-e89a-12d3-b456-226600000901', 'gold', 1000, 2000),
                ('123e4567-e89a-12d3-b456-226600000902', 'silver', 500, 800),
                ('123e4567-e89a-12d3-b456-226600000903', 'bronze', 100, 200);
        END; -- INSERTSUBSCRIPTIONLEVELS

        BEGIN -- INSERTLABELCOLORS
            -- 3. Create label_colors
            -- inserting label_colors
            INSERT INTO label_colors (id, color, name, color_text)
            VALUES
              --Green
              ('123e4567-e89a-12d3-b456-226600001001', '#61BD4F', 'Green', '#ffffff'),
              --Yellow
              ('123e4567-e89a-12d3-b456-226600001002', '#F2D600', 'Yellow', '#000000'),
              --Orange
              ('123e4567-e89a-12d3-b456-226600001003', '#FF9F1A', 'Orange', '#ffffff'),
              --Red
              ('123e4567-e89a-12d3-b456-226600001004', '#EB5A46', 'Red', '#ffffff'),
              --Purple
              ('123e4567-e89a-12d3-b456-226600001005', '#C377E0', 'Purple', '#ffffff'),
              --Blue
              ('123e4567-e89a-12d3-b456-226600001006', '#0079BF', 'Blue', '#ffffff'),
              --Sky Blue
              ('123e4567-e89a-12d3-b456-226600001007', '#00C2E0', 'Sky Blue', '#000000'),
              --Lime Green
              ('123e4567-e89a-12d3-b456-226600001008', '#51E898', 'Lime Green', '#000000'),
              --Pink
              ('123e4567-e89a-12d3-b456-226600001009', '#FF78CB', 'Pink', '#ffffff'),
              --Purple
              ('123e4567-e89a-12d3-b456-226600001010', '#6E5DC6', 'Purple', '#ffffff'),
              --Lime Bolder
              ('123e4567-e89a-12d3-b456-226600001011', '#4C6B1F', 'Lime Bolder', '#000000');
        END; -- INSERTLABELCOLORS

        BEGIN -- SIGNUPINSERTUSERSBLOCK

            BEGIN -- INSERTAUTHUSERS
                -- 4. Create users (created_at = deployment date, updated_at = deployment date)
                INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
                confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new,
                email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
                is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token,
                phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until,
                reauthentication_token, reauthentication_sent_at, is_sso_user)
                -- test1@flavor8.com / foobah1234 (buyer)
                VALUES
                    ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000101', 'authenticated', 'authenticated',
                    'test1@flavor8.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', NOW(),
                    NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                    NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
                    -- zequi4real@gmail.com / foobah1234 (admin)
                    ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000102', 'authenticated', 'authenticated',
                    'zequi4real@gmail.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', NOW(),
                    NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                    NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
                    -- zequi@sellmethehouse.com / foobah1234 (buyer)
                    ('00000000-0000-0000-0000-000000000000', '123e4567-e89a-12d3-b456-226600000103', 'authenticated', 'authenticated',
                    'zequi@sellmethehouse.com', '$2a$10$sBzl26chOVAX51kMMXBJz.Mh5CV7Jyzcsge1nZqVIDPIqnXJsvDBG', NOW(),
                    NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL,
                    NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false);
            END; -- INSERTAUTHUSERS

            BEGIN -- DELETEUSERS
                -- TODO remove this ONCE WE REMOVE TRIGGER FROM DB
                DELETE FROM users
                WHERE auth IN (
                    '123e4567-e89a-12d3-b456-226600000101',
                    '123e4567-e89a-12d3-b456-226600000102',
                    '123e4567-e89a-12d3-b456-226600000103'
                );
            END; -- DELETEUSERS

            BEGIN -- INSERTUSERS
                INSERT INTO users (auth, id, role, email, name, stripe_customer_id, stripe_payment_method_id, monthly_budget, phone, current_balance)
                VALUES
                    ('123e4567-e89a-12d3-b456-226600000102', '123e4567-e89a-12d3-b456-226600000200', 'admin', 'zequi4real@gmail.com', 'Zequi Admin', null, null, 0, 5611234567, 0),
                    ('123e4567-e89a-12d3-b456-226600000101', '123e4567-e89a-12d3-b456-226600000201', 'buyer', 'test1@flavor8.com', 'John Buyer','cus_OpyG9tsN8TLqY2','pm_1O2IKBHEBdwrnrVKkPafKT2T', 1500, 9704132206, 0),
                    ('123e4567-e89a-12d3-b456-226600000103', '123e4567-e89a-12d3-b456-226600000203', 'buyer', 'zequi@sellmethehouse.com', 'Zequi Buyer','cus_OoOwExdmSt7Y4f','card_1O0mAzHEBdwrnrVKYNszG2bq', 1500, 5611234567, 0);
            END; -- INSERTUSERS

        END; -- SIGNUPINSERTUSERSBLOCK


END $$;
