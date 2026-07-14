const destinationHeroMap: Record<string, string> = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop",
  seoul: "https://images.unsplash.com/photo-1517154428043-feb7e033dce0?w=1200&h=600&fit=crop",
  boracay: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop",
  elnido: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&h=600&fit=crop",
  siargao: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop",
  bangkok: "https://images.unsplash.com/photo-1563492065-608bda2b84d0?w=1200&h=600&fit=crop",
  hongkong: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&h=600&fit=crop",
  taipei: "https://images.unsplash.com/photo-1470004974150-b21a27bbc398?w=1200&h=600&fit=crop",
};

const defaultHero =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop";

export function getDestinationHeroImage(destination: string): string {
  const normalized = destination.toLowerCase().replace(/[^a-z]/g, "");

  for (const [key, url] of Object.entries(destinationHeroMap)) {
    if (normalized.includes(key)) return url;
  }

  return defaultHero;
}
