-- Add odontograma_estado JSONB column to historia_clinica
ALTER TABLE public.historia_clinica
ADD COLUMN IF NOT EXISTS odontograma_estado JSONB DEFAULT '{}'::jsonb;
