// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // 🔥 ALWAYS REFRESH USER
    const { data: refreshed } = await supabase.auth.getUser();

    const user = refreshed.user; // ✅ FIX

    if (!user) {
      alert("Login failed. Try again.");
      return;
    }

    // 🚨 BLOCK unverified users
    if (!user.email_confirmed_at) {
      alert("Please confirm your email before logging in.");
      await supabase.auth.signOut();
      return;
    }

    // ✅ Check if church exists
    const { data: church } = await supabase
      .from("church_settings")
      .select("*")
      .eq("user_id", user.id) // ✅ now safe
      .single();

    if (!church) {
    router.push("/setup");
  } else {
    router.push("/app");
  }
};

  return (
    <div className="auth-container">
      <div className="auth-bg" />

      <div className="auth-overlay">
        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-button" onClick={handleLogin}>
          Login
        </button>

        <p style={{ color: "#fff" }}>
          No account?{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => router.push("/register")}
          >
            Start free trial
          </span>
        </p>
        <p style={{ fontSize: "0.8rem", color: "#fff", backgroundColor: "#ff0000", width: "fit-content", borderRadius: "6px", margin: "0 auto", padding: "4px 12px" }}>Still Under Development - Log in And Explore</p>
      </div>
    </div>
  );
}