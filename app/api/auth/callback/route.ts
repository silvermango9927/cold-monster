import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Add auth=success parameter so frontend knows sign-in succeeded
      const redirectUrl =
        next === "/" ? "/?auth=success" : `${next}?auth=success`;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }

    console.error("[Auth Callback] Error exchanging code:", error);
  }

  // Return to home with error
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
