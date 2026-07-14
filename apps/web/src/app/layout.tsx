import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rynxpense — Turn travel inspo into a peso plan",
  description:
    "Paste TikTok, Instagram, and Reddit saves. Get named stays, food, and activities with peso estimates and a budget reality check.",
  keywords: [
    "trip budget planner",
    "TikTok travel itinerary",
    "Philippines travel budget",
    "peso trip planner",
    "social media travel inspiration",
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
    title: "Rynxpense — Turn travel inspo into a peso plan",
    description:
      "Paste your TikTok and IG saves — get a realistic trip plan in pesos with named stays and food.",
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
