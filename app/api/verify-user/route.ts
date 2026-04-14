// app/api/verify-user/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔍 find token
    const { data, error } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // ⏳ check expiry
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // ✅ verify user
    const { error: updateError } =
      await supabase.auth.admin.updateUserById(data.user_id, {
        email_confirm: true,
      });

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    // 🧹 delete token
    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("id", data.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}