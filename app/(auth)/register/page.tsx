// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Registration could not be completed. Please try again.");
        return;
      }

      let emailSent = false;

      try {
        const res = await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            userId: user.id,
          }),
        });

        emailSent = res.ok;
      } catch {
        // The email request failed before a successful response.
        emailSent = false;
      }

      // Preserve the existing requirement that registration
      // ends with the user signed out.
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Registration sign-out failed.");
      }

      if (!emailSent) {
        alert(
          "Your account may have been created, but we couldn't confirm that your verification email was sent. Please contact support before trying to register again."
        );
        return;
      }

      alert("Check your email for your account verification link.");
      router.push("/login");
    } catch {
      alert("Something went wrong during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg" />

      <div className="auth-overlay">
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className="auth-button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Start Free Trial"}
        </button>
      </div>
    </div>
  );
}