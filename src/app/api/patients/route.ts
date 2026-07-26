import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      first_name, last_name, phone_number, email, notes,
      fecha_nacimiento, direccion, contacto_emergencia, obra_social
    } = body;

    const { data, error } = await supabase
      .from('patients')
      .insert([
        { 
          first_name, last_name, phone_number, email, notes,
          fecha_nacimiento: fecha_nacimiento || null,
          direccion: direccion || null,
          contacto_emergencia: contacto_emergencia || null,
          obra_social: obra_social || null
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
