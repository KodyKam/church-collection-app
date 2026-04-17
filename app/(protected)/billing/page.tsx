// app/(protected)/billing/page.tsx
"use client";

import { useEffect, useState } from "react";

const btn = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  width: "220px",
  fontWeight: 600,
};

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "active" | "trialing" | "expired">("loading");

  // 🔥 Fetch subscription status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/check-subscription");
        const data = await res.json();

        if (data.status === "active") setStatus("active");
        else if (data.status === "trialing") setStatus("trialing");
        else setStatus("expired");
      } catch {
        setStatus("expired");
      }
    };

    fetchStatus();
  }, []);

  const handleUpgrade = async (plan: string) => {
    setLoadingPlan(plan);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    try {
      const res = await fetch("/api/customer-portal", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to open billing portal.");
      }
    } catch (err) {
      console.error(err);
      alert("Error opening portal.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Billing</h1>

      {/* 🔥 STATUS DISPLAY */}
      {status === "loading" && <p>Loading subscription...</p>}

      {status === "active" && (
        <>
          <p style={{ color: "#16a34a", fontWeight: 600 }}>
            ✅ Your subscription is active
          </p>

          <button onClick={openPortal} style={{ ...btn, marginTop: "1rem" }}>
            Manage Subscription
          </button>
        </>
      )}

      {status === "trialing" && (
        <p style={{ color: "#f59e0b", fontWeight: 600 }}>
          ⏳ You are currently on a free trial
        </p>
      )}

      {status === "expired" && (
        <p style={{ color: "#dc2626", fontWeight: 600 }}>
          ❌ Your trial has expired
        </p>
      )}

      {/* 🔥 UPGRADE OPTIONS */}
      {status !== "active" && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Upgrade</h2>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <p style={{ marginTop: "1rem", color: "#16a34a", fontWeight: 500 }}>
              🎉 Launch Special: Use code <strong>LAUNCH26</strong> for 25% off your first 3 months
            </p>
            <button
              onClick={() => handleUpgrade("monthly")}
              style={btn}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "monthly" ? "Redirecting..." : "$19 / month"}
            </button>

            <button
              onClick={() => handleUpgrade("quarterly")}
              style={btn}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "quarterly" ? "Redirecting..." : "$49 / quarter"}
            </button>

            <button
              onClick={() => handleUpgrade("yearly")}
              style={{
                ...btn,
                background: "#16a34a",
                boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
                transform: "scale(1.05)",
              }}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "yearly" ? "Redirecting..." : "$189 / year"}
            </button>
          </div>
        </>
      )}

      <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6b7280" }}>
        Secure payments powered by Stripe. Cancel anytime.
      </p>
    </div>
  );
}