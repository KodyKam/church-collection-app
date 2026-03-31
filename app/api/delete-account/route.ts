// app/api/delete-account/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 NOT anon key
);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 Get church record
    const { data: church } = await supabase
      .from("church_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 🔥 1. Cancel Stripe subscription (if exists)
    if (church?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(church.stripe_subscription_id);
    } // to be updated to have a "cancelled_at" timestamp instead of hard delete
// snippet below will replace the above line once we have the "cancelled_at" field
//      await stripe.subscriptions.update(id, {
//      cancel_at_period_end: true,
//      });

    // 🔥 2. Delete collections
    await supabase.from("collections").delete().eq("user_id", user.id);

    // 🔥 3. Delete church settings
    await supabase.from("church_settings").delete().eq("user_id", user.id);

    // 🔥 4. Delete auth user (IMPORTANT)
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}