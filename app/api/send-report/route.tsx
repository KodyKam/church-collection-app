// app/api/send-report/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { pdf } from "@react-pdf/renderer";
import CollectionPDF from "@/components/CollectionPDF";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { collection, donations, total, depositUrl } = await req.json();
    
    const depositSlipUrl = depositUrl;
const pdfDoc = pdf(
  <CollectionPDF
    collection={collection}
    donations={donations}
    totalAmount={total}
    depositSlipUrl={depositUrl}
  />
);

// ✅ Convert ReadableStream to Buffer
const stream = await pdfDoc.toBuffer();

const chunks: Uint8Array[] = [];

for await (const chunk of stream as any) {
  chunks.push(
    typeof chunk === "string" ? Buffer.from(chunk) : chunk
  );
}

const pdfBuffer = Buffer.concat(chunks);
const pdfBase64 = pdfBuffer.toString("base64");

    // HTML version of the email (styled summary)
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Weekly Offerings Report</h2>
        <p><strong>Date:</strong> ${collection.date}</p>
        <p><strong>Service:</strong> ${collection.service_type}</p>
        <p><strong>Recorded By:</strong> ${collection.recorded_by}</p>
        <p><strong>Counted By:</strong> ${collection.counted_by}</p>

        <h3 style="margin-top: 1rem;">Donations Summary</h3>
        <ul>
          ${donations
            .map(
              (d: any) =>
                `<li>${d.donor_name} | ${d.check_number || "-"} | $${d.amount.toFixed(
                  2
                )} | ${d.donation_type}</li>`
            )
            .join("")}
        </ul>
        <p style="font-weight: bold; margin-top: 0.5rem;">TOTAL: $${total.toFixed(2)}</p>
        <p style="margin-top: 1rem;">The full collection report PDF will be attached in the next step.</p>
      </div>
    `;

    // Send email (HTML only)
    const result = await resend.emails.send({
      from: "Tithr <onboarding@resend.dev>",
      to: ["bigachiever@icloud.com"], // update later when ready
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

    console.log("📨 Email result:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}