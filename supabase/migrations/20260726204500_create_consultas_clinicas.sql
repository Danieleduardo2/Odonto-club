-- Crear tabla de consultas clinicas
CREATE TABLE IF NOT EXISTS public.consultas_clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    motivo_consulta TEXT NOT NULL,
    procedimiento_realizado TEXT,
    notas_doctor TEXT,
    costo_total NUMERIC DEFAULT 0,
    monto_pagado NUMERIC DEFAULT 0,
    estado_pago TEXT GENERATED ALWAYS AS (
        CASE
            WHEN costo_total = 0 THEN 'Cortesía'
            WHEN monto_pagado >= costo_total THEN 'Pagado'
            ELSE 'Pendiente'
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS temporalmente deshabilitado para desarrollo
ALTER TABLE public.consultas_clinicas DISABLE ROW LEVEL SECURITY;
