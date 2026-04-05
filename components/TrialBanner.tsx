"use client";

import { useRouter } from "next/navigation";

export default function TrialBanner({ church }: any) {
  const router = useRouter();

  const getTrialDaysLeft = () => {
    if (!church?.trial_ends_at) return null;

    const now = new Date();
    const end = new Date(church.trial_ends_at);

    return Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const trialDaysLeft = getTrialDaysLeft();

  if (
    church?.subscription_status === "active" ||
    trialDaysLeft === null
  ) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        padding: "1rem",
        borderRadius: "10px",
        background:
          trialDaysLeft <= 2
            ? "#fee2e2"
            : trialDaysLeft <= 5
            ? "#fef3c7"
            : "#e0f2fe",
        border:
          trialDaysLeft <= 2
            ? "1px solid #fecaca"
            : trialDaysLeft <= 5
            ? "1px solid #fde68a"
            : "1px solid #bae6fd",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <strong>
            {trialDaysLeft > 0
              ? `⏳ ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your trial`
              : "⚠️ Your trial has expired"}
          </strong>

          <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
            Upgrade to continue using Tithr without interruption.
          </div>
        </div>

        <button
          onClick={() => router.push("/billing")}
          style={{
            background: trialDaysLeft <= 0 ? "#991b1b" : "#2563eb",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}