import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VERIFY_TOKEN = "odontoclub_secreto_2026";

async function logWebhook(payload: any, errorMsg: string | null = null) {
  try {
    await supabase.from('webhook_logs').insert([{ payload, error_message: errorMsg }]);
  } catch (e) {
    console.error("No se pudo guardar el log", e);
  }
}

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

async function getAccessToken() {
  const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'whatsapp_access_token').maybeSingle();
  return settingsData?.value;
}

async function sendWhatsAppMessage(toPhone: string, text: string, incomingPhoneId: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const res = await fetch(`https://graph.facebook.com/v19.0/${incomingPhoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: toPhone, type: 'text', text: { body: text } })
  });
  
  if (!res.ok) await logWebhook({ action: "send_message_error", response: await res.json() }, `Error enviando a ${toPhone}`);
  return res.ok;
}

async function sendWhatsAppList(toPhone: string, bodyText: string, buttonText: string, listTitle: string, options: {id: string, title: string}[], incomingPhoneId: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const res = await fetch(`https://graph.facebook.com/v19.0/${incomingPhoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: "individual",
      to: toPhone,
      type: 'interactive',
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections: [
            {
              title: listTitle,
              rows: options.map(opt => ({ id: opt.id, title: opt.title }))
            }
          ]
        }
      }
    })
  });
  
  if (!res.ok) await logWebhook({ action: "send_list_error", response: await res.json() }, `Error enviando lista a ${toPhone}`);
  return res.ok;
}

async function sendWhatsAppButtons(toPhone: string, bodyText: string, buttons: {id: string, title: string}[], incomingPhoneId: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const res = await fetch(`https://graph.facebook.com/v19.0/${incomingPhoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: "individual",
      to: toPhone,
      type: 'interactive',
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map(btn => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title }
          }))
        }
      }
    })
  });
  
  if (!res.ok) await logWebhook({ action: "send_buttons_error", response: await res.json() }, `Error enviando botones a ${toPhone}`);
  return res.ok;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    await logWebhook(body);
    
    if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const metadata = body.entry[0].changes[0].value.metadata;
      const incomingPhoneId = metadata?.phone_number_id;
      const message = body.entry[0].changes[0].value.messages[0];
      const fromNumber = message.from; 
      
      let msgText = message.type === "text" ? message.text.body : "";
      if (message.type === "interactive") {
        if (message.interactive?.button_reply) {
          msgText = message.interactive.button_reply.title;
        } else if (message.interactive?.list_reply) {
          msgText = message.interactive.list_reply.title;
        }
      }

      if (!msgText) {
         return NextResponse.json({ status: "success" }); 
      }

      let { data: session } = await supabase.from('whatsapp_sessions').select('*').eq('phone_number', fromNumber).maybeSingle();

      if (!session) {
        const { data: patient } = await supabase.from('patients').select('id').eq('phone_number', fromNumber).maybeSingle();
        const newSession = { phone_number: fromNumber, patient_id: patient ? patient.id : null, step: 'greeting', context_data: {} };
        const { data: createdSession } = await supabase.from('whatsapp_sessions').insert([newSession]).select().single();
        session = createdSession;
      }

      const currentStep = session.step;

      if (currentStep === 'greeting') {
        if (!session.patient_id) {
          await sendWhatsAppMessage(fromNumber, "¡Hola! Bienvenido a OdontoClub 🦷. Para ayudarte a agendar, ¿me podrías decir tu nombre y apellido?", incomingPhoneId);
          await supabase.from('whatsapp_sessions').update({ step: 'asking_name' }).eq('phone_number', fromNumber);
        } else {
          // Ya es paciente, iniciar flujo interactivo
          await sendWhatsAppList(
            fromNumber, 
            "¡Hola de nuevo! 👋 Soy el asistente virtual de OdontoClub. Por favor selecciona el día de esta semana que mejor te quede para tu cita:", 
            "Ver opciones", 
            "Días Disponibles", 
            [
              { id: "Lunes", title: "Lunes" },
              { id: "Martes", title: "Martes" },
              { id: "Miércoles", title: "Miércoles" },
              { id: "Jueves", title: "Jueves" },
              { id: "Viernes", title: "Viernes" }
            ], 
            incomingPhoneId
          );
          await supabase.from('whatsapp_sessions').update({ step: 'choosing_date' }).eq('phone_number', fromNumber);
        }
      } 
      
      else if (currentStep === 'asking_name') {
        const nameParts = msgText.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

        const { data: newPatient } = await supabase.from('patients').insert([{ first_name: firstName, last_name: lastName, phone_number: fromNumber }]).select().single();

        await sendWhatsAppList(
          fromNumber, 
          `¡Gracias ${firstName}! Ya estás registrado. ¿Qué día te gustaría agendar tu cita?`, 
          "Ver opciones", 
          "Días Disponibles", 
          [
            { id: "Lunes", title: "Lunes" },
            { id: "Martes", title: "Martes" },
            { id: "Miércoles", title: "Miércoles" },
            { id: "Jueves", title: "Jueves" },
            { id: "Viernes", title: "Viernes" }
          ], 
          incomingPhoneId
        );
        await supabase.from('whatsapp_sessions').update({ step: 'choosing_date', patient_id: newPatient.id }).eq('phone_number', fromNumber);
      }

      else if (currentStep === 'choosing_date') {
        const requestedDate = msgText;
        await sendWhatsAppButtons(
          fromNumber,
          `Perfecto, para el día ${requestedDate} tengo disponibilidad a estas horas. ¿Cuál prefieres?`,
          [
            { id: "10_00_AM", title: "10:00 AM" },
            { id: "03_00_PM", title: "3:00 PM" }
          ],
          incomingPhoneId
        );
        await supabase.from('whatsapp_sessions').update({ step: 'choosing_time', context_data: { date: requestedDate } }).eq('phone_number', fromNumber);
      }

      else if (currentStep === 'choosing_time') {
        const requestedTime = msgText;
        const requestedDate = session.context_data.date;
        
        await supabase.from('appointments').insert([{
          patient_id: session.patient_id,
          appointment_date: new Date().toISOString().split('T')[0], // En un entorno real se calcularía la fecha exacta
          appointment_time: requestedTime.includes("10") ? '10:00:00' : '15:00:00',
          reason: 'Control de Ortodoncia',
          status: 'scheduled'
        }]);

        await sendWhatsAppMessage(fromNumber, `¡Listo! 🎉 Tu cita ha sido confirmada para el ${requestedDate} a las ${requestedTime}. ¡Te esperamos en OdontoClub!`, incomingPhoneId);
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
