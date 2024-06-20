drop trigger if exists "update_budgets_changetimestamp" on "public"."budgets";

alter table "public"."budgets" drop constraint "budgets_county_id_fkey";

alter table "public"."budgets" drop constraint "budgets_user_id_fkey";

alter table "public"."budgets" drop constraint "budget_pkey";

drop index if exists "public"."budget_pkey";

drop table "public"."budgets";

create table "public"."county_bids" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "county_id" uuid,
    "bid_amount" bigint,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);


-- CREATE UNIQUE INDEX budget_pkey ON public.county_bids USING btree (id);
--
-- alter table "public"."county_bids" add constraint "budget_pkey" PRIMARY KEY using index "budget_pkey";

alter table "public"."county_bids" add constraint "budgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

-- alter table "public"."county_bids" validate constraint "budgets_user_id_fkey";

alter table "public"."county_bids" add constraint "county_bids_county_id_fkey" FOREIGN KEY (county_id) REFERENCES counties(id) not valid;

alter table "public"."county_bids" validate constraint "county_bids_county_id_fkey";

-- CREATE TRIGGER update_budgets_changetimestamp BEFORE UPDATE ON public.county_bids FOR EACH ROW EXECUTE FUNCTION update_budgets_changetimestamp();