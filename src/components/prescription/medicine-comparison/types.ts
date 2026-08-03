import type { ImageSource } from "expo-image";
export interface ComparisonMedicine {
  id: string;
  saltComposition: string;
  prescribed: {
    name: string;
    manufacturer: string;
    packSize: string;
    image: ImageSource | null;
    mrp: number;
  };
  recommended: {
    id: string;
    productId?: string;
    slug: string;
    name: string;
    manufacturer: string;
    packSize: string;
    image: ImageSource | null;
    price: number;
    mrp: number;
    discountPercent: number;
  };
  quantity?: number;
}
