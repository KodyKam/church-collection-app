// components/LayoutWrapper.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import TithrTour from "./TithrTour";

export default function LayoutWrapper({
  church,
  children,
}: {
  church: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTourOpen, setIsTourOpen] = useState(false);

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  return (
    <>
      {!isAuthPage && (
        <Navbar
          church={church}
          onTakeTour={() => setIsTourOpen(true)}
        />
      )}

      <div
        style={{
          padding: "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {children}
      </div>

      {!isAuthPage && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#9ca3af",
          }}
        >
          © {new Date().getFullYear()} Tithr · V1.3.0 · All rights reserved.
        </div>
      )}

      {!isAuthPage && (
        <TithrTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
        />
      )}
    </>
  );
}