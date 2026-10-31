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
        boxSizing: "border-box",
      }}
    >
      <div
        className="navbar-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
          alignItems: "center",
          gap: "12px",
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
            minWidth: 0,
          }}
        >
          <img
            src="/tithr-logo.png"
            alt="Tithr Logo"
            className="tithr-logo"
            style={{ height: "40px", width: "auto" }}
          />
          <span className="brand-name" style={{ fontWeight: 600 }}>
            Tithr
          </span>
        </div>

        {/* CENTER: Church Name */}
        <div
          className="church-name"
          style={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
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
            gap: "8px",
            position: "relative",
            minWidth: 0,
          }}
        >
          {/* TAKE A TOUR BUTTON */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onTakeTour?.();
            }}
            className="tour-button"
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
              flexShrink: 0,
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
              flexShrink: 0,
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
                justifyContent: "center",
                cursor: "pointer",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                transition: "background 0.2s",
                minWidth: "48px",
                minHeight: "48px",
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
                {[
                  { label: "Donors", path: "/donors" },
                  { label: "Collections", path: "/collections" },
                  { label: "Settings", path: "/settings" },
                ].map((item) => (
                  <div
                    key={item.path}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.path);
                    }}
                    style={{
                      padding: "12px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {item.label}
                  </div>
                ))}

                <div
                  onClick={handleLogout}
                  style={{
                    padding: "12px 14px",
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

      <style jsx>{`
        @media (max-width: 900px) {
          .church-name {
            font-size: 0.85rem !important;
          }
        }

        @media (max-width: 640px) {
          .navbar-inner {
            display: flex !important;
            justify-content: space-between;
            gap: 8px !important;
          }

          .church-name {
            flex: 1;
            font-size: 0.75rem !important;
            min-width: 0;
          }

          .tithr-logo {
            height: 34px !important;
          }

          .brand-name {
            display: none;
          }

          .tour-button {
            padding: 9px 11px !important;
          }
        }

        @media (max-width: 420px) {
          .church-name {
            display: none;
          }

          .tour-button {
            width: 44px;
            height: 44px;
            padding: 0 !important;
            font-size: 1.2rem !important;
          }

          .tour-button-label {
            display: none;
          }
        }

        @media (max-width: 360px) {
          .navbar-inner {
            gap: 6px !important;
          }

          .tithr-logo {
            height: 30px !important;
          }

          .tour-button {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}