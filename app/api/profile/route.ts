import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET: Retrieve the user's saved resume/profile
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Query the user_profiles table for the user's saved resume
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      // No profile found is not an error - user just hasn't uploaded yet
      if (profileError.code === "PGRST116") {
        return NextResponse.json({ profile: null });
      }
      console.error("[Profile GET] Error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: {
        resumeData: profile.resume_data,
        uploadedAt: profile.updated_at,
        fileName: profile.file_name,
      },
    });
  } catch (error) {
    console.error("[Profile GET] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Save or update the user's resume/profile
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const body = await req.json();
    const { resumeData, fileName, rawText } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 },
      );
    }

    const serviceClient = createServiceClient();

    // Upsert the user profile with resume data
    const { data, error: upsertError } = await serviceClient
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          user_email: userEmail,
          resume_data: resumeData,
          file_name: fileName || null,
          raw_text: rawText || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single();

    if (upsertError) {
      console.error("[Profile POST] Upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save profile", details: upsertError.message },
        { status: 500 },
      );
    }

    console.log("[Profile POST] Saved profile for user:", userId);

    return NextResponse.json({
      success: true,
      profile: {
        resumeData: data.resume_data,
        uploadedAt: data.updated_at,
        fileName: data.file_name,
      },
    });
  } catch (error) {
    console.error("[Profile POST] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove the user's saved profile
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const serviceClient = createServiceClient();

    const { error: deleteError } = await serviceClient
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[Profile DELETE] Error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Profile DELETE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
