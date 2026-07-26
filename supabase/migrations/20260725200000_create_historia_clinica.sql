-- Update patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS contacto_emergencia TEXT,
ADD COLUMN IF NOT EXISTS obra_social TEXT;

-- Create historia_clinica table
CREATE TABLE IF NOT EXISTS public.historia_clinica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE NOT NULL,
    alergias TEXT,
    medicacion_actual TEXT,
    enfermedades_sistemicas TEXT,
    habitos TEXT,
    notas_generales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.historia_clinica ENABLE ROW LEVEL SECURITY;

-- Temporarily allow all authenticated users (to be refined in Phase 4)
CREATE POLICY "Permitir todo a usuarios autenticados en historia clinica" 
ON public.historia_clinica FOR ALL 
USING (auth.role() = 'authenticated');
