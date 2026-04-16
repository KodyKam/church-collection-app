// app/(protected)/settings/SettingsForm.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import TrialBanner from "@/components/TrialBanner";

export default function SettingsForm() {
  const [church, setChurch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/church");
      const data = await res.json();
      setChurch(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    let logoUrl = church.logo_url;

    try {
      // Upload logo if changed
      if (logo) {
        const fileName = `logos/${Date.now()}_${logo.name}`;

        const { error } = await supabase.storage
          .from("church-logos")
          .upload(fileName, logo);

        if (error) throw error;

        const { data } = supabase.storage
          .from("church-logos")
          .getPublicUrl(fileName);

        logoUrl = data.publicUrl;
      }

      const res = await fetch("/api/church", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: church.name,
          address: church.address,
          phone: church.phone,
          email: church.email,
          logo_url: logoUrl,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Settings updated!");
      router.replace("/app"); // 👈 return to main app
      router.refresh(); // to ensure that navbar updates instantly with new info
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
  const confirmed = confirm(
    "Are you sure you want to delete your account? This cannot be undone."
  );

  if (!confirmed) return;

  setDeleting(true);

  try {
    const res = await fetch("/api/delete-account", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Failed to delete account");

    // alert("Account deleted"); deprecated for better UX - redirect to homepage - logged out state

    router.push("/"); // or homepage
    router.refresh();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading settings...</p>;
  }

  return (
    <div
  onClick={() => console.log("PAGE CLICKED")} // debugging
  style={{ minHeight: "100vh" }}
>
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%", marginBottom: "1.5rem" }}>
      <TrialBanner church={church} />
    </div>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Church Settings
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Update your organization details and preferences
          </p>
        </div>

        {/* FORM */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: "0.9rem",
              display: "block", marginBottom: "0.25rem", color: "#374151"
             }}>
              Church Name:
            </label>
            <input
              value={church.name || ""}
              onChange={(e) =>
                setChurch({ ...church, name: e.target.value })
              }
              className="auth-input"
            />
          </div>

          <div>
            <label style={{ fontWeight: 500, fontSize: "0.9rem",
              display: "block", marginBottom: "0.25rem", color: "#374151"
             }}>
              Address:
            </label>
            <input
              placeholder="Address"
              value={church.address || ""}
              onChange={(e) =>
                setChurch({ ...church, address: e.target.value })
              }
              className="auth-input"
            />
          </div>

          <div>
            <label style={{ fontWeight: 500, fontSize: "0.9rem",
              display: "block", marginBottom: "0.25rem", color: "#374151",
             }}>
              Telephone:
            </label>
            <input
            placeholder="Phone"
              value={church.phone || ""}
              onChange={(e) =>
                setChurch({ ...church, phone: e.target.value })
              }
              className="auth-input"
            />
          </div>

          <div>
            <label style={{ fontWeight: 500, fontSize: "0.9rem",
              display: "block", marginBottom: "0.25rem", color: "#374151",
             }}>
              Destination Email:
            </label>
            <input
              placeholder="Destination Email"
              value={church.email || ""}
              onChange={(e) =>
                setChurch({ ...church, email: e.target.value })
              }
              className="auth-input"
            />
          </div>

          {/* LOGO */}
          <div style={{ marginTop: "1rem" }}>
            <label style={{ fontWeight: 500 }}>Church Logo</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLogo(e.target.files?.[0] || null)
              }
              style={{ marginTop: "0.5rem" }}
            />

            {church.logo_url && (
              <img
                src={church.logo_url}
                alt="logo"
                style={{
                  marginTop: "1rem",
                  height: "80px",
                  borderRadius: "6px",
                }}
              />
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "2rem",
          }}
        >
          <button
            onClick={() => router.push("/app")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: "#ffff18",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              background: "#029c1b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <button
          onClick={async () => {
            console.log("CLICKED"); // debugging
            const res = await fetch("/api/customer-portal", {
              method: "POST",
            });

            const data = await res.json();

            console.log("PORTAL RESPONSE:", data); // debugging

            if (data.url) {
              window.location.href = data.url;
            } else {
              alert("Unable to open billing portal");
            }
          }}
          style={{
            marginTop: "1rem",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#111827",
            color: "#fff",
            width: "100%",
            fontWeight: 600,
          }}
        >
          Manage Subscription
        </button>

        {/* 🔥 DANGER ZONE */}
        <div style={{ marginTop: "2.5rem" }}>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            style={{
              background: "#dc2626",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              width: "100%",
              fontWeight: 600,
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}