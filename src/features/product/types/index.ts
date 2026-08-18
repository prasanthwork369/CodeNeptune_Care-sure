import { ReactNode } from "react";
import type { ImageSource } from "expo-image";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";

// ─── Truly Shared Canonical Product Types ─────────────────────────────────────

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

// ─── Domain & UI Types for Product Sections ───────────────────────────────────

export interface SafetyAdviceItem {
  image?: string;
  label?: string;
  title?: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface KeyValueRow {
  label: string;
  value: string;
}

interface SectionBase {
  /** The additionalData key, e.g. "shortDescription" — stable across renders. */
  id: string;
  /** Full heading from the API, e.g. "Possible Side Effects of Zonegran Tablet". */
  title: string;
  /** Short tab label, e.g. "Side Effects" — the title is far too long for a tab strip. */
  label: string;
  sortOrder: number;
}

// Discriminated on designType so each renderer gets exactly the shape it needs.
export type ProductSection =
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.TEXT_BLOCK;
      html: string;
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.BULLET_LIST;
      points: string[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.FAQ_ACCORDION;
      faqs: FaqItem[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS;
      items: SafetyAdviceItem[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.KEY_VALUE_TABLE;
      rows: KeyValueRow[];
    });

// ─── Component Props ─────────────────────────────────────────────────────────

export interface ProductDetailsHeaderProps {
  title?: string;
  backgroundColor?: string;
  showBorder?: boolean;
  onBack?: () => void;
  productId?: string;
  // Carried through so the share link matches the web's /{productType}/{slug}/{id} route.
  productType?: number;
  slug?: string;
  packLabel?: string;
  price?: number;
  manufacturer?: string;
  dosageForm?: string;
}

export interface ProductDetailsFooterProps {
  productId: string;
  medicineUuid?: string;
  baseMedicineId?: string;
  variantId?: string | null;
  product: {
    name: string;
    slug?: string;
    price: number;
    originalPrice?: number;
    savingsPercent?: number;
    requiresPrescription?: boolean;
    image?: ImageSource | null;
    packSize?: string; // formatted e.g. "50 ml"
    unit?: string; // e.g. "ml"
  };
  safeAreaBottom: number;
  onViewCart: () => void;
  hideAddButton?: boolean;
}

export interface ProductDetailsLayoutProps {
  header: ReactNode;
  isLoading: boolean;
  skeleton: ReactNode;
  isEmpty: boolean;
  topSection: ReactNode;
  saltComposition: string | null;
  manufacturer: string;
  medicineName: string;
  pincode?: string;
  onChangeLocation: () => void;
  locationSheetVisible: boolean;
  onCloseLocationSheet: () => void;
}

export * from "./api.types";
