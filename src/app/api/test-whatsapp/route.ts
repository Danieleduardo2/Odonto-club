import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Número de teléfono es requerido' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Las credenciales de WhatsApp no están configuradas en la base de datos' }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');

    // Call Meta API with test data
    const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'es'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: "Juan (Prueba)" },
                { type: 'text', text: "10:00 AM" },
                { type: 'text', text: "Limpieza Dental" }
              ]
            }
          ]
        }
      })
    });

    const metaData = await metaResponse.json();
    
    if (!metaResponse.ok) {
      return NextResponse.json({ error: 'Error de Meta API', details: metaData }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba enviado exitosamente',
      metaResponse: metaData
    });

  } catch (error: any) {
    console.error('Test API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
