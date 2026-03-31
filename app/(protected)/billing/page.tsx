// app/(protected)/billing/page.tsx
"use client";

export default function BillingPage() {
  const handleUpgrade = async () => {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
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

      <button
        onClick={handleUpgrade}
        style={{
          marginTop: "1rem",
          padding: "10px 16px",
          background: "#111827",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Upgrade - $19/month
      </button>
    </div>
  );
}