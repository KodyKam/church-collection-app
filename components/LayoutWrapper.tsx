// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({ church, children }: any) {
  const pathname = usePathname();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <>
      {!isAuthPage && <Navbar church={church} />}

      <div
        style={{
          padding: "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {children}
      </div>
      {/* FOOTER */}
      {!isAuthPage && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#9ca3af",
          }}
        >
          © {new Date().getFullYear()} Tithr - All rights reserved.
        </div>
        )}
    </>
  );
  }