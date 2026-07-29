-- Add price column to treatments
ALTER TABLE public.treatments
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
