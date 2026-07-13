import { TripDetailClient } from "@/components/app/TripDetailClient";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetailClient tripId={id} />;
}
