// app/(protected)/billing/page.tsx
"use client";

import { useState } from "react";

const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

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

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Unlock Tithr</h1>
      <p>Continue managing your church collections without interruption.</p>
      <p>Your trial has ended. Subscribe to continue using Tithr.</p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>

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
          style={{...btn, background: "#16a34a", boxShadow: "0 4px 14px rgba(22,163,74,0.4)", transform: "scale(1.05)", cursor: loadingPlan ? "not-allowed" : "pointer", opacity: loadingPlan ? 0.7 : 1, }}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === "yearly" ? "Redirecting..." : "$189 / year"}
        </button>

      </div>

      <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6b7280" }}>
        Secure payments powered by Stripe. Cancel anytime.
      </p>

      <button
        onClick={async () => {
          const res = await fetch("/api/cancel-subscription", {
            method: "POST",
          });

          if (res.ok) {
            alert("Subscription will cancel at end of billing period.");
          } else {
            alert("Failed to cancel subscription.");
          }
        }}
        style={{ marginTop: "2rem" }}
      >
        Cancel Subscription
      </button>
    </div>
  );
}