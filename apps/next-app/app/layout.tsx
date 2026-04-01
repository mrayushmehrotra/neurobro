import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://neurobro.vercel.app";

export const viewport: Viewport = {
  themeColor: "#08080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NeuroBro — Free Brain Training Games Online",
    template: "%s · NeuroBro",
  },
  description:
    "NeuroBro offers free brain training games — memory match, mental math, Schulte table, typing speed, reaction time, and quick-read. Sharpen focus and cognition daily.",
  keywords: [
    "NeuroBro",
    "brain training",
    "brain games",
    "free brain training",
    "memory game",
    "mental math game",
    "schulte table",
    "reaction time test",
    "typing speed test",
    "speed reading game",
    "cognitive training",
    "focus training",
    "brain workout",
    "online brain games",
  ],
  authors: [{ name: "NeuroBro", url: BASE_URL }],
  creator: "NeuroBro",
  publisher: "NeuroBro",
  category: "Games",
  applicationName: "NeuroBro",

  // ── Canonical ──────────────────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
    shortcut: "/icon-192.png",
  },

  // ── Apple PWA ──────────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    title: "NeuroBro",
    statusBarStyle: "black-translucent",
    startupImage: "/icon-512.png",
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "NeuroBro",
    title: "NeuroBro — Free Brain Training Games Online",
    description:
      "Memory match, mental math, Schulte table, reaction training, typing speed & quick-read — all free at NeuroBro.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "NeuroBro — Free Brain Training Games",
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "NeuroBro — Free Brain Training Games",
    description:
      "Train memory, math speed, reaction time & reading speed — free at NeuroBro.",
    images: ["/logo.png"],
    creator: "@neurobro",
    site: "@neurobro",
  },

  // ── PWA ────────────────────────────────────────────────────────────────────
  manifest: "/manifest.json",

  // ── Crawling ───────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

// ── Sitewide JSON-LD ──────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "NeuroBro",
      description:
        "Free brain training games to sharpen memory, math, focus and reaction time.",
      publisher: { "@id": `${BASE_URL}/#organisation` },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organisation`,
      name: "NeuroBro",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: ["https://github.com/mrayushmehrotra/neurobro"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <head>
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NeuroBro" />
      </head>
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}