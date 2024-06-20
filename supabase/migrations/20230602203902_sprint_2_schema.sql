drop trigger if exists "update_user_leads_changetimestamp" on "public"."user_leads";

alter table "public"."user_leads" drop constraint "user_leads_lead_id_fkey";

alter table "public"."user_leads" drop constraint "user_leads_user_id_fkey";

alter table "public"."disputes" drop constraint "disputes_user_lead_id_fkey";

alter table "public"."user_leads" drop constraint "user_lead_pkey";

drop index if exists "public"."user_lead_pkey";

drop table "public"."user_leads";

alter table "public"."users" alter column "role" drop default;

alter type "public"."user_role" rename to "user_role__old_version_to_be_dropped";

create type "public"."user_role" as enum ('admin', 'user', 'buyer');

create table "public"."buyer_leads" (
    "id" uuid not null default gen_random_uuid(),
    "sent" boolean,
    "lead_id" uuid,
    "user_id" uuid,
    "sent_date" date,
    "workflow_state" character varying,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);


create table "public"."transactions" (
    "id" character varying not null,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date,
    "customer_id" character varying,
    "amount" bigint,
    "status" character varying default '''pending''::character varying'::character varying
);

-- Function for 'budgets' table
CREATE OR REPLACE FUNCTION update_transactions_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = now(); 
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_transactions_changetimestamp
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE PROCEDURE update_transactions_changetimestamp();

alter table "public"."users" alter column role type "public"."user_role" using role::text::"public"."user_role";

alter table "public"."users" alter column "role" set default 'buyer'::user_role;

drop type "public"."user_role__old_version_to_be_dropped";

alter table "public"."counties" alter column "name" set data type character varying using "name"::character varying;

alter table "public"."counties" alter column "state" set data type character varying using "state"::character varying;

alter table "public"."disputes" alter column "admin_message" set data type character varying using "admin_message"::character varying;

alter table "public"."disputes" alter column "dispute_reason" set data type character varying using "dispute_reason"::character varying;

alter table "public"."disputes" alter column "workflow_state" set data type character varying using "workflow_state"::character varying;

alter table "public"."leads" add column "buyer" uuid;

alter table "public"."leads" alter column "address" set data type character varying using "address"::character varying;

alter table "public"."leads" alter column "admin_note" set data type character varying using "admin_note"::character varying;

alter table "public"."leads" alter column "buyer_note" set data type character varying using "buyer_note"::character varying;

alter table "public"."leads" alter column "city" set data type character varying using "city"::character varying;

alter table "public"."leads" alter column "county" set data type character varying using "county"::character varying;

alter table "public"."leads" alter column "email" set data type character varying using "email"::character varying;

alter table "public"."leads" alter column "lead_type" set data type character varying using "lead_type"::character varying;

alter table "public"."leads" alter column "name" set data type character varying using "name"::character varying;

alter table "public"."leads" alter column "phone" set data type character varying using "phone"::character varying;

alter table "public"."leads" alter column "private_note" set data type character varying using "private_note"::character varying;

alter table "public"."leads" alter column "state" set data type character varying using "state"::character varying;

alter table "public"."leads" alter column "zip_code" set data type character varying using "zip_code"::character varying;

alter table "public"."users" add column "stripe_payment_method_id" character varying;

alter table "public"."users" alter column "current_balance" set default '0'::bigint;

alter table "public"."users" alter column "current_balance" set data type bigint using "current_balance"::bigint;

alter table "public"."users" alter column "email" set data type character varying using "email"::character varying;

alter table "public"."users" alter column "name" set data type character varying using "name"::character varying;

alter table "public"."users" alter column "phone" set data type character varying using "phone"::character varying;

alter table "public"."users" alter column "stripe_customer_id" set data type character varying using "stripe_customer_id"::character varying;

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX user_lead_pkey ON public.buyer_leads USING btree (id);

alter table "public"."buyer_leads" add constraint "user_lead_pkey" PRIMARY KEY using index "user_lead_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."buyer_leads" add constraint "buyer_leads_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) not valid;

alter table "public"."buyer_leads" validate constraint "buyer_leads_lead_id_fkey";

alter table "public"."buyer_leads" add constraint "buyer_leads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."buyer_leads" validate constraint "buyer_leads_user_id_fkey";

alter table "public"."leads" add constraint "leads_buyer_fkey" FOREIGN KEY (buyer) REFERENCES users(id) not valid;

alter table "public"."leads" validate constraint "leads_buyer_fkey";

alter table "public"."disputes" add constraint "disputes_user_lead_id_fkey" FOREIGN KEY (user_lead_id) REFERENCES buyer_leads(id) not valid;

alter table "public"."disputes" validate constraint "disputes_user_lead_id_fkey";

CREATE TRIGGER update_user_leads_changetimestamp BEFORE UPDATE ON public.buyer_leads FOR EACH ROW EXECUTE FUNCTION update_user_leads_changetimestamp();


