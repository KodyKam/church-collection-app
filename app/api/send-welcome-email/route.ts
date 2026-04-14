// app/api/send-welcome-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Missing email or userId" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔒 generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // ⏳ expires in 24 hours
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // 💾 store token
    await supabase.from("email_verification_tokens").insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    const verifyUrl = `https://tithr.ca/verify?token=${token}`;

    console.log("VERIFY URL:", verifyUrl);

    await resend.emails.send({
      from: "Tithr <noreply@notify.tithr.ca>",
      to: [email],
      subject: "Confirm your email",
      html: `
        <h2>Welcome to Tithr 🙌</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyUrl}" style="padding:10px 16px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;">
          Confirm Email
        </a>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WELCOME EMAIL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}