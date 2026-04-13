// app/api/send-welcome-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Missing email or userId" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const verifyUrl = `https://tithr.ca/verify?user=${userId}`;

    const result = await resend.emails.send({
      from: "Tithr <noreply@notify.tithr.ca>",
      to: [email],
      subject: "Welcome to Tithr - Confirm your email",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Tithr 🙌</h2>
          <p>Please confirm your email to activate your account.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
            Confirm Email
          </a>
        </div>
      `,
    });

    console.log("📧 Welcome email sent:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WELCOME EMAIL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}