// app/(protected)/donors/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import DonorHistoryPDF from "@/components/DonorHistoryPDF";

type Donor = {
  id: string;
  name: string;
};

type CollectionHistory = {
  id: string;
  date: string;
  service_type: string | null;
  voided_at: string | null;
  void_reason: string | null;
};

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  donation_type: string;
  created_at: string;
  collection_id: string | null;
  collection: CollectionHistory | null;
};

export default function DonorHistoryClient({ donorId, church }: { donorId: string; church: any }) {
  const router = useRouter();

  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/donors/${donorId}/history`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Could not load donor history");
        }

        setDonor(data.donor);
        setDonations(data.donations || []);

      } catch (err: unknown) {
        console.error("Donor history error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load donor history"
        );
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      loadHistory();
    }
  }, [donorId]);

  // Keep voided donations in the history, but exclude them from valid totals.
  const validDonations = donations.filter(
    (donation) => !donation.collection?.voided_at
  );

  const totalAmount = validDonations.reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );

  const totalDonations = validDonations.length;

  const voidedDonations = donations.length - validDonations.length;

  const exportPDF = async () => {
    if (!donor || exporting) return;

    setExporting(true);

    try {
      const blob = await pdf(
        <DonorHistoryPDF
          key={Date.now()}
          donor={donor}
          donations={donations}
          church={church}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = donor.name.replace(/[^a-z0-9_-]/gi, "_");

      link.href = url;
      link.download = `${safeName}-contribution-history.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (exportError) {
      console.error("Donor history PDF export failed:", exportError);
      window.alert("Could not generate the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <p>Loading donor history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <button onClick={() => router.back()} style={buttonStyle}>
          ← Back
        </button>

        <h2>Unable to load donor</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ ...buttonStyle, marginBottom: 0 }}
        >
          ← Back
        </button>

        <button
          onClick={exportPDF}
          disabled={exporting}
          style={{
            ...buttonStyle,
            marginBottom: 0,
            border: "1px solid #1d4ed8",
            background: exporting ? "#93c5fd" : "#1d4ed8",
            color: "#fff",
            cursor: exporting ? "wait" : "pointer",
            opacity: exporting ? 0.8 : 1,
          }}
        >
          {exporting ? "Generating PDF..." : "Export PDF"}
        </button>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
          }}
        >
          {donor?.name}
        </h1>

        <p style={{ margin: 0, color: "#666" }}>
          Donor contribution history
        </p>
      </div>

      {/* Contribution statistics exclude voided donations. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Total Donations</div>

          <div style={valueStyle}>{totalDonations}</div>

        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Contributed</div>

          <div style={valueStyle}>${totalAmount.toFixed(2)}</div>

          <div style={helperStyle}>
            Excludes amounts from voided collections
          </div>
        </div>
      </div>

      {/* Explain why historical entries may not count toward totals. */}
      {voidedDonations > 0 && (
        <div
          style={{
            marginBottom: "25px",
            padding: "14px 16px",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            background: "#fef2f2",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {voidedDonations} donation
          {voidedDonations === 1 ? "" : "s"} from voided collection
          {voidedDonations === 1 ? "" : "s"} shown below for historical
          reference. {voidedDonations === 1 ? "It does" : "They do"} not
          count toward the totals above.
        </div>
      )}

      <h2 style={{ marginBottom: "15px" }}>Donation History</h2>

      {donations.length === 0 ? (
        <div
          style={{
            padding: "25px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            color: "#666",
          }}
        >
          No donations have been recorded for this donor yet.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={headerStyle}>Date</th>
                <th style={headerStyle}>Amount</th>
                <th style={headerStyle}>Donation Type</th>
                <th style={headerStyle}>Collection Status</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => {
                const isVoided = Boolean(donation.collection?.voided_at);

                return (
                  <tr
                    key={donation.id}
                    style={{
                      background: isVoided ? "#fff7f7" : "#fff",
                    }}
                  >
                    <td style={cellStyle}>
                      {donation.collection?.date
                        ? new Date(
                            `${donation.collection.date}T12:00:00`
                          ).toLocaleDateString("en-CA")
                        : new Date(donation.created_at).toLocaleDateString(
                            "en-CA"
                          )}
                    </td>

                    <td
                      style={{
                        ...cellStyle,
                        color: isVoided ? "#991b1b" : "#111",
                      }}
                    >
                      ${Number(donation.amount).toFixed(2)}
                    </td>

                    <td style={cellStyle}>{donation.donation_type}</td>

                    <td style={cellStyle}>
                      {isVoided ? (
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 9px",
                              borderRadius: "5px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            VOIDED
                          </span>

                          <div
                            style={{
                              marginTop: "6px",
                              color: "#991b1b",
                              fontSize: "13px",
                              maxWidth: "260px",
                              whiteSpace: "normal",
                            }}
                          >
                            <strong>Reason:</strong>{" "}
                            {donation.collection?.void_reason ||
                              "No reason recorded"}
                          </div>
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "#166534",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          Valid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  marginBottom: "20px",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "14px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginTop: "6px",
};

const helperStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#777",
  fontSize: "12px",
};

const headerStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};