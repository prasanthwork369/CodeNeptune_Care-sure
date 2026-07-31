export interface CategoryProduct {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: any;
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
