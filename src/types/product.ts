import { ReactNode } from "react";

export interface ProductDetailsHeaderProps {
  title?: string;
  backgroundColor?: string;
  showBorder?: boolean;
  onBack?: () => void;
  productId?: string;
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
    image?: any;
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
