import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rynxpense — Named trip plans with a peso reality check",
  description:
    "Set your destination and budget. Get a named itinerary in pesos — stays, food, and activities — plus a reality check before you book. Free, no account required.",
  keywords: [
    "trip budget planner",
    "peso trip planner",
    "Philippines travel budget",
    "AI itinerary PHP",
    "travel affordability",
  ],
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Rynxpense — Named trip plans with a peso reality check",
    description:
      "Destination + budget in. Named plan + peso reality check out. Free for Filipino travelers.",
    url: "https://rynxpense.com",
    siteName: "Rynxpense",
    type: "website",
    images: [
      {
        url: "https://rynxpense.com/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Rynxpense — AI Trip Budget Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rynxpense — Peso trip planner",
    description:
      "Can you afford the trip? Get a named plan in pesos before you book.",
    images: ["https://rynxpense.com/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${syne.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
