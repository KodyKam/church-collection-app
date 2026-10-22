// components/CollectionPreview.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import CollectionPDF from "./CollectionPDF";

export default function CollectionPreview({ collection, depositUrl, church }: any) {
  const router = useRouter();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

    const [isVoiding, setIsVoiding] = useState(false); // State to track if the voiding process is in progress

  // ✅ Compute total donations
  const totalAmount = collection.donations.reduce(
    (sum: number, d: any) => sum + Number(d.amount || 0),
    0
  );

  /* ===========================
     DOWNLOAD PDF
  =========================== */
  const handleDownloadPDF = async () => {
        if (collection.voided_at) {
      alert("This collection has been voided. PDF downloads are disabled.");
      return;
    } // Check if the collection is voided before generating the PDF
    setIsGeneratingPDF(true);

    try {
      const blob = await pdf(
        <CollectionPDF
          key={Date.now()} // to FORCE RE-RENDER and avoid cached results
          collection={collection}
          donations={collection.donations}
          totalAmount={totalAmount}
          depositSlipUrl={depositUrl}
          church={church} 
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

  /* ===========================
     SEND OFFERINGS REPORT
  =========================== */
  const handleSendEmail = async () => {
        if (collection.voided_at) {
      alert("This collection has been voided. Email reports are disabled.");
      return;
    } // Check if the collection is voided before sending the email
    setIsSendingEmail(true);

    // if (!church?.email) { // Not trusting frontend validation for critical config - API route will also check and fail safely if missing
    //   alert("Please set a report email in Settings first.");
    //   return;
    // }

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId: collection.id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to send report");
      }

      alert("✅ Offerings report sent successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send offerings report.");
    } finally {
      setIsSendingEmail(false);
    }
  };

    /* ===========================
     VOID COLLECTION
  =========================== */
  const handleVoidCollection = async () => {
    if (collection.voided_at) {
      alert("This collection has already been voided.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to void this collection?\n\n" +
      "The collection and its donations will be preserved, but the " +
      "collection will be excluded from valid financial totals."
    );

    if (!confirmed) return;

    const reason = window.prompt(
      "Enter the reason for voiding this collection:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("A reason is required to void a collection.");
      return;
    }

    if (reason.trim().length > 500) {
      alert("The reason must be 500 characters or fewer.");
      return;
    }

    setIsVoiding(true);

    try {
      const res = await fetch(
        `/api/collections/${collection.id}/void`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason.trim() }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to void collection.");
      }

      alert("Collection voided successfully.");

      // Reload the server-rendered collection data.
      router.refresh();
    } catch (err: any) {
      console.error("Void collection error:", err);
      alert(err.message || "Failed to void collection.");
    } finally {
      setIsVoiding(false);
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem", color: "#1f2937" }}>
        Collection Preview
      </h1>

            {collection.voided_at && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #dc2626",
            borderRadius: "8px",
            background: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem" }}>
            VOIDED COLLECTION
          </h2>

          <p style={{ margin: "0 0 0.5rem" }}>
            <strong>Voided on:</strong>{" "}
            {new Date(collection.voided_at).toLocaleString("en-CA")}
          </p>

          <p style={{ margin: 0 }}>
            <strong>Reason:</strong> {collection.void_reason}
          </p>

          <p style={{ margin: "0.75rem 0 0", fontSize: "0.9rem" }}>
            This record is retained for historical reference and must not
            be treated as a valid collection.
          </p>
        </div>
      )}

      <p><strong>Date:</strong> {collection.date}</p>
      <p><strong>Service:</strong> {collection.service_type}</p>
      <p><strong>Recorded By:</strong> {collection.recorded_by}</p>
      <p><strong>Counted By:</strong> {collection.counted_by}</p>

      <h2 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>
        Donations
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Check</th>
            <th style={{ padding: "8px" }}>Amount</th>
            <th style={{ padding: "8px" }}>Type</th>
          </tr>
        </thead>

        <tbody>
          {collection.donations.map((d: any, i: number) => (
            <tr key={i} style={{ backgroundColor: i % 2 ? "#f9fafb" : "#fff" }}>
              <td style={{ padding: "8px" }}>{d.donor_name}</td>
              <td style={{ padding: "8px" }}>{d.check_number}</td>
              <td style={{ padding: "8px" }}>${Number(d.amount).toFixed(2)}</td>
              <td style={{ padding: "8px" }}>{d.donation_type}</td>
            </tr>
          ))}

          <tr style={{ fontWeight: "bold", backgroundColor: "#e5e7eb" }}>
            <td colSpan={2} style={{ padding: "8px" }}>Total</td>
            <td colSpan={2} style={{ padding: "8px" }}>
              ${totalAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Deposit Slip */}
      <h2 style={{ marginTop: "2rem" }}>Deposit Slip</h2>

      {depositUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <img
            src={depositUrl}
            alt="Deposit Slip"
            style={{
              maxWidth: "400px",
              borderRadius: "6px",
              boxShadow: "0 0 5px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <button
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#2563eb", color: "#fff" }}
          onClick={() => router.back()}
        >
          Back
        </button>

        <button
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#10b981", color: "#fff" }}
          onClick={handleSendEmail}
          disabled={isSendingEmail || isVoiding || !!collection.voided_at}
        >
          {isSendingEmail ? "Sending..." : "Send Offerings Report"}
        </button>

        <button
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#f59e0b", color: "#fff" }}
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF || isVoiding || !!collection.voided_at}
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </button>
                {!collection.voided_at && (
          <button
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "#fff",
              cursor: isVoiding ? "wait" : "pointer",
              opacity: isVoiding ? 0.7 : 1,
            }}
            onClick={handleVoidCollection}
            disabled={isVoiding || isSendingEmail || isGeneratingPDF}
          >
            {isVoiding ? "Voiding..." : "Void Collection"}
          </button>
        )}
      </div>
    </div>
  );
}