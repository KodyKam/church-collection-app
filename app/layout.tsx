// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const dynamic = "force-dynamic"; //disabling caching so updates appear instantly

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://tithr.ca"),

  title: {
    default: "Tithr – Church Collection Management",
    template: "%s | Tithr",
  },

  description:
    "Track offerings, manage collections, and generate reports with ease.",

  openGraph: {
    title: "Tithr – Church Collection Management",
    description:
      "Track, manage, and report church offerings with ease.",
    url: "https://tithr.ca",
    siteName: "Tithr",
    images: [
      {
        url: "https://tithr.ca/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_CA",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Tithr – Church Collection Management",
    description:
      "Track, manage, and report church offerings with ease.",
    images: ["https://tithr.ca/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

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