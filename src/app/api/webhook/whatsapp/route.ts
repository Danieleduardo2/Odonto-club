import { NextResponse } from 'next/server';

// Este Token debe coincidir exactamente con el que configuraremos en el panel de Meta.
const VERIFY_TOKEN = "odontoclub_secreto_2026";

// 1. ENDPOINT GET: Meta lo usa una sola vez para verificar que somos los dueños de este servidor.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// 2. ENDPOINT POST: Aquí llegarán todos los mensajes de los pacientes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("Incoming webhook body:", JSON.stringify(body, null, 2));

    // Confirm that this is a WhatsApp API event
    if (body.object === "whatsapp_business_account") {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        
        // This is where we will process incoming messages (Phase 7 logic)
        const message = body.entry[0].changes[0].value.messages[0];
        const fromNumber = message.from; // Phone number of the patient
        const msgText = message.type === "text" ? message.text.body : "Interactive message";

        console.log(`Received message from ${fromNumber}: ${msgText}`);
        
        // Return 200 OK to acknowledge receipt so Meta doesn't retry
        return NextResponse.json({ status: "success" });
      }
    }
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
