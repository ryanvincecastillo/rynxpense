import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Plan a DIY trip in pesos",
  description:
    "Enter your destination and peso budget. Rynxpense builds a named day-by-day DIY itinerary with stays, food, and activities you can share.",
  path: "/trips/new",
});

export default function NewTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
