import { prisma } from '@/lib/prisma';

/**
 * POST /api/calls/inbound
 *
 * Twilio Voice Webhook — called instantly when a real phone call arrives.
 * Twilio sends: CallSid, From, To, CallStatus, Direction, CallerCity, CallerCountry, CallerZip
 *
 * Configure in Twilio Console:
 *   Phone Number (+441416730912) → Voice & Fax → "A Call Comes In" → Webhook → POST → https://YOUR_DOMAIN/api/calls/inbound
 *
 * What happens:
 *  1. IGOR logs the caller + geo data instantly to DB
 *  2. Call is forwarded to +38669617351 (client's real phone)
 *  3. Call is recorded and recording URL is saved back via /api/calls/recording-status
 *  4. When call ends, status webhook fires dossier compilation + email to admin@shopyle.com
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callSid       = params.get('CallSid') ?? '';
    const from          = params.get('From') ?? 'Unknown';
    const to            = params.get('To') ?? '';
    const callerCity    = params.get('CallerCity') ?? null;
    const callerState   = params.get('CallerState') ?? null;
    const callerCountry = params.get('CallerCountry') ?? null;
    const callerZip     = params.get('CallerZip') ?? null;
    const callStatus    = params.get('CallStatus') ?? 'ringing';

    console.log(`[INBOUND CALL] From: ${from} | To: ${to} | SID: ${callSid} | City: ${callerCity}`);

    // Auto IP-geolocation fallback
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    let geoCity = callerCity;
    let geoCountry = callerCountry;
    let geoLat: number | null = null;
    let geoLon: number | null = null;

    if (rawIp && rawIp !== '127.0.0.1' && rawIp !== '::1' && !geoCity) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${rawIp}?fields=status,city,country,lat,lon`, {
          signal: AbortSignal.timeout(3000),
        }).then(r => r.json());
        if (geo.status === 'success') {
          geoCity = geo.city;
          geoCountry = geo.country;
          geoLat = geo.lat;
          geoLon = geo.lon;
        }
      } catch { /* geo is best-effort */ }
    }

    // Log the call into IGOR database
    await prisma.callSession.upsert({
      where: { id: callSid },
      update: { status: callStatus === 'in-progress' ? 'ongoing' : callStatus },
      create: {
        id: callSid,
        callerId: from,
        callerName: `${from}${geoCity ? ` (${geoCity})` : ''}`,
        recipientId: to,
        direction: 'inbound',
        status: 'ongoing',
        ipAddress: rawIp,
        geoCity,
        geoCountry,
        geoLat,
        geoLon,
        notes: callerZip ? `ZIP: ${callerZip}, State: ${callerState}` : null,
      },
    });

    // Forward number (client's real phone) + caller ID shown on their phone
    const forwardTo = process.env.TWILIO_FORWARD_NUMBER ?? '+38669617351';
    const callerId  = process.env.TWILIO_PHONE_NUMBER   ?? to;

    // TwiML: forward the call AND record it simultaneously
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}"
        record="record-from-answer"
        recordingStatusCallback="/api/calls/recording-status"
        recordingStatusCallbackMethod="POST">
    <Number statusCallback="/api/calls/status"
            statusCallbackMethod="POST"
            statusCallbackEvents="initiated ringing answered completed">
      ${forwardTo}
    </Number>
  </Dial>
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (e: any) {
    console.error('[INBOUND CALL ERROR]', e);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Reject /></Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
