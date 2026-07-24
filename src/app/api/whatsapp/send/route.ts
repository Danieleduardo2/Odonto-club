import { NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function POST(request: Request) {
  try {
    const { to_phone_number, patient_name, available_slots } = await request.json();

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json({ error: 'WhatsApp config missing' }, { status: 500 });
    }

    // Convert available_slots to WhatsApp Interactive List format
    const rows = available_slots.map((slot: any, index: number) => ({
      id: `slot_${index}`, // We should probably pass real IDs or timestamps
      title: slot.time,
      description: `Turno disponible el ${slot.date}`
    })).slice(0, 10); // Meta limits lists to 10 rows

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to_phone_number,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "Agenda tu cita"
        },
        body: {
          text: `Hola ${patient_name}, es momento de agendar tu próxima visita odontológica. Por favor selecciona un horario de la lista.`
        },
        footer: {
          text: "OdontoClub"
        },
        action: {
          button: "Ver Horarios",
          sections: [
            {
              title: "Horarios Disponibles",
              rows: rows
            }
          ]
        }
      }
    };

    const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
