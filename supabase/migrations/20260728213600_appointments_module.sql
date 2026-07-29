-- ==========================================
-- Módulo 2: Agenda de Citas y Tratamientos
-- ==========================================

-- 1. Tabla de Catálogo de Tratamientos
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    default_duration_minutes INTEGER NOT NULL DEFAULT 30,
    color_code TEXT DEFAULT '#3b82f6', -- Tailwind blue-500 por defecto
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.treatments DISABLE ROW LEVEL SECURITY;

-- 2. Modificar appointments para nuevos estados y campos
-- Primero eliminamos la restricción antigua (puede fallar si no existe, por eso usamos exception block o drop directo)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Añadimos la nueva restricción con in_progress y no_show
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'pending_scheduling'));

-- Añadimos las nuevas columnas a appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 3. Tabla de Bloqueos de Horario (Almuerzos, Vacaciones, Feriados)
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL, -- Ej: 'Almuerzo', 'Feriado'
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT false, -- Por si el almuerzo es todos los días
    recurrence_pattern TEXT, -- Ej: 'daily', 'weekly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.schedule_blocks DISABLE ROW LEVEL SECURITY;

-- 4. Tabla de Lista de Espera (Waitlist)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    preferred_days TEXT, -- Ej: 'Lunes en la mañana'
    notes TEXT,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'scheduled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Insertar Tratamientos Básicos de Ejemplo
INSERT INTO public.treatments (name, default_duration_minutes, color_code) VALUES
('Consulta General', 30, '#3b82f6'), -- blue
('Limpieza Dental', 40, '#10b981'), -- emerald
('Ortodoncia (Control)', 20, '#8b5cf6'), -- violet
('Endodoncia', 90, '#ef4444'), -- red
('Blanqueamiento', 60, '#f59e0b') -- amber
ON CONFLICT DO NOTHING;
