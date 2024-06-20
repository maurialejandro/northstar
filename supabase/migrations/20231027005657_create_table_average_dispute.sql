CREATE TABLE global_stats (
    name text PRIMARY KEY,
    value decimal(5, 3) NOT NULL,
    context jsonb,
    created TIMESTAMPTZ DEFAULT NOW(),
    modified TIMESTAMPTZ DEFAULT NOW()
);