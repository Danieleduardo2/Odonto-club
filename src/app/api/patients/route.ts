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
      fecha_nacimiento, direccion, contacto_emergencia, obra_social,
      alergias, enfermedades_sistemicas, habitos, medicacion_actual, notas_generales
    } = body;

    // 1. Create Patient
    const { data: patientData, error: patientError } = await supabase
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

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    // 2. Create Clinical History
    if (patientData && patientData.id) {
      const { error: historyError } = await supabase
        .from('historia_clinica')
        .insert([{
          paciente_id: patientData.id,
          alergias: alergias || "",
          enfermedades_sistemicas: enfermedades_sistemicas || "",
          habitos: habitos || "",
          medicacion_actual: medicacion_actual || "",
          notas_generales: notas_generales || ""
        }]);
        
      if (historyError) {
         console.error("Failed to create history", historyError);
         // Even if history fails, we created the patient. We could return a partial error, 
         // but for simplicity, we'll return 201 with the patient data.
      }
    }

    return NextResponse.json(patientData, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
