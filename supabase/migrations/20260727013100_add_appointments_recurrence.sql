-- Update appointments table to support recurrence
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS intervalo_recurrencia TEXT,
ADD COLUMN IF NOT EXISTS consulta_origen_id UUID REFERENCES public.consultas_clinicas(id) ON DELETE SET NULL;

-- Disable RLS on appointments for development (if it was enabled)
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
