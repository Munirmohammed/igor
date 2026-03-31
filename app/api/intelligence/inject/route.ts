import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/intelligence/inject
 *
 * Secure endpoint for external tracing "patch" / tools to push intelligence
 * data into an active call session.
 *
 * Body (JSON):
 *   callId          string  (required) — UUID of the CallSession
 *   gps_coordinates string  — e.g. "46.0569° N, 14.5058° E"
 *   facial_match    string  — e.g. "MATCH: John Doe (97%)"
 *   camera_hits     string  — e.g. "CAM-101, CAM-402"
 *   satellite_intel string  — any satellite / uplink info
 *   extra_payload   string  — any JSON or free-text extra data
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { callId, gps_coordinates, facial_match, camera_hits, satellite_intel, extra_payload } = body;

    if (!callId) {
      return NextResponse.json({ error: 'callId is required' }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.callSession.findUnique({ where: { id: callId } });
    if (!session) {
      return NextResponse.json({ error: `No session found with id: ${callId}` }, { status: 404 });
    }

    const injected = await prisma.injectedData.upsert({
      where: { callSessionId: callId },
      update: {
        gpsCoordinates: gps_coordinates ?? undefined,
        facialMatch: facial_match ?? undefined,
        cameraHits: camera_hits ?? undefined,
        satelliteIntel: satellite_intel ?? undefined,
        extraPayload: extra_payload ?? undefined,
        receivedAt: new Date(),
      },
      create: {
        callSessionId: callId,
        gpsCoordinates: gps_coordinates ?? null,
        facialMatch: facial_match ?? null,
        cameraHits: camera_hits ?? null,
        satelliteIntel: satellite_intel ?? null,
        extraPayload: extra_payload ?? null,
      },
    });

    console.log(`[INTELLIGENCE INJECTED] Session: ${callId} | GPS: ${gps_coordinates ?? '—'}`);

    return NextResponse.json({
      success: true,
      injectedId: injected.id,
      callId,
      receivedAt: injected.receivedAt,
    });
  } catch (e: any) {
    console.error('[INJECT ERROR]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* GET /api/intelligence/inject?callId=xxx — read injected data for a session */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    if (!callId) return NextResponse.json({ error: 'callId query param required' }, { status: 400 });

    const data = await prisma.injectedData.findUnique({ where: { callSessionId: callId } });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
