// app/api/church/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json(null);

  const { data } = await supabase
    .from("church_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("👉 USER:", user?.id); // 🔍 FIRST check

  if (!user) {
    console.log("❌ No user - unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("📦 Incoming payload:", body); // 🔍 SECOND check

  const { error } = await supabase
    .from("church_settings")
    .update({
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      logo_url: body.logo_url,
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.log("❌ Update error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("✅ Update successful for:", user.id);
  

  return NextResponse.json({ success: true });
}