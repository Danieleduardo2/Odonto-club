-- Crear tabla para los metadatos de las imágenes
CREATE TABLE IF NOT EXISTS public.documentos_paciente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Imagen',
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS temporalmente para desarrollo (acceso anónimo)
ALTER TABLE public.documentos_paciente DISABLE ROW LEVEL SECURITY;

-- Nota: El bucket de Storage "documentos" debe crearse manualmente en la interfaz de Supabase o 
-- mediante el siguiente comando SQL si se tienen permisos en el esquema storage:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true) ON CONFLICT DO NOTHING;
-- CREATE POLICY "Permitir select" ON storage.objects FOR SELECT USING (bucket_id = 'documentos');
-- CREATE POLICY "Permitir insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos');
