// app/api/send-report/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { pdf } from "@react-pdf/renderer";
import CollectionPDF from "@/components/CollectionPDF";
import { getChurchSettings } from "@/lib/getChurchSettings";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate the requester.
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to send a collection report." },
        { status: 401 }
      );
    }

    // 2. Accept only the collection ID from the browser.
    let body: { collectionId?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON request is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.collectionId !== "string" ||
      !body.collectionId.trim()
    ) {
      return NextResponse.json(
        { error: "A collection ID is required." },
        { status: 400 }
      );
    }

    const collectionId = body.collectionId.trim();

    // 3. Retrieve the collection belonging to this authenticated user.
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (collectionError) {
      console.error("Collection lookup error:", collectionError.message);

      return NextResponse.json(
        { error: "Could not retrieve the collection." },
        { status: 500 }
      );
    }

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    // 4. Enforce the voiding restriction on the server.
    // Never rely on the browser to tell us whether a collection is voided.
    if (collection.voided_at) {
      return NextResponse.json(
        {
          error:
            "This collection has been voided. Its report cannot be emailed.",
        },
        { status: 409 }
      );
    }

    // 5. Retrieve the donations from the database.
    const { data: donationRecords, error: donationsError } = await supabase
      .from("donations")
      .select("*")
      .eq("collection_id", collection.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (donationsError) {
      console.error("Donation lookup error:", donationsError.message);

      return NextResponse.json(
        { error: "Could not retrieve the collection donations." },
        { status: 500 }
      );
    }

    // Convert numeric values explicitly because database numeric columns
    // may be returned as strings.
    const donations = (donationRecords ?? []).map((donation) => ({
      ...donation,
      donor_name: donation.donor_name ?? "",
      check_number: donation.check_number ?? "",
      amount: Number(donation.amount) || 0,
    }));

    // 6. Calculate the total using database records.
    const total = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    // 7. Retrieve the authenticated user's church settings.
    const church = await getChurchSettings();

    if (!church?.email) {
      return NextResponse.json(
        {
          error:
            "No destination email is configured in your church settings.",
        },
        { status: 400 }
      );
    }

    // 8. Generate a fresh signed URL from the stored private file path.
    // The browser is not allowed to supply the URL used in the report.
    let depositSlipUrl: string | null = null;

    if (collection.deposit_slip_url) {
      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("deposit-slips")
          .createSignedUrl(collection.deposit_slip_url, 60 * 60);

      if (signedError) {
  console.warn(
    "Deposit slip unavailable; continuing without it:",
    {
      collectionId: collection.id,
      path: collection.deposit_slip_url,
      message: signedError.message,
    }
  );
} else {
  depositSlipUrl = signedData?.signedUrl ?? null;
}
    }

    // 9. Generate the PDF using verified database information.
    const pdfDoc = pdf(
      <CollectionPDF
        collection={collection}
        donations={donations}
        totalAmount={total}
        depositSlipUrl={depositSlipUrl}
        church={church}
      />
    );

    const stream = await pdfDoc.toBuffer();
    const chunks: Buffer[] = [];

    for await (const chunk of stream as any) {
      chunks.push(
        typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk)
      );
    }

    const pdfBuffer = Buffer.concat(chunks);
    const pdfBase64 = pdfBuffer.toString("base64");

    // 10. Build the email from verified data and escape HTML values.
    const donationRows = donations
      .map(
        (donation) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ${escapeHtml(donation.donor_name)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ${escapeHtml(donation.check_number || "-")}
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              $${donation.amount.toFixed(2)}
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ${escapeHtml(donation.donation_type)}
            </td>
          </tr>
        `
      )
      .join("");

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;max-width:700px;margin:auto;">
        <h2 style="color:#2563eb;">Weekly Offerings Report</h2>

        <p><strong>Date:</strong> ${escapeHtml(collection.date)}</p>
        <p><strong>Service:</strong> ${escapeHtml(collection.service_type)}</p>
        <p><strong>Recorded By:</strong> ${escapeHtml(collection.recorded_by)}</p>
        <p><strong>Counted By:</strong> ${escapeHtml(collection.counted_by)}</p>

        <h3 style="margin-top:1.5rem;">Donations Summary</h3>

        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;">Name</th>
              <th style="padding:8px;">Check</th>
              <th style="padding:8px;">Amount</th>
              <th style="padding:8px;">Type</th>
            </tr>
          </thead>
          <tbody>
            ${donationRows}
          </tbody>
        </table>

        <p style="font-weight:bold;margin-top:1rem;">
          TOTAL: $${total.toFixed(2)}
        </p>

        <p style="margin-top:1rem;">
          The full collection report PDF, including the deposit slip when available,
          is attached.
        </p>
      </div>
    `;

    // 11. Send the report to the email saved in this church's settings.
    const recipient = church.email;

    const { data: emailResult, error: emailError } =
      await resend.emails.send({
        from: "Tithr <noreply@notify.tithr.ca>",
        to: [recipient],
        subject: `Offerings Report - ${collection.date}`,
        html: htmlBody,
        attachments: [
          {
            filename: `collection_${collection.date}.pdf`,
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ],
      });

    if (emailError) {
      console.error("Resend email error:", emailError);

      return NextResponse.json(
        { error: "The email provider could not send the report." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Collection report sent successfully.",
      emailId: emailResult?.id ?? null,
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return NextResponse.json(
      { error: "Failed to send the collection report." },
      { status: 500 }
    );
  }
}