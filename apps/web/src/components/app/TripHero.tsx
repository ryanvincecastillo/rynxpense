import Image from "next/image";
import { getDestinationHeroImage } from "@/lib/destination-images";

export function TripHero({ destination }: { destination: string }) {
  const src = getDestinationHeroImage(destination);

  return (
    <div className="relative mb-6 h-40 overflow-hidden rounded-2xl shadow-md sm:h-48">
      <Image src={src} alt={destination} fill className="object-cover" sizes="800px" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Your trip</p>
        <h1 className="text-2xl font-bold sm:text-3xl">{destination}</h1>
      </div>
    </div>
  );
}
