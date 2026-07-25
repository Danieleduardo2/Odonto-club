-- Supabase SQL Schema for Dental Clinic

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients Table
CREATE TABLE public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL, -- Format: +1234567890 (for WhatsApp)
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Appointments Table
CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    whatsapp_message_id TEXT, -- To track the Meta API message ID if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Settings Table (for clinic configurations, WhatsApp templates, available hours, etc.)
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert Default Settings
INSERT INTO public.settings (key, value) VALUES (
    'clinic_hours', 
    '{"start": "09:00", "end": "18:00", "interval_minutes": 30}'::jsonb
);

-- Row Level Security (RLS) setup (Optional for now, assuming server-side admin access)
-- ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
