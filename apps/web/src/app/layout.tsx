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
  openGraph: {
    title: "Rynxpense — AI Trip Budget Planner",
    description:
      "Tell us where you're going and your budget — get a day-by-day itinerary with estimated costs.",
    url: "https://rynxpense.com",
    siteName: "Rynxpense",
    type: "website",
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
