// app/(protected)/billing/page.tsx
"use client";

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
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Upgrade Required</h1>
      <p>Your trial has ended. Subscribe to continue using Tithr.</p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>

        <button onClick={() => handleUpgrade("monthly")} style={btn}>
          $19 / month
        </button>

        <button onClick={() => handleUpgrade("quarterly")} style={btn}>
          $49 / quarter
        </button>

        <button onClick={() => handleUpgrade("yearly")} style={{...btn, background: "#16a34a" }}>
          Best Value - $189 / year
        </button>

      </div>

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