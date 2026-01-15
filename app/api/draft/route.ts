import { google } from "googleapis";
import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[Draft] Starting draft creation...");
  
  try {
    const { recipient, subject, body } = await req.json();
    console.log("[Draft] Request:", { recipient, subjectLength: subject?.length, bodyLength: body?.length });
    
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log("[Draft] Session check:", { 
      hasSession: !!session, 
      hasProviderToken: !!session?.provider_token,
      sessionError: sessionError?.message 
    });

    if (!session?.provider_token) {
      console.log("[Draft] No provider token - user needs to authenticate with Google");
      return NextResponse.json(
        { error: "Please sign in with Google to save drafts", needsAuth: true },
        { status: 401 }
      );
    }

    console.log("[Draft] Initializing Gmail client...");
    
    // Initialize the Gmail Client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: session.provider_token,
    });

    const gmail = google.gmail({ version: "v1", auth });

    // The Gmail API expects a RFC 2822 formatted string encoded in base64url
    const messageParts = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body,
    ];
    const message = messageParts.join("\n");

    // Safe Base64URL encoding
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("[Draft] Creating draft via Gmail API...");
    
    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    console.log("[Draft] Success! Draft ID:", response.data.id);
    return NextResponse.json({ success: true, draftId: response.data.id });
  } catch (error) {
    console.error("[Draft] Gmail API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    // Check if it's a token expiry issue
    if (message.includes("invalid_grant") || message.includes("Token has been expired")) {
      return NextResponse.json(
        { error: "Google session expired. Please sign in again.", needsAuth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
