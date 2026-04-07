// app/api/check-subscription/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ active: false }, { status: 401 });
    }

    const { data: church, error } = await supabase
      .from("church_settings")
      .select("subscription_status")
      .eq("user_id", user.id)
      .single();

    if (error || !church) {
      console.error("Subscription check error:", error?.message);
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: church.subscription_status === "active",
    });
  } catch (err) {
    console.error("Check subscription error:", err);
    return NextResponse.json({ active: false });
  }
}