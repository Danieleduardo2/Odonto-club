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
          button: buttonText.substring(0, 20),
          sections: [
            {
              title: listTitle.substring(0, 24),
              rows: options.map(opt => ({ id: opt.id.substring(0, 200), title: opt.title.substring(0, 24) }))
            }
          ]
        }
      }
    })
  });
  
  if (!res.ok) await logWebhook({ action: "send_list_error", response: await res.json() }, `Error enviando lista a ${toPhone}`);
  return res.ok;
}

function formatShortDate(d: Date) {
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${daysOfWeek[d.getUTCDay()]} ${d.getUTCDate()} de ${months[d.getUTCMonth()]}`;
}

function generateNextDays(startDateStr: string | null) {
  const days: {id: string, title: string, date: string}[] = [];
  let current: Date;
  if (startDateStr) {
    current = new Date(`${startDateStr}T12:00:00Z`);
  } else {
    current = new Date();
    current.setUTCHours(12, 0, 0, 0);
    current.setUTCDate(current.getUTCDate() + 1); // Empezar desde mañana
  }

  while (days.length < 5) {
    if (current.getUTCDay() !== 0) { // Saltar domingos
      const isoDate = current.toISOString().split('T')[0];
      days.push({ id: `date_${isoDate}`, title: formatShortDate(current), date: isoDate });
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  
  const nextWeekIso = current.toISOString().split('T')[0];
  days.push({ id: `next_week_${nextWeekIso}`, title: "Siguiente semana ➡️", date: nextWeekIso });
  return days;
}

function generateNextTimes(startIndex: number = 0) {
  const allTimes = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const dbTimes = ["08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"];
  
  const times: {id: string, title: string}[] = [];
  let i = startIndex;
  while (times.length < 5 && i < allTimes.length) {
    times.push({ id: `time_${dbTimes[i]}_${i}`, title: allTimes[i] });
    i++;
  }
  if (i < allTimes.length) times.push({ id: `more_times_${i}`, title: "Ver más horarios ➡️" });
  else times.push({ id: `more_times_0`, title: "Volver a 8:00 AM 🔄" });
  return times;
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
      let interactiveId = "";
      if (message.type === "interactive") {
        if (message.interactive?.button_reply) {
          msgText = message.interactive.button_reply.title;
          interactiveId = message.interactive.button_reply.id;
        } else if (message.interactive?.list_reply) {
          msgText = message.interactive.list_reply.title;
          interactiveId = message.interactive.list_reply.id;
        }
      }

      if (!msgText && !interactiveId) return NextResponse.json({ status: "success" }); 

      // 1. Obtener o crear sesion
      let { data: session } = await supabase.from('whatsapp_sessions').select('*').eq('phone_number', fromNumber).maybeSingle();

      if (!session) {
        const { data: patient } = await supabase.from('patients').select('id').eq('phone_number', fromNumber).maybeSingle();
        const newSession = { phone_number: fromNumber, patient_id: patient ? patient.id : null, step: 'greeting', context_data: {} };
        const { data: createdSession } = await supabase.from('whatsapp_sessions').insert([newSession]).select().single();
        session = createdSession;
      }

      const currentStep = session.step;
      const loweredMsg = msgText.toLowerCase();

      // Botones proactivos globales
      if (interactiveId.toLowerCase().includes("posponer") || loweredMsg.includes("posponer") || loweredMsg.includes("más tarde")) {
         await sendWhatsAppMessage(fromNumber, "Entendido, te enviaré un recordatorio mañana. ¡Que tengas un excelente día! 👋", incomingPhoneId);
         await supabase.from('whatsapp_sessions').update({ step: 'postponed', context_data: {} }).eq('phone_number', fromNumber);
         return NextResponse.json({ status: "success" });
      }

      // Inicio del flujo de agendamiento
      if (currentStep === 'greeting' || interactiveId.toLowerCase().includes("agendar") || loweredMsg.includes("agendar") || loweredMsg.includes("hola")) {
        if (!session.patient_id) {
          await sendWhatsAppMessage(fromNumber, "¡Hola! Bienvenido a OdontoClub 🦷. Para ayudarte a agendar, ¿me podrías decir tu nombre y apellido?", incomingPhoneId);
          await supabase.from('whatsapp_sessions').update({ step: 'asking_name' }).eq('phone_number', fromNumber);
        } else {
          const days = generateNextDays(null);
          await sendWhatsAppList(fromNumber, "¡Perfecto! Selecciona el día que mejor te quede:", "Ver fechas", "Días Disponibles", days, incomingPhoneId);
          await supabase.from('whatsapp_sessions').update({ step: 'choosing_date', context_data: {} }).eq('phone_number', fromNumber);
        }
      } 
      
      // Registro de nombre (nuevo paciente)
      else if (currentStep === 'asking_name') {
        const nameParts = msgText.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

        const { data: newPatient } = await supabase.from('patients').insert([{ first_name: firstName, last_name: lastName, phone_number: fromNumber }]).select().single();

        const days = generateNextDays(null);
        await sendWhatsAppList(fromNumber, `¡Gracias ${firstName}! Ya estás registrado. ¿Qué día te gustaría agendar tu cita?`, "Ver fechas", "Días Disponibles", days, incomingPhoneId);
        await supabase.from('whatsapp_sessions').update({ step: 'choosing_date', patient_id: newPatient.id }).eq('phone_number', fromNumber);
      }

      // Selección de día
      else if (currentStep === 'choosing_date') {
        if (interactiveId.startsWith("next_week_")) {
           const startDateStr = interactiveId.replace("next_week_", "");
           const days = generateNextDays(startDateStr);
           await sendWhatsAppList(fromNumber, "Aquí tienes más fechas disponibles:", "Ver fechas", "Siguientes Días", days, incomingPhoneId);
        } else if (interactiveId.startsWith("date_") || msgText) {
           const selectedDate = interactiveId.startsWith("date_") ? interactiveId.replace("date_", "") : new Date().toISOString().split('T')[0];
           const times = generateNextTimes(0);
           await sendWhatsAppList(fromNumber, `Has seleccionado el ${msgText}. ¿A qué hora prefieres?`, "Ver horarios", "Horarios Disponibles", times, incomingPhoneId);
           await supabase.from('whatsapp_sessions').update({ step: 'choosing_time', context_data: { date: selectedDate } }).eq('phone_number', fromNumber);
        }
      }

      // Selección de hora y guardado de cita
      else if (currentStep === 'choosing_time') {
        if (interactiveId.startsWith("more_times_")) {
           const nextIdx = parseInt(interactiveId.replace("more_times_", ""), 10);
           const times = generateNextTimes(nextIdx);
           await sendWhatsAppList(fromNumber, "Aquí tienes más horarios:", "Ver horarios", "Horarios", times, incomingPhoneId);
        } else if (interactiveId.startsWith("time_") || msgText) {
           let timeDb = "10:00:00";
           if (interactiveId.startsWith("time_")) {
             timeDb = interactiveId.split("_")[1];
           }
           const selectedDate = session.context_data.date;
           
           try {
             const { error } = await supabase.from('appointments').insert([{
               patient_id: session.patient_id,
               appointment_date: selectedDate,
               appointment_time: timeDb,
               reason: 'Agendamiento por WhatsApp',
               status: 'scheduled'
             }]);

             if (error) throw error;

             await sendWhatsAppMessage(fromNumber, `¡Listo! 🎉 Tu cita ha sido confirmada para el ${selectedDate} a las ${msgText}. ¡Te esperamos en OdontoClub!`, incomingPhoneId);
             await supabase.from('whatsapp_sessions').update({ step: 'greeting', context_data: {} }).eq('phone_number', fromNumber);
           } catch(e) {
             console.error("DB Error al guardar cita", e);
             await sendWhatsAppMessage(fromNumber, `Hubo un problema guardando tu cita. Por favor comunícate al número 3017729542 para agendar de forma específica.`, incomingPhoneId);
           }
        }
      }

    }
    
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook POST Error:", error);
    await logWebhook(null, error.message || String(error));
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
