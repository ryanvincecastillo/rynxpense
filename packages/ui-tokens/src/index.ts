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
    image: "/destinations/tokyo.jpg",
    days: 5,
    budgetFrom: 65000,
    rating: 4.9,
    badge: "AI Pick",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    image: "/destinations/bali.jpg",
    days: 4,
    budgetFrom: 35000,
    rating: 4.8,
    badge: "Best value",
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    image: "/destinations/seoul.jpg",
    days: 4,
    budgetFrom: 45000,
    rating: 4.7,
    badge: null,
  },
  {
    id: "boracay",
    name: "Boracay",
    country: "Philippines",
    image: "/destinations/boracay.jpg",
    days: 3,
    budgetFrom: 18000,
    rating: 4.8,
    badge: "Local favorite",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    image: "/destinations/singapore.jpg",
    days: 3,
    budgetFrom: 40000,
    rating: 4.9,
    badge: null,
  },
] as const;
