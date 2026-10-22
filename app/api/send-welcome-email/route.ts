// app/api/send-welcome-email/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the requesting user using their server-side session.
    const authSupabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Read and validate the requested account details.
    const body = await req.json();
    const { email, userId } = body;

    if (
      typeof email !== "string" ||
      typeof userId !== "string" ||
      !email.trim() ||
      !userId.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid email or user ID" },
        { status: 400 }
      );
    }

    // 3. Ensure the request refers to the authenticated account.
    if (
      user.id !== userId ||
      !user.email ||
      user.email.toLowerCase() !== email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Account verification failed" },
        { status: 403 }
      );
    }

    // 4. Check server-side configuration before using privileged access.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error("Welcome email configuration is incomplete.");

      return NextResponse.json(
        { error: "Email service is temporarily unavailable" },
        { status: 500 }
      );
    }

    // 5. Create the privileged client only after authentication succeeds.
    const adminSupabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 6. Generate a cryptographically secure verification token.
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 24 hours.
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // 7. Store the token and check whether the database operation succeeded.
    const { error: insertError } = await adminSupabase
      .from("email_verification_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error(
        "Verification token creation failed:",
        insertError.message
      );

      return NextResponse.json(
        { error: "Unable to create verification link" },
        { status: 500 }
      );
    }

    // 8. Send the verification email.
    const resend = new Resend(resendApiKey);

    const verifyUrl =
      `https://tithr.ca/verify?token=${encodeURIComponent(token)}`;

    const { error: emailError } = await resend.emails.send({
      from: "Tithr <noreply@notify.tithr.ca>",
      to: [user.email],
      subject: "Confirm your email",
      html: `
        <h2>Welcome to Tithr</h2>
        <p>Click below to verify your account:</p>
        <p>
          <a
            href="${verifyUrl}"
            style="padding:10px 16px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;"
          >
            Confirm Email
          </a>
        </p>
        <p>This verification link expires in 24 hours.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      `,
    });

    if (emailError) {
      console.error(
        "Verification email submission failed:",
        emailError.message
      );

      // Remove the unused token if the email could not be submitted.
      const { error: cleanupError } = await adminSupabase
        .from("email_verification_tokens")
        .delete()
        .eq("token", token)
        .eq("user_id", user.id);

      if (cleanupError) {
        console.error(
          "Failed to clean up unused verification token:",
          cleanupError.message
        );
      }

      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Never log verification tokens, URLs, or request bodies.
    console.error(
      "Welcome email request failed:",
      err instanceof Error ? err.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}