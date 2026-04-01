import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get subscription id
    const { data: church } = await supabase
      .from("church_settings")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!church?.stripe_subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    // cancel at period end (better UX)
    await stripe.subscriptions.update(church.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}