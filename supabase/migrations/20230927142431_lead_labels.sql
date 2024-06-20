-- Create the label_colors table
CREATE TABLE label_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- Create the lead_label table
CREATE TABLE lead_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color UUID REFERENCES label_colors(id) NOT NULL,
  text VARCHAR(255) NOT NULL,
  "created" timestamp with time zone default now(),
  "modified" timestamp with time zone default now(),
  "deleted" timestamp with time zone,
  "user_id" UUID REFERENCES users(id) NOT NULL
);

-- Add the lead_label_id field to the leads table
ALTER TABLE leads
ADD COLUMN lead_label_id UUID;

-- Add a foreign key constraint to reference the lead_label table
ALTER TABLE leads
ADD CONSTRAINT leads_lead_label_id_fkey
  FOREIGN KEY (lead_label_id)
  REFERENCES lead_labels(id);