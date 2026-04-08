import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/calls/inbound
 *
 * Twilio Voice Webhook — called instantly when a real phone call arrives.
 * Twilio sends: CallSid, From, To, CallStatus, Direction, CallerCity, CallerCountry, CallerZip
 *
 * Configure in Twilio Console:
 *   Phone Number → Voice & Fax → "A Call Comes In" → Webhook → POST → https://YOUR_DOMAIN/api/calls/inbound
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callSid       = params.get('CallSid') ?? '';
    const from          = params.get('From') ?? 'Unknown';
    const to            = params.get('To') ?? '';
    const direction     = params.get('Direction') ?? 'inbound';
    const callerCity    = params.get('CallerCity') ?? null;
    const callerState   = params.get('CallerState') ?? null;
    const callerCountry = params.get('CallerCountry') ?? null;
    const callerZip     = params.get('CallerZip') ?? null;
    const callStatus    = params.get('CallStatus') ?? 'ringing';

    console.log(`[INBOUND CALL] From: ${from} | To: ${to} | SID: ${callSid} | City: ${callerCity}`);

    // Log the call into the database
    await prisma.callSession.upsert({
      where: { id: callSid },
      update: { status: callStatus === 'in-progress' ? 'ongoing' : callStatus },
      create: {
        id: callSid,
        callerId: from,
        callerName: `${from}${callerCity ? ` (${callerCity})` : ''}`,
        recipientId: to,
        direction: 'inbound',
        status: 'ongoing',
        geoCity: callerCity,
        geoCountry: callerCountry,
        notes: callerZip ? `ZIP: ${callerZip}, State: ${callerState}` : null,
      },
    });

    // TwiML response — tells Twilio what to do with the call
    // Option 1: Just record and log (silent monitoring)
    // Option 2: Play a message and hang up
    // Option 3: Dial through to an agent
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">This call is being recorded and logged. Please hold.</Say>
  <Record
    action="/api/calls/recording"
    recordingStatusCallback="/api/calls/recording-status"
    timeout="5"
    transcribe="false"
  />
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (e: any) {
    console.error('[INBOUND CALL ERROR]', e);
    // Return minimal TwiML so Twilio doesn't retry endlessly
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Reject /></Response>`, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
