import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * SECURE INJECTION ENDPOINT
 * This is the "Patch" target where external tracing tools (Satellite, Facial Rec, etc.)
 * push data into an active call session.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { callId, gps_coordinates, facial_match, camera_hits, satellite_intel } = data;

    if (!callId) {
      return NextResponse.json({ error: 'Missing Call ID' }, { status: 400 });
    }

    // UPSERT Injected Data for the Call Session
    const injectedData = await prisma.injectedData.upsert({
      where: { callSessionId: callId },
      update: {
        gps_coordinates,
        facial_match,
        camera_hits,
        satellite_intel,
        receivedAt: new Date(),
      },
      create: {
        callSessionId: callId,
        gps_coordinates,
        facial_match,
        camera_hits,
        satellite_intel,
      },
    });

    // Update the Call Session status if needed
    await prisma.callSession.update({
      where: { id: callId },
      data: { status: 'ongoing' }, // Ensure it's marked as active
    });

    console.log(`[INTELLIGENCE INJECTED] Call: ${callId}`);

    return NextResponse.json({ 
      success: true, 
      id: injectedData.id,
      message: 'Intelligence merged into session' 
    });

  } catch (error: any) {
    console.error('[INJECTION ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
