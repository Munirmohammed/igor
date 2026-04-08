import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This is the TwiML App Webhook. Twilio hits this URL when the browser calls `.connect({ To: number })`
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callSid = params.get('CallSid') || '';
    const from = params.get('From') || 'IGOR-Agent';
    let to = params.get('To') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    // Twilio Voice SDK passes parameters inside the To field depending on setup, 
    // or as custom parameters. Let's make sure we have a clean number.
    if (to.startsWith('client:')) {
      // Internal call, shouldn't happen for outgoing PSTN
      to = to.replace('client:', '');
    }

    console.log(`[OUTBOUND CALL] Connecting ${from} to ${to} (SID: ${callSid})`);

    // Log the outbound call in IGOR DB so it shows up on Mission Control
    await prisma.callSession.upsert({
      where: { id: callSid },
      update: { status: 'ongoing' },
      create: {
        id: callSid,
        callerId: from,
        callerName: 'IGOR HQ',
        recipientId: to,
        direction: 'outbound',
        status: 'ongoing',
        ipAddress,
      },
    });

    // Generate TwiML to dial the target PSTN number
    // And set the CallerId to the Twilio Phone Number you purchased
    const callerId = process.env.TWILIO_PHONE_NUMBER;

    let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId || ''}" record="record-from-answer" recordingStatusCallback="/api/calls/recording-status">
    <Number statusCallbackEvents="initiated ringing answered completed" statusCallback="/api/calls/status" statusCallbackMethod="POST">
      ${to}
    </Number>
  </Dial>
</Response>`;

    if (!to) {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>No destination number provided.</Say>
</Response>`;
    }

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (e: any) {
    console.error('[OUTBOUND ROUTE ERROR]', e);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Reject /></Response>`, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
