create table "public"."budgets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "county_id" uuid,
    "bid_amount" bigint,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);

create table "public"."counties" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "state" text,
    "population" bigint,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);


create table "public"."disputes" (
    "id" uuid not null default gen_random_uuid(),
    "user_lead_id" uuid,
    "dispute_date" date,
    "dispute_reason" text,
    "workflow_state" text,
    "admin_message" text,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);

create table "public"."leads" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "phone" text,
    "email" text,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "county" text,
    "county_id" uuid,
    "uploaded_by_user_id" uuid,
    "lead_type" text,
    "admin_note" text,
    "private_note" text,
    "buyer_note" text,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" timestamp with time zone
);

create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "type" text,
    "monthly_amount" bigint,
    "start_date" date,
    "end_date" date,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);

create table "public"."user_leads" (
    "id" uuid not null default gen_random_uuid(),
    "sent" boolean,
    "lead_id" uuid,
    "user_id" uuid,
    "sent_date" date,
    "workflow_state" text,
    "created" timestamp with time zone default now(),
    "modified" timestamp with time zone default now(),
    "deleted" date
);

-- maybe admin and superadmin instead of user or moderator
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'buyer');

CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text,
    "email" text,
    "phone" text,
    "current_balance" text,
    "stripe_customer_id" text,
    "role" user_role DEFAULT 'buyer',
    "auth" uuid,
    "created" timestamp with time zone DEFAULT now(),
    "modified" timestamp with time zone DEFAULT now(),
    "deleted" date
);



CREATE UNIQUE INDEX budget_pkey ON public.budgets USING btree (id);

CREATE UNIQUE INDEX county_pkey ON public.counties USING btree (id);

CREATE UNIQUE INDEX dispute_pkey ON public.disputes USING btree (id);

CREATE UNIQUE INDEX lead_pkey ON public.leads USING btree (id);

CREATE UNIQUE INDEX subscription_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX user_lead_pkey ON public.user_leads USING btree (id);

CREATE UNIQUE INDEX user_pkey ON public.users USING btree (id);

alter table "public"."budgets" add constraint "budget_pkey" PRIMARY KEY using index "budget_pkey";

alter table "public"."counties" add constraint "county_pkey" PRIMARY KEY using index "county_pkey";

alter table "public"."disputes" add constraint "dispute_pkey" PRIMARY KEY using index "dispute_pkey";

alter table "public"."leads" add constraint "lead_pkey" PRIMARY KEY using index "lead_pkey";

alter table "public"."subscriptions" add constraint "subscription_pkey" PRIMARY KEY using index "subscription_pkey";

alter table "public"."user_leads" add constraint "user_lead_pkey" PRIMARY KEY using index "user_lead_pkey";

alter table "public"."users" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."budgets" add constraint "budgets_county_id_fkey" FOREIGN KEY (county_id) REFERENCES counties(id) not valid;

alter table "public"."budgets" validate constraint "budgets_county_id_fkey";

alter table "public"."budgets" add constraint "budgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."budgets" validate constraint "budgets_user_id_fkey";

alter table "public"."disputes" add constraint "disputes_user_lead_id_fkey" FOREIGN KEY (user_lead_id) REFERENCES user_leads(id) not valid;

alter table "public"."disputes" validate constraint "disputes_user_lead_id_fkey";

alter table "public"."leads" add constraint "leads_county_id_fkey" FOREIGN KEY (county_id) REFERENCES counties(id) not valid;

alter table "public"."leads" validate constraint "leads_county_id_fkey";

alter table "public"."leads" add constraint "leads_uploaded_by_user_id_fkey" FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) not valid;

alter table "public"."leads" validate constraint "leads_uploaded_by_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."user_leads" add constraint "user_leads_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) not valid;

alter table "public"."user_leads" validate constraint "user_leads_lead_id_fkey";

alter table "public"."user_leads" add constraint "user_leads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."user_leads" validate constraint "user_leads_user_id_fkey";

alter table "public"."users" add constraint "users_auth_fkey" FOREIGN KEY (auth) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_fkey";

