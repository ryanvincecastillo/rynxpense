import type { Metadata } from "next";

export const SITE_URL = "https://rynxpense.com";
export const SITE_NAME = "Rynxpense";

export const defaultTitle =
  "Rynxpense — DIY trip planner in pesos for Filipino travelers";

export const defaultDescription =
  "Plan DIY trips with a peso budget. Get named stays, food, and activities — then share your plan. Free for Filipino travelers, no account needed.";

type BuildMetaInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  /** Skip the root title template (use full title as-is). */
  absoluteTitle?: boolean;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = "/og-banner.png",
  noIndex = false,
  absoluteTitle = false,
}: BuildMetaInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_PH",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
