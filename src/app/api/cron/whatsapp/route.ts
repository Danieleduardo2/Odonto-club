import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to replace variables in template
const replaceTemplateVars = (template: string, vars: string[]) => {
  let result = template;
  vars.forEach((v, i) => {
    result = result.replace(`{{${i + 1}}}`, v);
  });
  return result;
};

export async function GET(request: Request) {
  // This endpoint is meant to be called by a cron job
  // We can add a simple authorization header check here if needed for security
  
  try {
    // 1. Get settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['whatsapp_access_token', 'whatsapp_phone_id', 'whatsapp_template_name']);

    if (settingsError || !settingsData) {
      throw new Error('Could not fetch settings');
    }

    const settings: Record<string, string> = {};
    settingsData.forEach(s => settings[s.key] = s.value);

    const accessToken = settings.whatsapp_access_token;
    const phoneId = settings.whatsapp_phone_id;
    const templateName = settings.whatsapp_template_name || 'recordatorio_cita';

    if (!accessToken || !phoneId) {
      return NextResponse.json({ error: 'WhatsApp credentials not configured' }, { status: 400 });
    }

    // 2. Find appointments scheduled for TOMORROW
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        reason,
        status,
        patient_id,
        patients (
          first_name,
          last_name,
          phone_number
        )
      `)
      .eq('appointment_date', tomorrowString)
      .eq('status', 'scheduled');

    if (apptError) {
      throw new Error('Error fetching appointments: ' + apptError.message);
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: 'No appointments for tomorrow' });
    }

    const results = [];

    // 3. Send WhatsApp message for each appointment
    for (const appt of appointments) {
      // Supabase sometimes types the relation as an array depending on schema introspection
      const patientData: any = appt.patients;
      const patient = Array.isArray(patientData) ? patientData[0] : patientData;
      
      if (!patient || !patient.phone_number) continue;

      // Format phone number (remove +, spaces, dashes)
      let phone = patient.phone_number.replace(/\D/g, '');
      
      // Basic validation (length, etc. could be added here)
      if (phone.length < 10) continue;

      // Format time (remove seconds)
      const timeStr = appt.appointment_time.substring(0, 5);

      const variables = [
        patient.first_name,
        timeStr,
        appt.reason
      ];

      // Call Meta API
      const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es'
            },
            components: [
              {
                type: 'body',
                parameters: variables.map(v => ({
                  type: 'text',
                  text: v
                }))
              }
            ]
          }
        })
      });

      const metaData = await metaResponse.json();
      
      results.push({
        appointmentId: appt.id,
        phone: phone,
        success: metaResponse.ok,
        metaResponse: metaData
      });
    }

    return NextResponse.json({
      message: `Processed ${appointments.length} appointments`,
      results
    });

  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
