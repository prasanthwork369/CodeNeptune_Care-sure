import type { ImageSource } from "expo-image";

export interface QuickAction {
  id: string;
  label: string;
  icon: ImageSource | number; // remote source, or a bundled asset's module id
  bgColor: string;
  iconColor: string;
}

export interface CategoryTab {
  id: string;
  label: string;
  emoji?: string;
  image?: ImageSource;
  imageActive?: ImageSource;
  imageInactive?: ImageSource;
}

export interface CategoryCard {
  id: string;
  slug: string;
  familySlug: string;
  label: string;
  image: ImageSource | null;
  bgColor: string;
  tabId: string;
}

export interface DeliveryLocation {
  label: string;
  city: string;
  /** Plain city name (e.g. "Chennai"), distinct from `city` which may hold
   * a full joined address string (line1, line2, city) for detailed display. */
  shortCity?: string;
  pincode?: string;
}

export interface HeroContent {
  heading: string;
  highlight: string;
  badge: string;
  image: ImageSource;
}

export interface TrustBadge {
  id: string;
  label: string;
  image: ImageSource | number;
}

export * from "./api.types";
