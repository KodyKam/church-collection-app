// app/api/refresh-session/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // 🔁 This forces Supabase to re-read the session cookie
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Session refresh error:", error.message);
      return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Refresh session error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}