// app/verify/page.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);

  const [message, setMessage] = useState("Verifying your email...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      const token = params.get("token");

      if (!token) {
        setMessage("This verification link is invalid or incomplete.");
        setIsError(true);
        return;
      }

      try {
        const res = await fetch("/api/verify-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await res.json();

        if (!res.ok) {
          setMessage(
            result.error || "Verification failed. Please request a new link if needed."
          );
          setIsError(true);
          return;
        }

        setMessage("Email verified successfully! Redirecting to login...");

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch {
        setMessage(
          "We couldn't reach the verification service. Please check your connection and try again."
        );
        setIsError(true);
      }
    };

    void verify();
  }, [params, router]);

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <p role="status" aria-live="polite" style={{ color: isError ? "#b91c1c" : "inherit" }}>
        {message}
      </p>

      {isError && (
        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{ marginTop: "1rem" }}
        >
          Go to login
        </button>
      )}
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Loading verification...</p>}>
      <VerifyContent />
    </Suspense>
  );
}