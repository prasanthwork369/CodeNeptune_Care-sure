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
}

export interface CategoryProductCardProps {
  product: CategoryProduct;
  cardWidth: number;
  onPress: () => void;
}
