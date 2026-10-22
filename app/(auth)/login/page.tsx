// app/(auth)/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const { data: refreshed } = await supabase.auth.getUser();
      const user = refreshed.user;

      if (!user) {
        alert("Login failed. Try again.");
        return;
      }

      if (!user.email_confirmed_at) {
        alert("Please confirm your email before logging in.");
        await supabase.auth.signOut();
        return;
      }

      const { data: church } = await supabase
        .from("church_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!church) {
        router.push("/setup");
      } else {
        router.push("/app");
      }
    } catch {
      alert("Something went wrong during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg" />

      <div className="auth-overlay">
        <form
  onSubmit={handleLogin}
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    width: "100%",
  }}
>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ color: "#fff" }}>
          No account?{" "}
          <span
            style={{
              textDecoration: "underline",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => router.push("/register")}
          >
            Start free trial
          </span>
        </p>
      </div>
    </div>
  );
}