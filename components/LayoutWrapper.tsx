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
      {children}
    </>
  );
}