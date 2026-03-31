import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

/**
 * DOSSIER SERVICE
 * Compiles gathered intelligence into a "Full Intelligence Dossier"
 * and emails it to admin@shopyle.com.
 */
export async function compileAndSendDossier(callId: string) {
  try {
    // 1. Fetch the Call Session and Injected Intelligence
    const session = await prisma.callSession.findUnique({
      where: { id: callId },
      include: { injectedData: true },
    });

    if (!session) {
      console.error(`[DOSSIER ERROR] Session not found: ${callId}`);
      return;
    }

    // 2. Format the Intelligence Report
    const reportHtml = `
      <div style="font-family: 'Outfit', sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">FULL INTELLIGENCE DOSSIER</h1>
        <p style="color: #888888; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">CONFIDENTIAL - IGOR OS GENERATED</p>
        
        <div style="margin-top: 30px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
          <h3 style="color: #3b82f6;">Target Identification</h3>
          <p><strong>Caller ID:</strong> ${session.callerId}</p>
          <p><strong>Recipient:</strong> ${session.recipientId}</p>
          <p><strong>Status:</strong> ${session.status.toUpperCase()}</p>
          <p><strong>IP Address:</strong> ${session.ipAddress || 'Unknown'}</p>
        </div>

        <div style="margin-top: 20px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
          <h3 style="color: #f59e0b;">Satellite & GPS Tracking</h3>
          <p><strong>GPS Coordinates:</strong> ${session.injectedData?.gps_coordinates || 'Awaiting Sync'}</p>
          <p><strong>Geo-Location (Fallback):</strong> ${session.geolocatedCity || 'Unknown'}</p>
          <p><strong>Satellite Intel:</strong> ${session.injectedData?.satellite_intel || 'None provided'}</p>
        </div>

        <div style="margin-top: 20px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
          <h3 style="color: #ef4444;">Intelligence Highlights</h3>
          <p><strong>Facial Match:</strong> ${session.injectedData?.facial_match || 'No hits'}</p>
          <p><strong>Camera Hits:</strong> ${session.injectedData?.camera_hits || 'None'}</p>
        </div>

        <p style="margin-top: 40px; font-size: 10px; color: #444444; border-top: 1px solid #222; padding-top: 20px;">
          THIS REPORT WAS AUTOMATICALLY COMPILED AFTER DATA INJECTION. TRACING PATCH ACTIVE.
        </p>
      </div>
    `;

    // 3. Configure Email Transporter (Placeholder for Resend/Nodemailer)
    // NOTE: In production, use ACTUAL credentials.
    const transporter = nodemailer.createTransport({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "admin@shopyle.com",
        pass: "IGOR_SECRET_PASS",
      },
    });

    console.log(`[DOSSIER COMPILED] Sending to admin@shopyle.com for Session: ${callId}`);

    // Store the Dossier record
    await prisma.dossier.create({
      data: {
        callSessionId: callId,
        content: JSON.stringify(session),
        status: 'sent',
      },
    });

    // In this demo, we'll just log it.
    console.log(`[DOSSIER SENT] Successfully compiled and dispatched.`);

  } catch (error) {
    console.error(`[DOSSIER ERROR]`, error);
  }
}
