// components/CollectionPreview.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import CollectionPDF from "./CollectionPDF";

export default function CollectionPreview({ collection, depositUrl }: any) {
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Compute total donations
  const totalAmount = collection.donations.reduce(
    (sum: number, d: any) => sum + Number(d.amount || 0),
    0
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(
        <CollectionPDF
          collection={collection}
          donations={collection.donations}
          totalAmount={totalAmount}
          depositSlipUrl={depositUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collection_${collection.date}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = () => {
    alert("Send Offerings Report functionality coming soon!");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
  <h1 style={{ marginBottom: "1rem", color: "#1f2937" }}>Collection Preview</h1>

  <p><strong>Date:</strong> {collection.date}</p>
  <p><strong>Service:</strong> {collection.service_type}</p>
  <p><strong>Recorded By:</strong> {collection.recorded_by}</p>
  <p><strong>Counted By:</strong> {collection.counted_by}</p>

  <h2 style={{ marginTop: "2rem", marginBottom: "0.5rem", color: "#111827" }}>Donations</h2>
  <table style={{
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    marginBottom: "1rem"
  }}>
    <thead style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
      <tr>
        <th style={{ padding: "8px" }}>Name</th>
        <th style={{ padding: "8px" }}>Check</th>
        <th style={{ padding: "8px" }}>Amount</th>
        <th style={{ padding: "8px" }}>Type</th>
      </tr>
    </thead>
    <tbody>
      {collection.donations.map((d: any, i: number) => (
        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
          <td style={{ padding: "8px" }}>{d.donor_name}</td>
          <td style={{ padding: "8px" }}>{d.check_number}</td>
          <td style={{ padding: "8px" }}>${d.amount.toFixed(2)}</td>
          <td style={{ padding: "8px" }}>{d.donation_type}</td>
        </tr>
      ))}
      <tr style={{ fontWeight: "bold", backgroundColor: "#e5e7eb" }}>
        <td colSpan={2} style={{ padding: "8px" }}>Total</td>
        <td colSpan={2} style={{ padding: "8px" }}>${totalAmount.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

<h2 style={{ marginTop: "2rem" }}>Deposit Slip</h2>
{depositUrl && (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
    <img
      src={depositUrl}
      alt="Deposit Slip"
      style={{ maxWidth: "400px", borderRadius: "6px", boxShadow: "0 0 5px rgba(0,0,0,0.15)" }}
    />
  </div>
)}

<div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
  <button
    style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#2563eb", color: "#fff" }}
    onClick={() => router.back()}
  >
    Back
  </button>
  <button
    style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#10b981", color: "#fff" }}
    onClick={handleSendEmail}
  >
    Send Offerings Report
  </button>
  <button
    style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#f59e0b", color: "#fff" }}
    onClick={handleDownloadPDF}
    disabled={isGeneratingPDF}
  >
    {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
  </button>
</div>
</div>
  );
}