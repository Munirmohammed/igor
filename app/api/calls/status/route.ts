import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compileAndSendDossier } from '@/lib/dossier-service';

/**
 * POST /api/calls/status
 *
 * Twilio Status Callback — fires on every call state change:
 * ringing → in-progress → completed / busy / no-answer / failed / canceled
 *
 * Configure in Twilio Console:
 *   Phone Number → Voice & Fax → "Call Status Changes" → Webhook → POST → https://YOUR_DOMAIN/api/calls/status
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callSid       = params.get('CallSid') ?? '';
    const callStatus    = params.get('CallStatus') ?? '';
    const callDuration  = params.get('CallDuration');
    const from          = params.get('From') ?? '';
    const to            = params.get('To') ?? '';
    const callerCity    = params.get('CallerCity') ?? null;
    const callerCountry = params.get('CallerCountry') ?? null;

    console.log(`[CALL STATUS] SID: ${callSid} | Status: ${callStatus} | Duration: ${callDuration}s`);

    // Map Twilio status to our internal status
    const statusMap: Record<string, string> = {
      'queued':      'ongoing',
      'ringing':     'ongoing',
      'in-progress': 'ongoing',
      'completed':   'completed',
      'busy':        'failed',
      'no-answer':   'failed',
      'failed':      'failed',
      'canceled':    'failed',
    };
    const internalStatus = statusMap[callStatus] ?? callStatus;
    const duration = callDuration ? parseInt(callDuration) : null;

    // Upsert — in case we missed the inbound webhook
    await prisma.callSession.upsert({
      where: { id: callSid },
      update: {
        status: internalStatus,
        endTime: internalStatus !== 'ongoing' ? new Date() : undefined,
        duration: duration ?? undefined,
      },
      create: {
        id: callSid,
        callerId: from,
        callerName: `${from}${callerCity ? ` (${callerCity})` : ''}`,
        recipientId: to,
        direction: 'inbound',
        status: internalStatus,
        geoCity: callerCity,
        geoCountry: callerCountry,
        duration,
        endTime: internalStatus !== 'ongoing' ? new Date() : undefined,
      },
    });

    // Trigger dossier compilation on call end
    if (internalStatus === 'completed' || internalStatus === 'failed') {
      console.log(`[CALL ENDED] SID: ${callSid} — compiling dossier...`);
      await compileAndSendDossier(callSid);
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('[STATUS CALLBACK ERROR]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
