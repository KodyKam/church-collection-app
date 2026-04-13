// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://tithr.ca/login", // you can keep or remove later
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  if (!user) {
    alert("Something went wrong");
    return;
  }

  // 🔥 SEND YOUR CUSTOM EMAIL
  await fetch("/api/send-welcome-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      userId: user.id,
    }),
  });

  // 🚨 HANDLE UNCONFIRMED USERS (expected case)
  if (!data.session) {
    alert("Check your email to confirm your account");
    router.push("/login");
    return;
  }

  // fallback (rare)
  alert("Account created!");
  router.push("/login");
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

        <button className="auth-button" onClick={handleRegister}>
          Start Free Trial
        </button>
      </div>
    </div>
  );
}