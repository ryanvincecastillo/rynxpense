export const colors = {
  primary: "#0283DF",
  primaryDark: "#026BB8",
  accent: "#FF5722",
  accentDark: "#E64A19",
  background: "#F7F9FC",
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
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "city", label: "City Break", emoji: "🏙️" },
  { id: "budget", label: "Budget", emoji: "💰" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "foodie", label: "Foodie", emoji: "🍜" },
  { id: "adventure", label: "Adventure", emoji: "🎿" },
] as const;

export const popularDestinations = [
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop",
    days: 5,
    budgetFrom: 65000,
    rating: 4.9,
    badge: "TikTok favorite",
    samplePlan: "Shibuya, teamLab, Ichiran ramen",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop",
    days: 4,
    budgetFrom: 35000,
    rating: 4.8,
    badge: "Best value",
    samplePlan: "Ubud rice terraces, beach clubs",
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    image:
      "https://images.unsplash.com/photo-1517154428043-feb7e033dce0?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1517154428043-feb7e033dce0?w=1200&h=600&fit=crop",
    days: 4,
    budgetFrom: 45000,
    rating: 4.7,
    badge: "IG hotspot",
    samplePlan: "Myeongdong, Gyeongbokgung, street food",
  },
  {
    id: "boracay",
    name: "Boracay",
    country: "Philippines",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
    days: 3,
    budgetFrom: 18000,
    rating: 4.8,
    badge: "Local favorite",
    samplePlan: "White Beach, island hopping",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop",
    days: 3,
    budgetFrom: 40000,
    rating: 4.9,
    badge: "Reddit pick",
    samplePlan: "Marina Bay, hawker food, Gardens by the Bay",
  },
  {
    id: "elnido",
    name: "El Nido",
    country: "Philippines",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&h=600&fit=crop",
    days: 4,
    budgetFrom: 28000,
    rating: 4.9,
    badge: "TikTok viral",
    samplePlan: "Big Lagoon, island tours",
  },
  {
    id: "siargao",
    name: "Siargao",
    country: "Philippines",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&h=320&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop",
    days: 4,
    budgetFrom: 22000,
    rating: 4.8,
    badge: "Surf & chill",
    samplePlan: "Cloud 9, Magpupungko pools",
  },
] as const;
