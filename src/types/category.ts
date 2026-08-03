import type { ImageSource } from "expo-image";

export interface CategoryProduct {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: ImageSource | null;
  discount?: string;
  discountPercent?: number;
  packSize?: string;
  unit?: string;
}

export interface CategoryProductCardProps {
  product: CategoryProduct;
  cardWidth: number;
  // Takes the product so callers can pass one stable callback per list.
  onPress: (product: CategoryProduct) => void;
}
