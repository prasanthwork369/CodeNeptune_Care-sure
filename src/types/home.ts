import type { ImageSource } from "expo-image";

// ─── Component Props & UI Types ───────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: any; // Can be SVG component or ImageSource
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

/**
 * Default variant (variant[0]) used ONLY for add-to-cart, mirroring the web
 * ProductCard: the card keeps showing the base price, but the cart receives the
 * variant's identity and price. Absent when the list API doesn't expand variants.
 */
export interface DefaultVariant {
  id: string;
  mrp: number; // variant.price (the MRP)
  sellingPrice: number; // mrp * (1 - discount%)
  discountPercent: number;
  packSize?: string;
  unit?: string;
}

export interface Product {
  id: string;
  productId?: string;
  slug?: string;
  name: string;
  description: string;
  brand?: string;
  pack?: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  discountPercent?: number;
  image: ImageSource | null;
  requiresPrescription?: boolean;
  defaultVariant?: DefaultVariant;
  packSize?: string;
  unit?: string;
}

export interface SubstituteProduct extends Product {
  savings?: number;
}

export interface TrustBadge {
  id: string;
  label: string;
  image: any;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiHero {
  image: string;
  title: string;
  labelImage: string;
  status_text: string;
  highlighted_text: string[];
}

export interface ApiBanner {
  alt: string;
  link: string;
  imageUrl: string;
}

export interface ApiPromiseItem {
  label: string;
  iconUrl: string;
}

export interface ApiPromise {
  title: string;
  items: ApiPromiseItem[];
}

export interface ApiFooterLabel {
  icon: string;
  text: string;
}

export interface ApiFooter {
  title: string;
  labels: ApiFooterLabel[];
  iconUrl: string;
  imageUrl: string;
}

export interface ApiAppContent {
  hero: ApiHero;
  banners: ApiBanner[];
  promise: ApiPromise;
  footer: ApiFooter;
}

export interface AppContentResponse {
  success: boolean;
  data: ApiAppContent;
}
