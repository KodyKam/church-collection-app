// app/(protected)/billing/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  // 🔥 Auto redirect after a few seconds

  useEffect(() => {
    const init = async () => {
      try {
        // 🔄 Refresh session first
        await fetch("/api/refresh-session");

        // 🔁 Poll subscription status
        for (let i = 0; i < 6; i++) {
          const res = await fetch("/api/check-subscription");
          const data = await res.json();

          if (data.active) {
            router.push("/app"); // ✅ go to dashboard
            return;
          }

          await new Promise((r) => setTimeout(r, 1000));
        }

        // ⚠️ fallback if webhook slow
        router.push("/app");

      } catch (err) {
        console.error("Activation failed:", err);
        router.push("/app");
      }
    };

    init();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      {/* 🎉 BIG SUCCESS */}
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "#16a34a",
        }}
      >
        🎉 You're All Set!
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        Your Tithr subscription is now active.
      </p>

      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        You now have full access to record, manage, and share collections.
      </p>
      <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
        A receipt has been sent to your email.
      </p>

      {/* 🚀 CTA */}
      <button
        onClick={() => router.push("/app")}
        style={{
          padding: "12px 18px",
          borderRadius: "10px",
          border: "none",
          background: "#111827",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Go to Dashboard
      </button>

      {/* ⏳ Auto redirect hint */}
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        Activating your account...
      </p>
      <div style={{ marginTop: "1rem" }}>
        <div className="spinner" />
      </div>
    </div>
  );
}