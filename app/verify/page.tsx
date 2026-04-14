// app/verify/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false); // prevents double execution

  useEffect(() => {
    const verify = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      const token = params.get("token");

      console.log("VERIFY TOKEN:", token);

      if (!token) {
        alert("Invalid verification link");
        return;
      }

      const res = await fetch("/api/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        alert("Verification failed");
        return;
      }

      alert("✅ Email verified! You can now log in.");
      router.push("/login");
    };

    setTimeout(verify, 100);
  }, [params, router]);

  return <p style={{ padding: "2rem" }}>Verifying your email...</p>;
}