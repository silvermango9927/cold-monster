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
    const userEmail = session.user.email;
    const serviceClient = createServiceClient();

    // First, try to find a resume by email in the resumes table (most reliable)
    if (userEmail) {
      const { data: resumeByEmail, error: resumeError } = await serviceClient
        .from("resumes")
        .select("*")
        .eq("email", userEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!resumeError && resumeByEmail) {
        console.log("[Profile GET] Found resume by email in resumes table");
        return NextResponse.json({
          profile: {
            resumeData: resumeByEmail.parsed_json,
            uploadedAt: resumeByEmail.created_at,
            fileName: resumeByEmail.file_name,
          },
        });
      }
      
      // Log if there was an error other than "no rows found"
      if (resumeError && resumeError.code !== "PGRST116") {
        console.log("[Profile GET] Resumes table error:", resumeError.code, resumeError.message);
      }
    }

    // Fallback: try user_profiles table if it exists
    try {
      const { data: profile, error: profileError } = await serviceClient
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!profileError && profile) {
        console.log("[Profile GET] Found profile in user_profiles table");
        return NextResponse.json({
          profile: {
            resumeData: profile.resume_data,
            uploadedAt: profile.updated_at,
            fileName: profile.file_name,
          },
        });
      }
    } catch {
      // user_profiles table might not exist, that's okay
      console.log("[Profile GET] user_profiles table not available");
    }

    // No profile found
    console.log("[Profile GET] No saved resume found for user");
    return NextResponse.json({ profile: null });
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
