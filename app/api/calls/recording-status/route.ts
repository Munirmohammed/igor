import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/calls/recording-status
 * Twilio callback when a recording is complete — saves the URL to the session.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callSid      = params.get('CallSid') ?? '';
    const recordingUrl = params.get('RecordingUrl');
    const status       = params.get('RecordingStatus');

    if (callSid && recordingUrl && status === 'completed') {
      await prisma.callSession.update({
        where: { id: callSid },
        data: { audioUrl: `${recordingUrl}.mp3` },
      });
      console.log(`[RECORDING SAVED] SID: ${callSid} | URL: ${recordingUrl}.mp3`);
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
