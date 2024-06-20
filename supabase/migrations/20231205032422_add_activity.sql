CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('private', 'admin', 'user')),
  note TEXT NOT NULL,
  created timestamp with time zone default now(),
  modified timestamp with time zone default now(),
  deleted date
);