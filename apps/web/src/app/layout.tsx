import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rynxpense — AI Trip Budget Planner",
  description:
    "Plan your trip with AI. Get day-by-day itineraries with estimated costs, then track spending during your journey.",
  keywords: [
    "trip budget planner",
    "travel itinerary",
    "AI travel planner",
    "Philippines travel budget",
    "expense tracker travel",
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
    title: "Rynxpense — AI Trip Budget Planner",
    description:
      "Tell us where you're going and your budget — get a day-by-day itinerary with estimated costs.",
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
    title: "Rynxpense — AI Trip Budget Planner",
    description:
      "Plan your trip with AI. Get day-by-day itineraries with estimated costs.",
    images: ["https://rynxpense.com/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
