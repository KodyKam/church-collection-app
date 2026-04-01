// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// 🔥 IMPORTANT: prevent build-time execution
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // ✅ Ensure env vars exist at runtime
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_WEBHOOK_SECRET ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Missing required environment variables");
    }

    // ✅ Initialize Stripe INSIDE handler (fixes Vercel crash)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });

    // ✅ Initialize Supabase INSIDE handler
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("❌ Webhook signature failed:", err.message);
      return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    console.log("📩 Event received:", event.type);

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

      console.log("❌ Canceling subscription:", subscription.id);

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