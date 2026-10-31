// components/Navbar.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar({
  church,
  onTakeTour,
}: {
  church: any;
  onTakeTour?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0.75rem 1.5rem",
      }}
    >
      <div
        className="navbar-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        {/* LEFT: Logo */}
        <div
          onClick={() => router.push("/app")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            justifySelf: "start",
          }}
        >
          <img
            src="/tithr-logo.png"
            alt="Tithr Logo"
            style={{ height: "40px" }}
          />
          <span style={{ fontWeight: 600 }}>Tithr</span>
        </div>

        {/* CENTER: Church Name */}
        <div
          style={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          className="hide-mobile"
        >
          {church?.name || ""}
        </div>

        {/* RIGHT: Tour Button / Profile Menu */}
        <div
          ref={dropdownRef}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            position: "relative",
          }}
        >
          {/* TAKE A TOUR BUTTON */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onTakeTour?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #1e40af",
              background: "#eff6ff",
              color: "#1e40af",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#dbeafe")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#eff6ff")
            }
            aria-label="Take a guided tour of Tithr"
          >
            <span aria-hidden="true">ⓘ</span>
            <span className="tour-button-label">App Tour</span>
          </button>

          {/* PROFILE / DROPDOWN */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fff")
              }
            >
              {church?.logo_url ? (
                <img
                  src={church.logo_url}
                  alt="Church logo"
                  style={{
                    height: "32px",
                    width: "32px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "32px",
                    width: "32px",
                    borderRadius: "50%",
                    background: "#111827",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  {church?.name?.[0] || "C"}
                </div>
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "120%",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  width: "180px",
                  overflow: "hidden",
                }}
              >
                {/* DONORS */}
                <div
                  onClick={() => {
                    setOpen(false);
                    router.push("/donors");
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  Donors
                </div>

                {/* COLLECTIONS */}
                <div
                  onClick={() => {
                    setOpen(false);
                    router.push("/collections");
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  Collections
                </div>

                {/* SETTINGS */}
                <div
                  onClick={() => {
                    setOpen(false);
                    router.push("/settings");
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  Settings
                </div>

                {/* LOGOUT */}
                <div
                  onClick={handleLogout}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STYLE */}
      <style jsx>{`
        @media (max-width: 640px) {
          .navbar-inner {
            display: flex !important;
            justify-content: space-between;
          }

          .hide-mobile {
            display: none;
          }

          .tour-button-label {
            display: inline;
          }
        }

        @media (max-width: 380px) {
          .tour-button-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}