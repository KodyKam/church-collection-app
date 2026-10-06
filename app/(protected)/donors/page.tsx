// app/(protected)/donors/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Donor = {
  id: string;
  name: string;
  created_at: string;
};

type DonationSummary = {
  donor_id: string;
  amount: number;
};

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<DonationSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDonors = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("You must be logged in to view donors.");
        }

        const { data: donorData, error: donorError } = await supabase
          .from("donors")
          .select("id, name, created_at")
          .eq("user_id", user.id)
          .order("name", { ascending: true });

        if (donorError) {
          throw donorError;
        }

        const { data: donationData, error: donationError } = await supabase
          .from("donations")
          .select("donor_id, amount")
          .eq("user_id", user.id)
          .not("donor_id", "is", null);

        if (donationError) {
          throw donationError;
        }

        setDonors(donorData || []);
        setDonations(donationData || []);
      } catch (err: any) {
        console.error("Failed to load donors:", err);
        setError(err.message || "Could not load donors.");
      } finally {
        setLoading(false);
      }
    };

    loadDonors();
  }, []);

  const donorSummaries = useMemo(() => {
    const summary: Record<
      string,
      {
        count: number;
        total: number;
      }
    > = {};

    for (const donation of donations) {
      if (!donation.donor_id) continue;

      if (!summary[donation.donor_id]) {
        summary[donation.donor_id] = {
          count: 0,
          total: 0,
        };
      }

      summary[donation.donor_id].count += 1;
      summary[donation.donor_id].total += Number(donation.amount) || 0;
    }

    return summary;
  }, [donations]);

  const filteredDonors = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return donors;
    }

    return donors.filter((donor) =>
      donor.name.toLowerCase().includes(searchTerm)
    );
  }, [donors, search]);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <p>Loading donors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1>Donors</h1>

        <p style={{ color: "#b00020" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
          }}
        >
          Donors
        </h1>

        <p
          style={{
            margin: 0,
            color: "#666",
          }}
        >
          Search and view donor contribution history.
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="Search donors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px 14px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Empty state */}
      {filteredDonors.length === 0 ? (
        <div
          style={{
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            color: "#666",
            background: "#fff",
          }}
        >
          {search
            ? `No donors found matching "${search}".`
            : "No donors have been added yet."}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredDonors.map((donor) => {
            const summary = donorSummaries[donor.id] || {
              count: 0,
              total: 0,
            };

            return (
              <Link
                key={donor.id}
                href={`/donors/${donor.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "#fff",
                    transition: "box-shadow 0.15s ease",
                    cursor: "pointer",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 12px",
                      fontSize: "20px",
                    }}
                  >
                    {donor.name}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "15px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    <span>
                      {summary.count}{" "}
                      {summary.count === 1
                        ? "donation"
                        : "donations"}
                    </span>

                    <span>
                      ${summary.total.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "15px",
                      color: "#2563eb",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    View history →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}