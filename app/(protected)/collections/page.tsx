// app/(protected)/collections/page.tsx
// Main dashboard page showing all collections
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // For search functionality
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("collections")
        .select("*")
        .order("date", { ascending: false });

      setCollections(data || []);
      setFiltered(data || []);
      setLoading(false);
    };

    load();
  }, []);

  // 🔍 FILTERS
  useEffect(() => {
    let result = [...collections];

    // 📅 Date filters
    if (startDate) result = result.filter((c) => c.date >= startDate);
    if (endDate) result = result.filter((c) => c.date <= endDate);

    // 🔍 Search filter
    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter((c) =>
        c.service_type?.toLowerCase().includes(term) ||
        c.recorded_by?.toLowerCase().includes(term)
      );
    }

    setFiltered(result);
  }, [startDate, endDate, search, collections]);

  // 💰 Total calculations
  const totalAmount = filtered.reduce(
    (sum, c) => sum + Number(c.total || 0),
    0
  );

  const totalCount = filtered.length;

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading collections...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>
          Collections Dashboard
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          View and analyze your offerings
        </p>
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Search service or recorder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.border = "1px solid #111827")}
          onBlur={(e) => (e.currentTarget.style.border = "1px solid #e5e7eb")}
        />
        <div // Date Range Picker wrapped together for better UX
            style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "nowrap",
            }}
        >
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            />

            <span style={{ alignSelf: "center", fontSize: "0.85rem" }}>→</span>

            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
        </div>

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setSearch("");
          }}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <div style={cardLabel}>Total Collections</div>
          <div style={cardValue}>{totalCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardLabel}>Total Amount</div>
          <div style={cardValue}>${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p>No collections found.</p>
      ) : (
        filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => router.push(`/collection/${c.id}`)}
            style={{
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              marginBottom: "1rem",
              background: "#fff",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)", e.currentTarget.style.color = "#948347", e.currentTarget.style.backgroundColor = "#f7f7ec")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)", e.currentTarget.style.color = "black", e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {c.service_type}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                  {c.date}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>
                  ${Number(c.total).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {c.recorded_by}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* 🎨 Small reusable styles */
const cardStyle = {
  flex: "1",
  minWidth: "180px",
  padding: "1rem",
  borderRadius: "10px",
  background: "#fff",
  border: "1px solid #e5e7eb",
};

const cardLabel = {
  fontSize: "0.85rem",
  color: "#6b7280",
};

const cardValue = {
  fontSize: "1.4rem",
  fontWeight: 600,
};