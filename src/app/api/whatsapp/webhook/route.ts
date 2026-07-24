import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// This handles the webhook verification from Meta
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

// This handles incoming messages from WhatsApp (when patient replies)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a WhatsApp status update or message
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const phone_number = body.entry[0].changes[0].value.contacts[0].wa_id;
        
        // Check if it's an interactive list reply
        if (message.type === 'interactive' && message.interactive.type === 'list_reply') {
          const selected_slot_id = message.interactive.list_reply.id;
          const selected_slot_title = message.interactive.list_reply.title;
          const selected_slot_desc = message.interactive.list_reply.description;

          // TODO: In a real app, you would parse the slot_id or description to get the exact date/time
          // and then update or create the appointment in Supabase.
          
          console.log(`El paciente ${phone_number} eligió: ${selected_slot_title} - ${selected_slot_desc}`);
          
          // Reply confirming the appointment
          // You would call your send API or fetch graph.facebook.com here again.
        }
      }
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } else {
      return NextResponse.json({ status: "not a whatsapp event" }, { status: 404 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
