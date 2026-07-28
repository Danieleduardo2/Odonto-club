import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VERIFY_TOKEN = "odontoclub_secreto_2026";

// Función auxiliar para registrar logs
async function logWebhook(payload: any, errorMsg: string | null = null) {
  try {
    await supabase.from('webhook_logs').insert([{ payload, error_message: errorMsg }]);
  } catch (e) {
    console.error("No se pudo guardar el log", e);
  }
}

// 1. ENDPOINT GET: Meta lo usa para verificar
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Función auxiliar para enviar mensajes de texto por WhatsApp
async function sendWhatsAppMessage(toPhone: string, text: string) {
  const { data: settingsData } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['whatsapp_access_token', 'whatsapp_phone_id']);
    
  let accessToken = "";
  let phoneId = "";
  settingsData?.forEach(s => {
    if (s.key === 'whatsapp_access_token') accessToken = s.value;
    if (s.key === 'whatsapp_phone_id') phoneId = s.value;
  });

  if (!accessToken || !phoneId) return false;

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: text }
    })
  });
  
  const responseData = await res.json();
  if (!res.ok) {
    await logWebhook({ action: "send_message_error", response: responseData }, `Error enviando a ${toPhone}`);
  }
  return res.ok;
}

// 2. ENDPOINT POST: El Cerebro del Bot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the entire incoming payload to debug
    await logWebhook(body);
    
    if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const fromNumber = message.from; 
      let msgText = message.type === "text" ? message.text.body : "";
      
      // Check if it's an interactive button reply
      if (message.type === "interactive" && message.interactive?.button_reply) {
        msgText = message.interactive.button_reply.title;
      }

      if (!msgText) {
         return NextResponse.json({ status: "success" }); // Ignore audio/images for now
      }

      // 1. Obtener la sesión del usuario o crear una nueva
      let { data: session } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('phone_number', fromNumber)
        .single();

      if (!session) {
        // Buscar si el número ya existe en pacientes
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('phone_number', fromNumber)
          .single();

        const newSession = {
          phone_number: fromNumber,
          patient_id: patient ? patient.id : null,
          step: 'greeting',
          context_data: {}
        };
        
        const { data: createdSession } = await supabase
          .from('whatsapp_sessions')
          .insert([newSession])
          .select()
          .single();
          
        session = createdSession;
      }

      // 2. Lógica de la Máquina de Estados (El flujo del bot)
      const currentStep = session.step;

      if (currentStep === 'greeting') {
        if (!session.patient_id) {
          await sendWhatsAppMessage(fromNumber, "¡Hola! Bienvenido a OdontoClub 🦷. Para ayudarte a agendar, ¿me podrías decir tu nombre y apellido?");
          await supabase.from('whatsapp_sessions').update({ step: 'asking_name' }).eq('phone_number', fromNumber);
        } else {
          await sendWhatsAppMessage(fromNumber, "¡Hola de nuevo! 👋 Soy el asistente virtual de OdontoClub. Por favor dime qué día te gustaría agendar tu próxima cita (ej. Mañana, el Lunes, el 15 de Agosto).");
          await supabase.from('whatsapp_sessions').update({ step: 'choosing_date' }).eq('phone_number', fromNumber);
        }
      } 
      
      else if (currentStep === 'asking_name') {
        // Guardar nuevo paciente
        const nameParts = msgText.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

        const { data: newPatient } = await supabase
          .from('patients')
          .insert([{ first_name: firstName, last_name: lastName, phone_number: fromNumber }])
          .select()
          .single();

        await sendWhatsAppMessage(fromNumber, `¡Gracias ${firstName}! Ya estás registrado. ¿Qué día te gustaría agendar tu cita?`);
        await supabase.from('whatsapp_sessions').update({ step: 'choosing_date', patient_id: newPatient.id }).eq('phone_number', fromNumber);
      }

      else if (currentStep === 'choosing_date') {
        // Aquí conectaremos luego la lógica de disponibilidad. Por ahora, mock.
        const requestedDate = msgText;
        await sendWhatsAppMessage(fromNumber, `Perfecto, para el día ${requestedDate} tengo disponibilidad a las 10:00 AM y a las 3:00 PM. ¿Cuál prefieres?`);
        await supabase.from('whatsapp_sessions').update({ 
          step: 'choosing_time', 
          context_data: { date: requestedDate } 
        }).eq('phone_number', fromNumber);
      }

      else if (currentStep === 'choosing_time') {
        const requestedTime = msgText;
        
        // Crear la cita en Supabase
        await supabase.from('appointments').insert([{
          patient_id: session.patient_id,
          appointment_date: new Date().toISOString().split('T')[0], // Dummy date for now
          appointment_time: '10:00:00', // Dummy time
          reason: 'Control (WhatsApp)',
          status: 'scheduled'
        }]);

        await sendWhatsAppMessage(fromNumber, `¡Listo! 🎉 Tu cita ha sido confirmada para las ${requestedTime}. ¡Te esperamos!`);
        
        // Reiniciar la sesión
        await supabase.from('whatsapp_sessions').update({ step: 'greeting', context_data: {} }).eq('phone_number', fromNumber);
      }

    }
    
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook POST Error:", error);
    await logWebhook(null, error.message || String(error));
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
