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

    if (customerId) {
      try {
      // ✅ Check if customer actually exists in Stripe
      await stripe.customers.retrieve(customerId);
    } catch (err) {
      console.log("⚠️ Invalid customer, recreating...");

      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      await supabase
        .from("church_settings")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }
  } else {
    // ✅ No customer at all → create new
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: {
        user_id: user.id,
      },
    });

    customerId = customer.id;

    await supabase
      .from("church_settings")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }
    // Log all relevant info before creating checkout
    console.log("🧾 Creating checkout with:");
    console.log("customerId:", customerId);
    console.log("priceId:", priceId);
    console.log("siteUrl:", process.env.NEXT_PUBLIC_SITE_URL);

    // 
    const priceCheck = await stripe.prices.retrieve(priceId);
    console.log("Price exists:", priceCheck.id); 

    // Debug Stripe account connection to ensure correct account is being used
    const account = await stripe.accounts.retrieve();
    console.log("STRIPE ACCOUNT:", account.id);

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

      client_reference_id: user.id, // NEW - attach user ID for easier tracking

      // STRIPE COUPON BLOCK IF EVER NEEDED
      discounts: [ // 100% OFF Tithr Coupon for Stripe payment testing
        {
          coupon: "fSdDPsd2", // Will keep for future reference/possibilities
        },
      ],

      subscription_data: {
        metadata: {
          user_id: user.id,
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("STRIPE ERROR FULL:", err);

     console.error("❌ STRIPE ERROR MESSAGE:", err?.message); 
     console.error("❌ STRIPE ERROR TYPE:", err?.type);
     console.error("❌ STRIPE ERROR RAW:", err?.raw);
     const account = await stripe.accounts.retrieve();
console.log("STRIPE ACCOUNT:", account.id);

    return NextResponse.json({ error: "Stripe failed" }, { status: 500 });
  }
}