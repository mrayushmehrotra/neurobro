import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#08080f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NeuroBro — Brain Training Games",
    template: "%s · NeuroBro",
  },
  description:
    "Train your memory, math speed, focus, and reaction time with science-backed mini-games. Free, in-browser brain training.",
  keywords: ["brain training", "memory game", "mental math", "schulte table", "reaction time", "cognitive training"],
  authors: [{ name: "NeuroBro" }],
  creator: "NeuroBro",

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "NeuroBro",
    title: "NeuroBro — Brain Training Games",
    description:
      "Memory match, mental math, Schulte table, and reaction training — all free, right in your browser.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "NeuroBro — Brain Training Games",
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "NeuroBro — Brain Training Games",
    description:
      "Free brain training games: memory, math, Schulte table & reaction training.",
    images: ["/logo.png"],
    creator: "@neurobro",
  },

  // ── PWA manifest hints ─────────────────────────────────────────────────────
  manifest: undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <Head>
        <link rel="icon" href="/icon-192.png" />
      </Head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}