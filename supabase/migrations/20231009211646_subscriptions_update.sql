-- Create the subscription_levels table
CREATE TABLE subscription_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(255) NOT NULL,
  charge BIGINT NOT NULL,
  credit BIGINT NOT NULL,
  "created" timestamp with time zone default now(),
  "modified" timestamp with time zone default now(),
  "deleted" timestamp with time zone
);

-- Add the subscription_level_id (fk) field to the subscriptions table & remove the monthly_amount field
ALTER TABLE subscriptions
ADD COLUMN subscription_level_id UUID NOT NULL REFERENCES subscription_levels(id),
DROP COLUMN monthly_amount,
ALTER COLUMN start_date TYPE timestamp with time zone,
ALTER COLUMN end_date TYPE timestamp with time zone;
