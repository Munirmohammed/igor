import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function compileAndSendDossier(callId: string) {
  try {
    const session = await prisma.callSession.findUnique({
      where: { id: callId },
      include: { injectedData: true },
    });

    if (!session) {
      console.error(`[DOSSIER] Session not found: ${callId}`);
      return;
    }

    const content = JSON.stringify({
      sessionId: session.id,
      caller: session.callerName || session.callerId,
      recipient: session.recipientId,
      direction: session.direction,
      status: session.status,
      duration: session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : null,
      ip: session.ipAddress,
      location: session.geoCity
        ? `${session.geoCity}, ${session.geoCountry}`
        : session.notes ?? 'Unknown',
      coordinates: session.geoLat ? `${session.geoLat}, ${session.geoLon}` : null,
      audioRecording: session.audioUrl ?? null,
      startTime: session.startTime,
      endTime: session.endTime,
      intelligence: session.injectedData
        ? {
            gps: session.injectedData.gpsCoordinates,
            facialMatch: session.injectedData.facialMatch,
            cameras: session.injectedData.cameraHits,
            satellite: session.injectedData.satelliteIntel,
            extra: session.injectedData.extraPayload,
          }
        : null,
    }, null, 2);

    // Upsert dossier record
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

    // Send email if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT ?? '587');
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@shopyle.com';

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: smtpUser,
        to: adminEmail,
        subject: `[IGOR] Intelligence Dossier — ${session.callerName || session.callerId}`,
        html: `
          <div style="font-family:monospace;background:#050505;color:#f0f0f0;padding:32px;border-radius:12px">
            <h2 style="color:#00ff88;border-bottom:1px solid #00ff8830;padding-bottom:12px">
              🛡️ IGOR Intelligence Dossier
            </h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr><td style="color:#666;padding:6px 0">Caller</td><td style="color:#fff;font-weight:bold">${session.callerName || session.callerId}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Recipient</td><td style="color:#fff">${session.recipientId}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Direction</td><td style="color:#fff;text-transform:uppercase">${session.direction}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Status</td><td style="color:#00ff88;text-transform:uppercase">${session.status}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Duration</td><td style="color:#fff">${session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : 'N/A'}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Location</td><td style="color:#fff">${session.geoCity ? `${session.geoCity}, ${session.geoCountry}` : (session.notes ?? 'Unknown')}</td></tr>
              ${session.geoLat ? `<tr><td style="color:#666;padding:6px 0">Coordinates</td><td style="color:#00ff88;font-family:monospace">${session.geoLat}, ${session.geoLon}</td></tr>` : ''}
              ${session.audioUrl ? `<tr><td style="color:#666;padding:6px 0">Recording</td><td><a href="${session.audioUrl}" style="color:#3b82f6">Listen / Download</a></td></tr>` : ''}
            </table>
            ${session.injectedData ? `
            <h3 style="color:#f59e0b;margin-top:24px">Intelligence Injected</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr><td style="color:#666;padding:6px 0">GPS</td><td style="color:#fff">${session.injectedData.gpsCoordinates ?? 'N/A'}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Facial Match</td><td style="color:#fff">${session.injectedData.facialMatch ?? 'N/A'}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Cameras</td><td style="color:#fff">${session.injectedData.cameraHits ?? 'N/A'}</td></tr>
              <tr><td style="color:#666;padding:6px 0">Satellite</td><td style="color:#fff">${session.injectedData.satelliteIntel ?? 'N/A'}</td></tr>
            </table>
            ` : ''}
            <p style="color:#333;font-size:11px;margin-top:32px;border-top:1px solid #111;padding-top:16px">
              Auto-generated by IGOR OS — ${new Date().toISOString()}
            </p>
          </div>
        `,
      });

      console.log(`[DOSSIER SENT] Email dispatched to ${adminEmail} for session: ${callId}`);
    } else {
      console.log(`[DOSSIER] SMTP not configured — dossier saved to DB only. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env`);
    }

  } catch (e: any) {
    console.error('[DOSSIER ERROR]', e.message);
  }
}
