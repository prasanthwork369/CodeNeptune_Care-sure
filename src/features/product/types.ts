import { ReactNode } from "react";
import type { ImageSource } from "expo-image";

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
