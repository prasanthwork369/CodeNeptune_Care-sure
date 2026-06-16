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
  pincode?: string;
}

export interface HeroContent {
  heading: string;
  highlight: string;
  badge: string;
  image: ImageSource;
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
