import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/* GET — list all call sessions */
export async function GET() {
  try {
    const calls = await prisma.callSession.findMany({
      orderBy: { startTime: 'desc' },
      take: 50,
      include: { injectedData: { select: { id: true } } },
    });
    return NextResponse.json({ calls });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* POST — start a new call session (auto geo-lookup by IP) */
export async function POST(req: Request) {
  try {
    const { callerId, callerName, recipientId, direction, ipAddress } = await req.json();

    if (!callerId || !recipientId) {
      return NextResponse.json({ error: 'callerId and recipientId are required' }, { status: 400 });
    }

    // Auto IP-geolocation
    let geoCity: string | null = null;
    let geoCountry: string | null = null;
    let geoLat: number | null = null;
    let geoLon: number | null = null;

    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      ipAddress ||
      null;

    if (rawIp && rawIp !== '127.0.0.1' && rawIp !== '::1') {
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
      } catch {
        // Geo lookup is best-effort, don't fail the call
      }
    }

    const session = await prisma.callSession.create({
      data: {
        callerId,
        callerName: callerName || null,
        recipientId,
        direction: direction ?? 'outbound',
        ipAddress: rawIp,
        geoCity,
        geoCountry,
        geoLat,
        geoLon,
        status: 'ongoing',
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* PATCH — end a call session */
export async function PATCH(req: Request) {
  try {
    const { callId, duration } = await req.json();
    if (!callId) return NextResponse.json({ error: 'callId is required' }, { status: 400 });

    const session = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: 'completed',
        endTime: new Date(),
        duration: duration ?? null,
      },
      include: { injectedData: true },
    });

    // Compile dossier & email
    const content = JSON.stringify({
      session: {
        id: session.id,
        caller: session.callerName || session.callerId,
        recipient: session.recipientId,
        direction: session.direction,
        duration: session.duration,
        ip: session.ipAddress,
        location: session.geoCity ? `${session.geoCity}, ${session.geoCountry}` : 'Unknown',
        coordinates: session.geoLat ? `${session.geoLat}, ${session.geoLon}` : null,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      intelligence: session.injectedData ?? null,
    }, null, 2);

    await prisma.dossier.upsert({
      where: { callSessionId: callId },
      update: { compiledAt: new Date(), status: 'sent', content },
      create: {
        callSessionId: callId,
        status: 'sent',
        content,
        adminEmail: 'admin@shopyle.com',
      },
    });

    // TODO: wire real SMTP — e.g. nodemailer / Resend — using SMTP_HOST env vars
    console.log(`[DOSSIER] Compiled and queued for admin@shopyle.com | Session: ${callId}`);

    return NextResponse.json({ success: true, message: 'Call ended. Dossier compiled.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
