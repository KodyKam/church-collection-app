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

      const userId =
        session.metadata?.user_id || // prefer metadata user_id
        session.client_reference_id; // fallback to client_reference_id for older sessions without metadata
      const subscriptionId = session.subscription as string;

      if (!userId) {
        console.error("❌ Missing user_id in checkout session");
        return NextResponse.json({ received: true });
      }

      console.log("💰 Activating user:", userId);

      const { error } = await supabase
        .from("church_settings")
        .update({
          subscription_status: "active",
          stripe_subscription_id: subscriptionId,
        })
        .eq("user_id", userId);
        
      if (error) {
        console.error("DB update failed:", error.message);
      }
    }

    // =========================
    // ✅ SUBSCRIPTION CREATED (SOURCE OF TRUTH)
    // =========================
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.user_id;

      if (!userId) {
        console.warn("⚠️ Missing user_id in subscription metadata");
      } else {
        console.log("✅ Subscription created for:", userId);

        const { error } = await supabase
          .from("church_settings")
          .update({
            subscription_status: "active",
            stripe_subscription_id: subscription.id,
          })
          .eq("user_id", userId);

        if (error) {
          console.error("DB update failed:", error.message);
        }
      }
    }

    // =========================
    // 🔄 SUBSCRIPTION UPDATED
    // =========================
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const status = subscription.status;

      console.log("🔄 Subscription updated:", status);

      const { error } = await supabase
        .from("church_settings")
        .update({
          subscription_status: status === "active" ? "active" : "inactive",
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("DB update failed:", error.message);
      }
    }

    // =========================
    // ❌ SUBSCRIPTION CANCELED
    // =========================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      console.log("❌ Canceling subscription:", subscription.id);

      const { error } = await supabase
        .from("church_settings")
        .update({
          subscription_status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("DB cancel failed:", error.message);
        }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}