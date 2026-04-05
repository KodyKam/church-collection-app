// app/(auth)/setup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // ✅ destination email
  const [logo, setLogo] = useState<File | null>(null);

  const router = useRouter();

  const handleSetup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not authenticated");
      return;
    }

    let logoUrl = null;

    // ✅ Upload logo if provided
    if (logo) {
      const fileExt = logo.name.split(".").pop();
      const fileName = `logos/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("church-logos")
        .upload(fileName, logo);

      if (uploadError) {
        console.error("UPLOAD ERROR:", uploadError);
        alert(uploadError.message);
      return;
      }

      // ✅ Get public URL
      const { data } = supabase.storage
        .from("church-logos")
        .getPublicUrl(fileName);

      logoUrl = data.publicUrl;
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const { error } = await supabase.from("church_settings").insert([
      {
        name,
        address,
        phone,
        email, // ✅ where reports go
        logo_url: logoUrl,
        user_id: user.id,
        trial_ends_at: trialEnd.toISOString(),
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/app");
  };

  return (
    <div className="auth-container">
      <div className="auth-bg" />

      <div className="auth-overlay">
        <input
          className="auth-input"
          placeholder="Church Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Report Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ✅ LOGO UPLOAD */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] || null)}
          style={{ color: "#fff" }}
        />

        <button className="auth-button" onClick={handleSetup}>
          Complete Setup
        </button>
      </div>
    </div>
  );
}