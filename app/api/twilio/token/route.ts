import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Generate a Twilio Access Token for the browser SIP softphone
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identity = searchParams.get('identity') || 'IGOR-Agent';

    const { 
      TWILIO_ACCOUNT_SID, 
      TWILIO_API_KEY, 
      TWILIO_API_SECRET, 
      TWILIO_TWIML_APP_SID 
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET || !TWILIO_TWIML_APP_SID) {
      return NextResponse.json({ 
        error: 'Missing Twilio credentials in .env. Need ACCOUNT_SID, API_KEY, API_SECRET, and TWIML_APP_SID' 
      }, { status: 500 });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create a grant for outgoing/incoming calls
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true, // Allow receiving incoming calls via client
    });

    // Create the Access Token
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET,
      { identity }
    );

    token.addGrant(voiceGrant);

    return NextResponse.json({
      identity,
      token: token.toJwt(),
    });
  } catch (e: any) {
    console.error('[TWILIO TOKEN ERROR]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
