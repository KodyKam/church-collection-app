
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Donor = {
  id: string;
  name: string;
};

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  donation_type: string;
  created_at: string;
};

export default function DonorHistoryPage() {
  const params = useParams();
  const router = useRouter();

  const donorId = params.id as string;

  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/donors/${donorId}/history`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Could not load donor history");
        }

        setDonor(data.donor);
        setDonations(data.donations || []);
      } catch (err: any) {
        console.error("Donor history error:", err);
        setError(err.message || "Could not load donor history");
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      loadHistory();
    }
  }, [donorId]);

  const totalAmount = donations.reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );

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
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "20px",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
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
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "20px",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
          }}
        >
          {donor?.name}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#666",
          }}
        >
          Donor contribution history
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fff",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px" }}>
            Total Donations
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginTop: "6px",
            }}
          >
            {donations.length}
          </div>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fff",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px" }}>
            Total Contributed
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginTop: "6px",
            }}
          >
            ${totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

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
              minWidth: "600px",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={headerStyle}>Date</th>
                <th style={headerStyle}>Amount</th>
                <th style={headerStyle}>Donation Type</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td style={cellStyle}>
                    {new Date(donation.created_at).toLocaleDateString(
                      "en-CA"
                    )}
                  </td>

                  <td style={cellStyle}>
                    ${Number(donation.amount).toFixed(2)}
                  </td>

                  <td style={cellStyle}>{donation.donation_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
