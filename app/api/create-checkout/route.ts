// app/api/create-checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json(); // 👈 NEW

    // get church settings
    const { data: church } = await supabase
      .from("church_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // ✅ Pick correct price
    let priceId: string | undefined;

    if (plan === "monthly") {
      priceId = process.env.STRIPE_PRICE_MONTHLY;
    } else if (plan === "quarterly") {
      priceId = process.env.STRIPE_PRICE_QUARTERLY;
    } else if (plan === "yearly") {
      priceId = process.env.STRIPE_PRICE_YEARLY;
    }

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer_email: church.email || undefined,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,

      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return NextResponse.json({ error: "Stripe failed" }, { status: 500 });
  }
}