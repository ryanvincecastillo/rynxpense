import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  defaultDescription,
  defaultTitle,
} from "@/lib/seo";
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

export const viewport: Viewport = {
  themeColor: "#0283DF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  keywords: [
    "DIY trip planner Philippines",
    "peso travel budget planner",
    "AI itinerary Philippines",
    "travel budget PHP",
    "El Nido trip budget",
    "Tokyo trip planner pesos",
    "Filipino travel planner",
    "share travel itinerary",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "travel",
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
  alternates: {
    canonical: absoluteUrl("/home"),
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: absoluteUrl("/home"),
    siteName: SITE_NAME,
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: absoluteUrl("/og-banner.png"),
        width: 1200,
        height: 630,
        alt: "Rynxpense — DIY trip plans in pesos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [absoluteUrl("/og-banner.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" className={`${figtree.variable} ${bricolage.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
