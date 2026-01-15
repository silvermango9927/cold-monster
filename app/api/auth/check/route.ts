import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("[Auth Check] Error:", error);
      return NextResponse.json({ authenticated: false, error: error.message });
    }

    const hasGoogleToken = !!session?.provider_token;
    const user = session?.user;

    return NextResponse.json({
      authenticated: !!session,
      hasGoogleToken,
      user: user
        ? {
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          }
        : null,
    });
  } catch (error) {
    console.error("[Auth Check] Error:", error);
    return NextResponse.json({ authenticated: false, error: "Check failed" });
  }
}
