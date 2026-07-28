-- Add 'pending_scheduling' to appointments status constraint
-- Drop the existing constraint first
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add the new constraint
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'pending_scheduling'));

-- Create WhatsApp Sessions table to hold bot state
CREATE TABLE public.whatsapp_sessions (
    phone_number TEXT PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    step TEXT NOT NULL DEFAULT 'greeting',
    context_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
