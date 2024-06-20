-- Add unique constraints to the 'leads' table
ALTER TABLE public.leads
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_phone UNIQUE (phone),
ADD CONSTRAINT unique_address UNIQUE (address);