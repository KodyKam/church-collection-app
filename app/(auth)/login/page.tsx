// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// export const metadata = { redacted because metadata can't be export from "use client" components
//   title: "Login – Tithr",
//   description: "Login to your Tithr account",
//   openGraph: {
//     title: "Tithr Login",
//     description: "Access your church collection dashboard",
//     images: ["/og-image.png"],
//   },
// };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Check if church exists

    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const { data: church } = await supabase
      .from("church_settings")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (!church) {
      router.push("/setup"); // 👈 FIRST TIME USERS
    } else {
      router.push("/");
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
      </div>
    </div>
  );
}