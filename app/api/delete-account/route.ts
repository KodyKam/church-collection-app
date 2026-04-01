// app/api/delete-account/route.ts
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

    // get subscription
    const { data: church } = await supabase
      .from("church_settings")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    // cancel immediately if exists
    if (church?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(church.stripe_subscription_id);
    }

    // delete church settings
    await supabase
      .from("church_settings")
      .delete()
      .eq("user_id", user.id);

    // sign out
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

    // to be updated to have a "cancelled_at" timestamp instead of hard delete
// snippet below will replace the above line once we have the "cancelled_at" field
//      await stripe.subscriptions.update(id, {
//      cancel_at_period_end: true,
//      });
