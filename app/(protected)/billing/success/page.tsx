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
        // 🔥 Force session refresh
        await fetch("/api/refresh-session");
      } catch (err) {
        console.error("Session refresh failed", err);
      }

      // ⏳ Give webhook time to update DB
      setTimeout(() => {
        router.push("/");
      }, 2500);
    };

    init();
  }, [router]);

  useEffect(() => {
  const checkSubscription = async () => {
    try {
      // 🔄 Try up to 6 times (6 seconds max)
      for (let i = 0; i < 6; i++) {
        const res = await fetch("/api/check-subscription");
        const data = await res.json();

        if (data.active) {
          router.push("/");
          return;
        }

        // wait 1 second before retry
        await new Promise((r) => setTimeout(r, 1000));
      }

      // fallback (still redirect anyway)
      router.push("/");
    } catch (err) {
      console.error("Polling failed:", err);
      router.push("/");
    }
  };

  checkSubscription();
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
        onClick={() => router.push("/")}
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