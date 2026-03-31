import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compileAndSendDossier } from '@/lib/dossier-service';

/**
 * CALL MANAGEMENT API
 * Endpoints for starting and ending calls.
 * Triggers the intelligence dossier compilation on call end.
 */

// START CALL
export async function POST(request: Request) {
  try {
    const { callerId, recipientId, ipAddress } = await request.json();

    if (!callerId || !recipientId) {
      return NextResponse.json({ error: 'Missing Caller or Recipient ID' }, { status: 400 });
    }

    const session = await prisma.callSession.create({
      data: {
        callerId,
        recipientId,
        ipAddress,
        status: 'ongoing',
        startTime: new Date(),
      },
    });

    console.log(`[CALL STARTED] ID: ${session.id} | Target: ${callerId}`);

    return NextResponse.json({ 
      success: true, 
      id: session.id,
      message: 'Call session initiated' 
    });

  } catch (error: any) {
    console.error('[CALL ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// END CALL & TRIGGER DOSSIER
export async function PATCH(request: Request) {
  try {
    const { callId, status } = await request.json();

    if (!callId) {
      return NextResponse.json({ error: 'Missing Call ID' }, { status: 400 });
    }

    const session = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: status || 'completed',
        endTime: new Date(),
      },
    });

    console.log(`[CALL ENDED] ID: ${callId} | Triggering Dossier Compiler...`);

    // ASYNC TRIGGER DOSSIER COMPILATION
    // In a real system, this would be a background job.
    await compileAndSendDossier(callId);

    return NextResponse.json({ 
      success: true, 
      message: 'Call ended and intelligence report queued' 
    });

  } catch (error: any) {
    console.error('[CALL END ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
