import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rynxpense — DIY trip plans in pesos for Filipino travelers",
  description:
    "Plan the trip yourself. Know the pesos before you book. Named stays, food, and activities — then share your plan to Facebook, X, or group chats.",
  keywords: [
    "DIY trip planner",
    "peso trip planner",
    "Philippines travel budget",
    "AI itinerary PHP",
    "share travel itinerary",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
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
    <html lang="en" className={`${figtree.variable} ${bricolage.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
