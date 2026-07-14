export const colors = {
  primary: "#0283DF",
  primaryDark: "#026BB8",
  accent: "#FF5722",
  accentDark: "#E64A19",
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#333333",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#FCD34D",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
} as const;

export const categories = [
  { id: "beach", label: "Beach" },
  { id: "city", label: "City Break" },
  { id: "budget", label: "Budget" },
  { id: "family", label: "Family" },
  { id: "foodie", label: "Foodie" },
  { id: "adventure", label: "Adventure" },
] as const;

export type DestinationCategory = (typeof categories)[number]["id"];
export type DestinationRegion = "philippines" | "asia";

function dest(
  partial: {
    id: string;
    name: string;
    country: string;
    region: DestinationRegion;
    tags: DestinationCategory[];
    image: string;
    days: number;
    budgetFrom: number;
    badge: string;
    samplePlan: string;
    blurb?: string;
  },
) {
  return {
    ...partial,
    heroImage: partial.image.replace("w=800", "w=1400").replace("h=500", "h=800"),
    rating: 4.7,
    blurb:
      partial.blurb ??
      `A DIY-friendly ${partial.country} trip with clear peso budgets for stays, food, and activities.`,
  };
}

export const popularDestinations = [
  dest({
    id: "elnido",
    name: "El Nido",
    country: "Philippines",
    region: "philippines",
    tags: ["beach", "adventure"],
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 28000,
    badge: "Island classic",
    samplePlan: "Big Lagoon, island tours, sunset dinner",
    blurb: "Limestone cliffs, lagoons, and boat days — the DIY island itinerary Filipinos love.",
  }),
  dest({
    id: "boracay",
    name: "Boracay",
    country: "Philippines",
    region: "philippines",
    tags: ["beach", "family"],
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop",
    days: 3,
    budgetFrom: 18000,
    badge: "Weekend escape",
    samplePlan: "White Beach, island hopping, nightlife",
  }),
  dest({
    id: "siargao",
    name: "Siargao",
    country: "Philippines",
    region: "philippines",
    tags: ["beach", "adventure", "budget"],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 22000,
    badge: "Surf & chill",
    samplePlan: "Cloud 9, Magpupungko, island day trips",
  }),
  dest({
    id: "cebu",
    name: "Cebu",
    country: "Philippines",
    region: "philippines",
    tags: ["beach", "foodie", "family"],
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 20000,
    badge: "City + islands",
    samplePlan: "Kawasan, OsLob, lechon crawl",
  }),
  dest({
    id: "coron",
    name: "Coron",
    country: "Philippines",
    region: "philippines",
    tags: ["beach", "adventure"],
    image:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 26000,
    badge: "Kayangan views",
    samplePlan: "Shipwrecks, lagoons, island hopping",
  }),
  dest({
    id: "bohol",
    name: "Bohol",
    country: "Philippines",
    region: "philippines",
    tags: ["family", "adventure", "budget"],
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop",
    days: 3,
    budgetFrom: 16000,
    badge: "Chocolate Hills",
    samplePlan: "Panglao beach, tarsiers, countryside tour",
  }),
  dest({
    id: "palawan",
    name: "Puerto Princesa",
    country: "Philippines",
    region: "philippines",
    tags: ["adventure", "family"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 24000,
    badge: "Underground river",
    samplePlan: "Honda Bay, underground river, city eats",
  }),
  dest({
    id: "baguio",
    name: "Baguio",
    country: "Philippines",
    region: "philippines",
    tags: ["budget", "family", "foodie"],
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop",
    days: 3,
    budgetFrom: 10000,
    badge: "Cool escape",
    samplePlan: "Session Road, mines view, strawberry farms",
  }),
  dest({
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "asia",
    tags: ["city", "foodie"],
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
    days: 5,
    budgetFrom: 65000,
    badge: "Bucket list",
    samplePlan: "Shibuya, teamLab, Ichiran ramen",
  }),
  dest({
    id: "osaka",
    name: "Osaka",
    country: "Japan",
    region: "asia",
    tags: ["city", "foodie", "budget"],
    image:
      "https://images.unsplash.com/photo-1590559899731-a382839d8f3d?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 48000,
    badge: "Food city",
    samplePlan: "Dotonbori, Universal, day trip to Nara",
  }),
  dest({
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    region: "asia",
    tags: ["city", "foodie"],
    image:
      "https://images.unsplash.com/photo-1517154428043-feb7e033dce0?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 45000,
    badge: "K-culture",
    samplePlan: "Myeongdong, Gyeongbokgung, street food",
  }),
  dest({
    id: "busan",
    name: "Busan",
    country: "South Korea",
    region: "asia",
    tags: ["beach", "city", "foodie"],
    image:
      "https://images.unsplash.com/photo-1546412414-e1885259563a?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 42000,
    badge: "Beach city",
    samplePlan: "Haeundae, Gamcheon, seafood markets",
  }),
  dest({
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    region: "asia",
    tags: ["city", "foodie", "budget"],
    image:
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 28000,
    badge: "Street food",
    samplePlan: "Chatuchak, temples, night markets",
  }),
  dest({
    id: "chiangmai",
    name: "Chiang Mai",
    country: "Thailand",
    region: "asia",
    tags: ["budget", "adventure", "foodie"],
    image:
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 22000,
    badge: "North Thailand",
    samplePlan: "Old city temples, night bazaar, doikham",
  }),
  dest({
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "asia",
    tags: ["beach", "budget", "adventure"],
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 35000,
    badge: "Best value",
    samplePlan: "Ubud terraces, beach clubs, temples",
  }),
  dest({
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    region: "asia",
    tags: ["city", "foodie", "family"],
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop",
    days: 3,
    budgetFrom: 40000,
    badge: "Easy layover",
    samplePlan: "Marina Bay, hawkers, Gardens by the Bay",
  }),
  dest({
    id: "hongkong",
    name: "Hong Kong",
    country: "Hong Kong",
    region: "asia",
    tags: ["city", "foodie", "family"],
    image:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 38000,
    badge: "City classic",
    samplePlan: "Victoria Peak, Temple Street, dim sum",
  }),
  dest({
    id: "taipei",
    name: "Taipei",
    country: "Taiwan",
    region: "asia",
    tags: ["city", "foodie", "budget"],
    image:
      "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 32000,
    badge: "Night markets",
    samplePlan: "Shilin, Jiufen day trip, bubble tea trail",
  }),
  dest({
    id: "hanoi",
    name: "Hanoi",
    country: "Vietnam",
    region: "asia",
    tags: ["city", "foodie", "budget"],
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=500&fit=crop",
    days: 4,
    budgetFrom: 24000,
    badge: "Old Quarter",
    samplePlan: "Street food, Ha Long day trip, cafés",
  }),
  dest({
    id: "kualalumpur",
    name: "Kuala Lumpur",
    country: "Malaysia",
    region: "asia",
    tags: ["city", "foodie", "family"],
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop",
    days: 3,
    budgetFrom: 26000,
    badge: "Twin towers",
    samplePlan: "Batu Caves, Jalan Alor, malls",
  }),
] as const;

export type PopularDestination = (typeof popularDestinations)[number];
