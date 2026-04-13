// app/verify/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const userId = params.get("user");

      if (!userId) {
        alert("Invalid verification link");
        return;
      }

      const res = await fetch("/api/verify-user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        alert("Verification failed");
        return;
      }

      alert("✅ Email verified! You can now log in.");
      router.push("/login");
    };

    verify();
  }, [params, router]);

  return <p style={{ padding: "2rem" }}>Verifying your email...</p>;
}