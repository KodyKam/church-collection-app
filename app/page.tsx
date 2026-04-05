import Link from "next/link";

export const metadata = {
  title: "Tithr – Church Collection Management",
  description:
    "Track offerings, manage collections, and generate reports with ease.",
};

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700 }}>
        Church Collection Management Made Simple
      </h1>

      <p style={{ marginTop: "1rem", fontSize: "1.1rem", color: "#555" }}>
        Tithr helps churches track offerings, organize collections, and send
        reports instantly.
      </p>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Link href="/register">
          <button
            style={{
              padding: "12px 18px",
              background: "#111827",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
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

      <div style={{ marginTop: "3rem" }}>
        <h2>What you can do</h2>
        <ul style={{ marginTop: "1rem", lineHeight: "1.8" }}>
          <li>✔ Record weekly offerings</li>
          <li>✔ Upload deposit slips</li>
          <li>✔ Generate PDF reports</li>
          <li>✔ Email reports instantly</li>
        </ul>
      </div>
    </main>
  );
}