// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getChurchSettings } from "@/lib/getChurchSettings";

export const metadata = {
  title: "Tithr – Church Collection Management",
  description:
    "Track offerings, manage collections, and send reports instantly.",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* HEADER / NAV */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "3rem",
          }}
        >
          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Image
              src="/tithr-logo.png" // 👈 place your logo in /public
              alt="Tithr Logo"
              width={40}
              height={40}
            />
            <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Tithr
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/login">
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>

            <Link href="/register">
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Start Free Trial
              </button>
            </Link>
          </div>
        </div>

        {/* HERO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Church Collection Management Made Simple
          </h1>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "1.1rem",
              color: "#6b7280",
              maxWidth: "600px",
              marginInline: "auto",
            }}
          >
            Record offerings, upload deposit slips, and send professional
            reports — all in one place.
          </p>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/register">
              <button
                style={{
                  padding: "12px 18px",
                  background: "#029c1b", // 👈 matches your app green
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start Free Trial
              </button>
            </Link>

            <Link href="/login">
              <button
                style={{
                  padding: "12px 18px",
                  background: "#e5e7eb",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>
          </div>
          <br /><p style={{ fontSize: "0.8rem", color: "#fff", backgroundColor: "#ff0000", width: "fit-content", borderRadius: "6px", margin: "0 auto", padding: "4px 12px" }}>Still Under Development - Launching Soon</p>
        </div>

        {/* FEATURES */}
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            marginBottom: "3rem",
          }}
        >
          {[
            "Record weekly collections with ease",
            "Upload and store deposit slips securely",
            "Generate clean PDF reports instantly",
            "Email reports directly to your church",
          ].map((text, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: "1.2rem",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 5px 15px rgba(0,0,0,0.04)",
              }}
            >
              {text}
            </div>
          ))}
        </div>
        {/* PRICING */}
<div
  style={{
    marginBottom: "3rem",
    textAlign: "center",
  }}
>
  <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
    Simple Pricing
  </h2>

  <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
    No contracts. No hidden fees.
  </p>

  <div
    style={{
      maxWidth: "400px",
      margin: "0 auto",
      background: "#fff",
      borderRadius: "12px",
      padding: "2rem",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
      Free Trial
    </div>

    <div
      style={{
        fontSize: "2.5rem",
        fontWeight: 700,
        margin: "0.5rem 0",
        color: "#111827",
      }}
    >
      $19<span style={{ fontSize: "1rem", color: "#6b7280" }}>/month</span>
    </div>

    <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1.5rem" }}>
      Start with a free trial. Upgrade anytime.
    </p>

    <div
      style={{
        textAlign: "left",
        fontSize: "0.95rem",
        marginBottom: "1.5rem",
        lineHeight: "1.7",
      }}
    >
      <div>✔ Unlimited collections</div>
      <div>✔ PDF report generation</div>
      <div>✔ Email delivery</div>
      <div>✔ Secure deposit slip storage</div>
    </div>

    <Link href="/register">
      <button
        style={{
          width: "100%",
          padding: "12px",
          background: "#029c1b",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Start Free Trial
      </button>
      <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.75rem" }}>
  Cancel anytime. No commitment.
</div>
    </Link>
  </div>
</div>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#9ca3af",
          }}
        >
          © {new Date().getFullYear()} Tithr - All rights reserved.
        </div>
      </div>
    </main>
  );
}