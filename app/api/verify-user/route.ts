// app/api/verify-user/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Validate the request body.
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("token" in body) ||
      typeof body.token !== "string" ||
      !/^[a-f0-9]{64}$/.test(body.token)
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    const token = body.token;

    // 2. Validate server configuration.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Verification service configuration is incomplete.");

      return NextResponse.json(
        { error: "Verification service is temporarily unavailable" },
        { status: 500 }
      );
    }

    // 3. Create a privileged server-side client.
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 4. Look up the token without consuming it yet.
    const { data, error } = await supabase
      .from("email_verification_tokens")
      .select("id, user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.error("Verification token lookup failed.");

      return NextResponse.json(
        { error: "Unable to verify your email right now" },
        { status: 500 }
      );
    }

    if (!data || new Date(data.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // 5. Confirm the account associated with the stored token.
    const { error: updateError } =
      await supabase.auth.admin.updateUserById(data.user_id, {
        email_confirm: true,
      });

    if (updateError) {
      console.error("Supabase account verification failed.");

      return NextResponse.json(
        { error: "Unable to verify your email right now" },
        { status: 500 }
      );
    }

    // 6. Atomically consume the token.
    const { data: consumed, error: consumeError } =
      await supabase.rpc("consume_email_verification_token", {
        p_token: token,
      });

    if (consumeError) {
      console.error("Verification token consumption failed.");

      return NextResponse.json(
        {
          error:
            "Your account confirmation could not be completed. Please request a new verification link if needed.",
        },
        { status: 500 }
      );
    }

    if (!consumed || consumed.length !== 1) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // 7. Verification succeeded.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(
      "Verification request failed:",
      err instanceof Error ? err.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Unable to verify your email right now" },
      { status: 500 }
    );
  }
}