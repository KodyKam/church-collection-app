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
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    const { data: church, error } = await supabase
      .from("church_settings")
      .select("subscription_status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    if (error || !church) {
      console.error("Subscription check error:", error?.message);
      return NextResponse.json({ status: "expired" });
    }

    // ✅ ACTIVE SUBSCRIPTION
    if (church.subscription_status === "active") {
      return NextResponse.json({ status: "active" });
    }

    // ✅ TRIAL STILL VALID
    if (
      church.subscription_status === "trialing" &&
      church.trial_ends_at &&
      new Date(church.trial_ends_at) > new Date()
    ) {
      return NextResponse.json({ status: "trialing" });
    }

    // ❌ EXPIRED
    return NextResponse.json({ status: "expired" });
  } catch (err) {
    console.error("Check subscription error:", err);
    return NextResponse.json({ status: "expired" });
  }
}