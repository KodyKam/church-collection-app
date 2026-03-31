import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

// ⚠️ Use service role key (IMPORTANT)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 👈 MUST ADD THIS
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  console.log("📩 Event received:", event.type);

  try {
    // =========================
    // ✅ SUBSCRIPTION CREATED
    // =========================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const subscriptionId = session.subscription as string;

      if (!userId) {
        throw new Error("Missing user_id in metadata");
      }

      console.log("💰 Activating user:", userId);

      await supabase
        .from("church_settings")
        .update({
          subscription_status: "active",
          stripe_subscription_id: subscriptionId,
        })
        .eq("user_id", userId);
    }

    // =========================
    // ❌ SUBSCRIPTION CANCELED
    // =========================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("church_settings")
        .update({
          subscription_status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}