import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast"; // ✅ Correct import
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tithr — Church Offering & Collection Management",
    template: "%s | Tithr",
  },
  description:
    "Tithr helps churches record offerings, generate deposit reports, and manage weekly collections securely and efficiently.",

  keywords: [
    "church offering software",
    "tithe tracking",
    "church collection management",
    "offering reports",
    "church finance software",
    "tithing management",
  ],

  applicationName: "Tithr",

  openGraph: {
    title: "Tithr — Church Offering Management",
    description:
      "Record offerings, generate deposit slips, and export collection reports with Tithr.",
    type: "website",
  },

  metadataBase: new URL("https://tithr.app"), // change later when domain is live
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* ✅ Toast container goes here */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}