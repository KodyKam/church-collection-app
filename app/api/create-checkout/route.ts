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

    console.log("PLAN:", plan);
    console.log("ENV MONTHLY:", process.env.STRIPE_PRICE_MONTHLY);
    console.log("ENV QUARTERLY:", process.env.STRIPE_PRICE_QUARTERLY);
    console.log("ENV YEARLY:", process.env.STRIPE_PRICE_YEARLY);

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    let customerId = church.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // save to DB
      await supabase
        .from("church_settings")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }
    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer: customerId,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,

      subscription_data: {
        metadata: {
          user_id: user.id,
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return NextResponse.json({ error: "Stripe failed" }, { status: 500 });
  }
}